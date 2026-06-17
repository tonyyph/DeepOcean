import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Platform } from "react-native";
import type { DiveSession, DiveSessionStatus } from "@/domain/entities";
import type { Discovery } from "@/features/ocean/discoveryEngine";
import { rollDiscoveries } from "@/features/ocean/discoveryEngine";
import {
  minutesToDepth,
  depthToZone,
  type OceanZone,
} from "@/features/ocean/zones";
import { container } from "@/data/container";
import {
  hapticDiscovery,
  hapticDiveStart,
  hapticDiveSurface,
  hapticZoneChange,
} from "@/core/haptics";
import { AmbientAudio } from "@/core/audio/AmbientAudioManager";
import { computeLevelUp, xpForSession } from "@/features/diver/levelSystem";
import { computeStreak } from "@/features/diver/streakEngine";
import {
  checkNewAchievements,
  type TitleAchievement,
} from "@/features/diver/titleAchievements";
import { useAchievements } from "./achievementStore";
import { useSettings } from "./settingsStore";
import { NotificationService } from "@/core/notifications/NotificationService";
import { getDiveNotificationConfig } from "@/core/config/diveNotificationConfig";
import { translations, type Language } from "@/core/i18n/translations";
import { DeepOceanLiveActivity } from "@/core/live-activity/DeepOceanLiveActivity";

/**
 * Dive session store — single source of truth for the active dive.
 *
 * Architecture choice: keep the *engine* (tick logic, side effects) inside
 * the store so screens stay pure. Components only call `start/pause/end`
 * and read derived values via fine-grained selectors.
 */

type State = {
  session: DiveSession | null;
  // engine internals
  _intervalHandle: ReturnType<typeof setInterval> | null;
  _lastRollMinute: number;
  _pausedStartedAt: number | null;
  _pausedAccumulatedMs: number;
  _completionNotificationId: string | null;
  _activeNotificationId: string | null;
  /** Set after end() — level up info to show to the player (null = no level up). */
  pendingLevelUp: { from: number; to: number } | null;
  /** Ordered list of title achievements unlocked this dive. */
  pendingAchievements: TitleAchievement[];
};

type Actions = {
  start: (targetMinutes: number | null) => void;
  pause: () => void;
  resume: () => void;
  end: (options?: { notifyCompletion?: boolean }) => Promise<void>;
  cancel: () => void;
  /** Clear pending rewards after the UI has consumed them. */
  clearPendingRewards: () => void;
  /** Internal — used by setInterval. Exposed for testability. */
  tick: () => void;
};

const TICK_MS = 1000;

type AdvancedSession = {
  session: DiveSession;
  lastRollMinute: number;
};

function elapsedFromClock(
  session: DiveSession,
  pausedAccumulatedMs: number,
  pausedStartedAt: number | null,
  now: number,
): number {
  const clockNow =
    session.status === "paused" && pausedStartedAt ? pausedStartedAt : now;
  return Math.max(
    0,
    Math.floor((clockNow - session.startedAt - pausedAccumulatedMs) / 1000),
  );
}

function advanceSession(
  session: DiveSession,
  lastRollMinute: number,
  pausedAccumulatedMs: number,
  pausedStartedAt: number | null,
  now: number,
  runEffects: boolean,
): AdvancedSession {
  if (session.status !== "diving") {
    return { session, lastRollMinute };
  }

  const nextElapsed = elapsedFromClock(
    session,
    pausedAccumulatedMs,
    pausedStartedAt,
    now,
  );
  if (nextElapsed <= session.elapsedSeconds) {
    return { session, lastRollMinute };
  }

  const minutes = nextElapsed / 60;
  const depth = minutesToDepth(minutes);
  const zone: OceanZone = depthToZone(depth);

  if (runEffects && zone !== session.zone) {
    hapticZoneChange(zone);
    void AmbientAudio.setZone(zone);
  }

  let nextRollMinute = lastRollMinute;
  let discoveries = session.discoveries;
  const floorMinute = Math.floor(minutes);
  if (floorMinute > lastRollMinute) {
    const fresh = rollDiscoveries(
      session.seed,
      zone,
      lastRollMinute,
      floorMinute,
    );
    if (fresh.length > 0) {
      if (runEffects) fresh.forEach(() => hapticDiscovery());
      discoveries = [...discoveries, ...fresh];
    }
    nextRollMinute = floorMinute;
  }

  return {
    session: {
      ...session,
      elapsedSeconds: nextElapsed,
      depthMeters: depth,
      zone,
      discoveries,
    },
    lastRollMinute: nextRollMinute,
  };
}

