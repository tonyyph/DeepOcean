import { StorageKeys, storage } from "@/core/storage/mmkv";
import { publishWidgetSnapshot } from "@/core/widget/WidgetSnapshotBridge";
import { container } from "@/data/container";
import { ZONE_TABLE } from "@/features/ocean/zones";
import { useDiveSession, usePremium, useSettings } from "@/stores";
import { getWidgetFocusMetrics } from "./metrics";
import { getWidgetPrimaryAction } from "./policy";
import type { WidgetSnapshot } from "./types";
import type { DiveSession } from "@/domain/entities";

let writeInFlight: Promise<void> | null = null;
let writeQueued = false;

function isActiveSession(
  session: DiveSession | null
): session is DiveSession & { status: "diving" | "paused" } {
  return session?.status === "diving" || session?.status === "paused";
}

export async function buildWidgetSnapshot(
  now = Date.now()
): Promise<WidgetSnapshot> {
  const dive = useDiveSession.getState();
  const premium = usePremium.getState();
  const settings = useSettings.getState();
  const [profile, sessions, collection] = await Promise.all([
    container.diver.get(),
    container.sessions.list(),
    container.collection.all()
  ]);
  const todayStartDate = new Date(now);
  todayStartDate.setHours(0, 0, 0, 0);
  const todayStart = todayStartDate.getTime();
  const activeSession = isActiveSession(dive.session) ? dive.session : null;
  const persistedMetrics = getWidgetFocusMetrics(sessions, now);
  const activeMinutes =
    activeSession && activeSession.startedAt >= todayStart
      ? Math.round(activeSession.elapsedSeconds / 60)
      : 0;
  const latestDive = activeSession ?? sessions[0] ?? null;
  const dailyTargetMinutes = Math.max(5, settings.preferredSessionMinutes);

  return {
    schemaVersion: 3,
    capturedAt: now,
    isPremium: premium.isPremium,
    language: settings.language,
    preferredMinutes: settings.preferredSessionMinutes,
    streakDays: profile.currentStreakDays,
    todayFocusMinutes: persistedMetrics.todayMinutes + activeMinutes,
    dailyTargetMinutes,
    weeklyFocusMinutes: persistedMetrics.weekMinutes + activeMinutes,
    weeklyTargetMinutes: dailyTargetMinutes * 5,
    currentZone: latestDive ? ZONE_TABLE[latestDive.zone].label : ZONE_TABLE.surface.label,
    currentDepthMeters: Math.round(latestDive?.depthMeters ?? 0),
    discoveryCount: collection.filter((entry) => entry.count > 0).length,
    totalDives: profile.totalDives,
    session: activeSession
      ? {
          id: activeSession.id,
          status: activeSession.status,
          startedAt: activeSession.startedAt,
          elapsedSeconds: activeSession.elapsedSeconds,
          targetSeconds: activeSession.targetSeconds,
          expectedEndAt:
            activeSession.status === "diving" &&
            activeSession.targetSeconds !== null
              ? activeSession.startedAt +
                activeSession.targetSeconds * 1000 +
                dive._pausedAccumulatedMs
              : null
        }
      : null,
    primaryAction: getWidgetPrimaryAction(activeSession)
  };
}

async function performWidgetSnapshotWrite(): Promise<void> {
  const snapshot = await buildWidgetSnapshot();
  const serialized = JSON.stringify(snapshot);
  storage.set(StorageKeys.widgetSnapshot, serialized);
  publishWidgetSnapshot(serialized);
}

export async function writeWidgetSnapshot(): Promise<void> {
  if (writeInFlight) {
    writeQueued = true;
    return writeInFlight;
  }
  writeInFlight = (async () => {
    do {
      writeQueued = false;
      await performWidgetSnapshotWrite();
    } while (writeQueued);
  })().finally(() => {
    writeInFlight = null;
  });
  return writeInFlight;
}

export function installWidgetSnapshotSync(): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const sync = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      void writeWidgetSnapshot();
    }, 200);
  };
  sync();
  const unsubscribeDive = useDiveSession.subscribe(sync);
  const unsubscribePremium = usePremium.subscribe(sync);
  const unsubscribeSettings = useSettings.subscribe(sync);
  return () => {
    if (timer) clearTimeout(timer);
    unsubscribeDive();
    unsubscribePremium();
    unsubscribeSettings();
  };
}
