import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DiveSession, DiveSessionStatus } from "@/domain/entities";
import type { Discovery } from "@/features/ocean/discoveryEngine";
import { rollDiscoveries } from "@/features/ocean/discoveryEngine";
import {
  minutesToDepth,
  depthToZone,
  type OceanZone
} from "@/features/ocean/zones";
import { container } from "@/data/container";
import {
  hapticDiscovery,
  hapticDiveStart,
  hapticDiveSurface,
  hapticZoneChange
} from "@/core/haptics";
import { AmbientAudio } from "@/core/audio/AmbientAudioManager";
import { computeLevelUp } from "@/features/diver/levelSystem";
import {
  checkNewAchievements,
  type TitleAchievement
} from "@/features/diver/titleAchievements";
import { useAchievements } from "./achievementStore";

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
  /** Set after end() — level up info to show to the player (null = no level up). */
  pendingLevelUp: { from: number; to: number } | null;
  /** Ordered list of title achievements unlocked this dive. */
  pendingAchievements: TitleAchievement[];
};

type Actions = {
  start: (targetMinutes: number | null) => void;
  pause: () => void;
  resume: () => void;
  end: () => Promise<void>;
  cancel: () => void;
  /** Clear pending rewards after the UI has consumed them. */
  clearPendingRewards: () => void;
  /** Internal — used by setInterval. Exposed for testability. */
  tick: () => void;
};

const TICK_MS = 1000;

export const useDiveSession = create<State & Actions>()(
  subscribeWithSelector((set, get) => ({
    session: null,
    _intervalHandle: null,
    _lastRollMinute: 0,
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
        seed
      };
      hapticDiveStart();
      AmbientAudio.init().then(() => AmbientAudio.setZone("surface"));
      const handle = setInterval(() => get().tick(), TICK_MS);
      set({ session, _intervalHandle: handle, _lastRollMinute: 0 });
    },

    pause: () => {
      const { session, _intervalHandle } = get();
      if (!session || session.status !== "diving") return;
      if (_intervalHandle) clearInterval(_intervalHandle);
      set({
        _intervalHandle: null,
        session: { ...session, status: "paused" }
      });
    },

    resume: () => {
      const { session } = get();
      if (!session || session.status !== "paused") return;
      const handle = setInterval(() => get().tick(), TICK_MS);
      set({
        _intervalHandle: handle,
        session: { ...session, status: "diving" }
      });
    },

    cancel: () => {
      const { _intervalHandle } = get();
      if (_intervalHandle) clearInterval(_intervalHandle);
      set({ session: null, _intervalHandle: null, _lastRollMinute: 0 });
    },

    clearPendingRewards: () => {
      set({ pendingLevelUp: null, pendingAchievements: [] });
    },

    end: async () => {
      const { session, _intervalHandle } = get();
      if (!session) return;
      if (_intervalHandle) clearInterval(_intervalHandle);
      const ended: DiveSession = {
        ...session,
        status: "surfaced",
        endedAt: Date.now()
      };
      hapticDiveSurface();
      await AmbientAudio.stopAll();
      await container.sessions.save(ended);
      // record discoveries to collection + bump diver stats
      await Promise.all(
        ended.discoveries.map((d) =>
          container.collection.recordSighting(d.entry.id)
        )
      );
      const profile = await container.diver.get();
      const earnedXp =
        Math.round(ended.elapsedSeconds / 6) + ended.discoveries.length * 25;
      const {
        level: newLevel,
        xp: newXp,
        levelsGained
      } = computeLevelUp(profile.level, profile.xp, earnedXp);
      const updatedProfile = await container.diver.update({
        totalDives: profile.totalDives + 1,
        totalFocusMinutes:
          profile.totalFocusMinutes + Math.round(ended.elapsedSeconds / 60),
        xp: newXp,
        level: newLevel
      });

      // Check title achievements against updated profile
      const collectionEntries = await container.collection.all();
      const collectionCount = collectionEntries.filter(
        (e) => e.count > 0
      ).length;
      const achStore = useAchievements.getState();
      const alreadyUnlocked = achStore.unlockedTitleAchievements;
      const newAchievements = checkNewAchievements(
        updatedProfile,
        { collectionCount },
        alreadyUnlocked
      );
      achStore.persistTitleAchievements(newAchievements);

      set({
        session: ended,
        _intervalHandle: null,
        pendingLevelUp:
          levelsGained > 0 ? { from: profile.level, to: newLevel } : null,
        pendingAchievements: newAchievements
      });
    },

    tick: () => {
      const state = get();
      const s = state.session;
      if (!s || s.status !== "diving") return;

      const nextElapsed = s.elapsedSeconds + 1;
      const minutes = nextElapsed / 60;
      const depth = minutesToDepth(minutes);
      const zone: OceanZone = depthToZone(depth);

      // Auto-surface if user reached target
      const reachedTarget =
        s.targetSeconds !== null && nextElapsed >= s.targetSeconds;

      // Zone change side effects (audio + haptics)
      if (zone !== s.zone) {
        hapticZoneChange(zone);
        AmbientAudio.setZone(zone);
      }

      // Roll discoveries each minute boundary
      let discoveries = s.discoveries;
      if (Math.floor(minutes) > state._lastRollMinute) {
        const fresh = rollDiscoveries(
          s.seed,
          zone,
          state._lastRollMinute,
          Math.floor(minutes)
        );
        if (fresh.length > 0) {
          fresh.forEach(() => hapticDiscovery());
          discoveries = [...discoveries, ...fresh];
        }
        set({ _lastRollMinute: Math.floor(minutes) });
      }

      const updated: DiveSession = {
        ...s,
        elapsedSeconds: nextElapsed,
        depthMeters: depth,
        zone,
        discoveries
      };

      if (reachedTarget) {
        set({ session: updated });
        get().end();
        return;
      }
      set({ session: updated });
    }
  }))
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