function diveCompletionAt(
  session: DiveSession,
  pausedAccumulatedMs: number,
): number | null {
  if (session.targetSeconds === null) return null;
  return session.startedAt + session.targetSeconds * 1000 + pausedAccumulatedMs;
}

async function armDiveNotifications(
  session: DiveSession,
  pausedAccumulatedMs: number,
): Promise<{ completionId: string | null; activeId: string | null }> {
  const completionAt = diveCompletionAt(session, pausedAccumulatedMs);
  if (!completionAt && Platform.OS !== "android") {
    return { completionId: null, activeId: null };
  }
  const granted = await NotificationService.requestPermission();
  if (!granted) return { completionId: null, activeId: null };

  const language = (useSettings.getState().language ?? "en") as Language;
  const copy = translations[language].notifications;
  const config = getDiveNotificationConfig();

  const [completionId, activeId] = await Promise.all([
    completionAt && completionAt > Date.now()
      ? NotificationService.scheduleDiveCompletion({
          fireAt: completionAt,
          title: copy.diveCompleteTitle,
          body: copy.diveCompleteBody,
          sound: config.completionSound,
          channelName: copy.completionChannel,
        })
      : Promise.resolve(null),
    NotificationService.showActiveDive({
      title: copy.activeDiveTitle,
      body: copy.activeDiveBody,
      channelName: copy.activeDiveChannel,
    }),
  ]);

  return { completionId, activeId };
}

async function clearDiveNotifications(
  completionId: string | null,
  activeId: string | null,
): Promise<void> {
  await Promise.all([
    NotificationService.cancelScheduled(completionId),
    NotificationService.dismissPresented(completionId),
    NotificationService.cancelScheduled(activeId),
    NotificationService.dismissPresented(activeId),
  ]);
}

async function notifyDiveCompletionNow(): Promise<void> {
  const granted = await NotificationService.requestPermission();
  if (!granted) return;
  const language = (useSettings.getState().language ?? "en") as Language;
  const copy = translations[language].notifications;
  const config = getDiveNotificationConfig();
  await NotificationService.notifyDiveCompletionNow({
    title: copy.diveCompleteTitle,
    body: copy.diveCompleteBody,
    sound: config.completionSound,
    channelName: copy.completionChannel,
  });
}

export const useDiveSession = create<State & Actions>()(
  subscribeWithSelector((set, get) => ({
    session: null,
    _intervalHandle: null,
    _lastRollMinute: 0,
    _pausedStartedAt: null,
    _pausedAccumulatedMs: 0,
    _completionNotificationId: null,
    _activeNotificationId: null,
    pendingLevelUp: null,
    pendingAchievements: [],

    start: (targetMinutes) => {
      // Guard: if a dive is already active, do nothing.
      if (get().session && get().session?.status === "diving") return;
      const seed = Math.floor(Math.random() * 0xffffffff);
      const session: DiveSession = {
        id: `dive_${Date.now()}`,
        startedAt: Date.now(),
        endedAt: null,
        targetSeconds: targetMinutes ? targetMinutes * 60 : null,
        elapsedSeconds: 0,
        status: "diving",
        zone: "surface",
        depthMeters: 0,
        oxygenPct: 1,
        discoveries: [],
        seed,
      };
      hapticDiveStart();
      AmbientAudio.setAmbientVolume(useSettings.getState().ambientVolume);
      void AmbientAudio.init().then(() => AmbientAudio.setZone("surface"));
      const handle = setInterval(() => get().tick(), TICK_MS);
      set({
        session,
        _intervalHandle: handle,
        _lastRollMinute: 0,
        _pausedStartedAt: null,
        _pausedAccumulatedMs: 0,
        _completionNotificationId: null,
        _activeNotificationId: null,
      });
      void DeepOceanLiveActivity.start(session);
      void armDiveNotifications(session, 0).then(
        ({ completionId, activeId }) => {
          const current = get().session;
          if (current?.id !== session.id || current.status !== "diving") {
            void clearDiveNotifications(completionId, activeId);
            return;
          }
          set({
            _completionNotificationId: completionId,
            _activeNotificationId: activeId,
          });
        },
      );
    },

    pause: () => {
      const {
        session,
        _intervalHandle,
        _lastRollMinute,
        _pausedAccumulatedMs,
        _completionNotificationId,
        _activeNotificationId,
      } = get();
      if (!session || session.status !== "diving") return;
      const advanced = advanceSession(
        session,
        _lastRollMinute,
        _pausedAccumulatedMs,
        null,
        Date.now(),
        true,
      );
      if (_intervalHandle) clearInterval(_intervalHandle);
      void clearDiveNotifications(
        _completionNotificationId,
        _activeNotificationId,
      );
      void DeepOceanLiveActivity.update({
        ...advanced.session,
        status: "paused",
      });
      set({
        _intervalHandle: null,
        _lastRollMinute: advanced.lastRollMinute,
        _pausedStartedAt: Date.now(),
        _completionNotificationId: null,
        _activeNotificationId: null,
        session: { ...advanced.session, status: "paused" },
      });
    },

    resume: () => {
      const { session, _pausedStartedAt, _pausedAccumulatedMs } = get();
      if (!session || session.status !== "paused") return;
      const now = Date.now();
      const pausedDelta = _pausedStartedAt ? now - _pausedStartedAt : 0;
      const nextPausedAccumulatedMs = _pausedAccumulatedMs + pausedDelta;
      const handle = setInterval(() => get().tick(), TICK_MS);
      const resumed = { ...session, status: "diving" as const };
      set({
        _intervalHandle: handle,
        _pausedStartedAt: null,
        _pausedAccumulatedMs: nextPausedAccumulatedMs,
        _completionNotificationId: null,
        _activeNotificationId: null,
        session: resumed,
      });
      void DeepOceanLiveActivity.update(resumed);
      void armDiveNotifications(resumed, nextPausedAccumulatedMs).then(
        ({ completionId, activeId }) => {
          const current = get().session;
          if (current?.id !== resumed.id || current.status !== "diving") {
            void clearDiveNotifications(completionId, activeId);
            return;
          }
          set({
            _completionNotificationId: completionId,
            _activeNotificationId: activeId,
          });
        },
      );
    },

    cancel: () => {
      const {
        _intervalHandle,
        _completionNotificationId,
        _activeNotificationId,
      } = get();
      if (_intervalHandle) clearInterval(_intervalHandle);
      void AmbientAudio.stopAll();
      void clearDiveNotifications(
        _completionNotificationId,
        _activeNotificationId,
      );
      void DeepOceanLiveActivity.end(get().session?.id);
      set({
        session: null,
        _intervalHandle: null,
        _lastRollMinute: 0,
        _pausedStartedAt: null,
        _pausedAccumulatedMs: 0,
        _completionNotificationId: null,
        _activeNotificationId: null,
      });
    },

    clearPendingRewards: () => {
      set({ pendingLevelUp: null, pendingAchievements: [] });
    },

    end: async (options) => {
      const {
        session,
        _intervalHandle,
        _lastRollMinute,
        _pausedAccumulatedMs,
        _pausedStartedAt,
        _completionNotificationId,
        _activeNotificationId,
      } = get();
      if (!session) return;
      if (_intervalHandle) clearInterval(_intervalHandle);
      const advanced = advanceSession(
        session,
        _lastRollMinute,
        _pausedAccumulatedMs,
        _pausedStartedAt,
        Date.now(),
        false,
      );
      const finalSession = advanced.session;
      await clearDiveNotifications(
        _completionNotificationId,
        _activeNotificationId,
      );
      void DeepOceanLiveActivity.end(finalSession.id);
      if (options?.notifyCompletion) {
        void notifyDiveCompletionNow();
      }
      hapticDiveSurface();
      await AmbientAudio.stopAll();

      const profile = await container.diver.get();
      const earnedXp = xpForSession(
        finalSession.elapsedSeconds,
        finalSession.discoveries.length,
      );
      const {
        level: newLevel,
        xp: newXp,
        levelsGained,
      } = computeLevelUp(profile.level, profile.xp, earnedXp);

      const ended: DiveSession = {
        ...finalSession,
        status: "surfaced",
        endedAt: Date.now(),
        summary: {
          xpEarned: earnedXp,
          levelBefore: profile.level,
          levelAfter: newLevel,
          levelsGained,
        },
      };
      await container.sessions.save(ended);
      // record discoveries to collection + bump diver stats
      await Promise.all(
        ended.discoveries.map((d) =>
          container.collection.recordSighting(d.entry.id),
        ),
      );

      // Recompute streak deterministically from full dive history (including
      // the dive just saved). Source of truth is the timestamps, never a
      // stored counter — this is self-healing across missed days / clock changes.
      const allSessions = await container.sessions.list();
      const streak = computeStreak(
        allSessions.map((d) => d.startedAt),
        ended.endedAt ?? Date.now(),
      );

      const updatedProfile = await container.diver.update({
        totalDives: profile.totalDives + 1,
        totalFocusMinutes:
          profile.totalFocusMinutes + Math.round(ended.elapsedSeconds / 60),
        xp: newXp,
        level: newLevel,
        currentStreakDays: streak.current,
        longestStreakDays: Math.max(profile.longestStreakDays, streak.longest),
      });

      // Check title achievements against updated profile
      const collectionEntries = await container.collection.all();
      const collectionCount = collectionEntries.filter(
        (e) => e.count > 0,
      ).length;
      const achStore = useAchievements.getState();
      const alreadyUnlocked = achStore.unlockedTitleAchievements;
      const newAchievements = checkNewAchievements(
        updatedProfile,
        { collectionCount },
        alreadyUnlocked,
      );
      achStore.persistTitleAchievements(newAchievements);

      set({
        session: ended,
        _intervalHandle: null,
        _lastRollMinute: advanced.lastRollMinute,
        _pausedStartedAt: null,
        _pausedAccumulatedMs: 0,
        _completionNotificationId: null,
        _activeNotificationId: null,
        pendingLevelUp:
          levelsGained > 0 ? { from: profile.level, to: newLevel } : null,
        pendingAchievements: newAchievements,
      });
    },

    tick: () => {
      const state = get();
      const s = state.session;
      if (!s || s.status !== "diving") return;

      const advanced = advanceSession(
        s,
        state._lastRollMinute,
        state._pausedAccumulatedMs,
        state._pausedStartedAt,
        Date.now(),
        true,
      );
      const updated = advanced.session;

      // Auto-surface if user reached target
      const reachedTarget =
        updated.targetSeconds !== null &&
        updated.elapsedSeconds >= updated.targetSeconds;

      if (reachedTarget) {
        set({ session: updated, _lastRollMinute: advanced.lastRollMinute });
        void DeepOceanLiveActivity.update(updated);
        const completionAt = diveCompletionAt(
          updated,
          state._pausedAccumulatedMs,
        );
        const shouldNotifyNow =
          completionAt === null || Date.now() - completionAt < 2000;
        get().end({ notifyCompletion: shouldNotifyNow });
        return;
      }
      set({ session: updated, _lastRollMinute: advanced.lastRollMinute });
      void DeepOceanLiveActivity.update(updated);
    },
  })),
);

// Selectors — components import these directly so Zustand can shallow-compare.
export const selectStatus = (s: State): DiveSessionStatus =>
  s.session?.status ?? "idle";
export const selectElapsedSeconds = (s: State): number =>
  s.session?.elapsedSeconds ?? 0;
export const selectDepth = (s: State): number => s.session?.depthMeters ?? 0;
export const selectZone = (s: State): OceanZone => s.session?.zone ?? "surface";
export const selectDiscoveries = (s: State): Discovery[] =>
  s.session?.discoveries ?? [];
