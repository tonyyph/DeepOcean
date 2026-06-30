import { NativeModules, Platform } from "react-native";
import type { DiveSession } from "@/domain/entities";

type NativeLiveActivity = {
  start(
    sessionId: string,
    status: string,
    targetSeconds: number | null,
    startedAtMs: number,
    elapsedSeconds: number,
    depthMeters: number,
    zone: string
  ): Promise<string | false>;
  update(
    sessionId: string,
    status: string,
    startedAtMs: number,
    targetSeconds: number | null,
    elapsedSeconds: number,
    depthMeters: number,
    zone: string
  ): Promise<boolean>;
  end(sessionId: string): Promise<boolean>;
  endAll(): Promise<boolean>;
};

const nativeModule = NativeModules.DeepOceanLiveActivity as
  | NativeLiveActivity
  | undefined;

const LIVE_ACTIVITY_UPDATE_THROTTLE_MS = 15_000;
let lastLiveActivitySync:
  | { sessionId: string; signature: string; updatedAt: number }
  | null = null;

function canUseLiveActivity(): boolean {
  return Platform.OS === "ios" && nativeModule != null;
}

function roundedDepth(session: DiveSession): number {
  return Math.max(0, Math.round(session.depthMeters));
}

function effectiveStartedAt(
  session: DiveSession,
  pausedAccumulatedMs: number
): number {
  return session.startedAt + Math.max(0, pausedAccumulatedMs);
}

function liveActivitySignature(
  session: DiveSession,
  pausedAccumulatedMs: number
): string {
  return [
    session.id,
    session.status,
    session.targetSeconds ?? "free",
    effectiveStartedAt(session, pausedAccumulatedMs),
    session.zone
  ].join("|");
}

function shouldSkipLiveActivityUpdate(
  session: DiveSession,
  pausedAccumulatedMs: number
): boolean {
  if (!lastLiveActivitySync || lastLiveActivitySync.sessionId !== session.id) {
    return false;
  }

  const signature = liveActivitySignature(session, pausedAccumulatedMs);
  if (lastLiveActivitySync.signature !== signature) return false;

  return Date.now() - lastLiveActivitySync.updatedAt <
    LIVE_ACTIVITY_UPDATE_THROTTLE_MS;
}

function rememberLiveActivitySync(
  session: DiveSession,
  pausedAccumulatedMs: number
): void {
  lastLiveActivitySync = {
    sessionId: session.id,
    signature: liveActivitySignature(session, pausedAccumulatedMs),
    updatedAt: Date.now()
  };
}

function clearLiveActivitySync(sessionId?: string | null): void {
  if (!sessionId || lastLiveActivitySync?.sessionId === sessionId) {
    lastLiveActivitySync = null;
  }
}

export const DeepOceanLiveActivity = {
  async start(
    session: DiveSession,
    pausedAccumulatedMs = 0
  ): Promise<boolean> {
    if (!canUseLiveActivity()) return false;
    try {
      const started = Boolean(
        await nativeModule!.start(
          session.id,
          session.status,
          session.targetSeconds,
          effectiveStartedAt(session, pausedAccumulatedMs),
          session.elapsedSeconds,
          roundedDepth(session),
          session.zone
        )
      );
      if (started) rememberLiveActivitySync(session, pausedAccumulatedMs);
      return started;
    } catch {
      return false;
    }
  },

  async update(
    session: DiveSession,
    pausedAccumulatedMs = 0
  ): Promise<boolean> {
    if (!canUseLiveActivity()) return false;
    if (shouldSkipLiveActivityUpdate(session, pausedAccumulatedMs)) {
      return true;
    }
    try {
      const updated = Boolean(
        await nativeModule!.update(
          session.id,
          session.status,
          effectiveStartedAt(session, pausedAccumulatedMs),
          session.targetSeconds,
          session.elapsedSeconds,
          roundedDepth(session),
          session.zone
        )
      );
      if (updated) {
        rememberLiveActivitySync(session, pausedAccumulatedMs);
      } else {
        clearLiveActivitySync(session.id);
      }
      return updated;
    } catch {
      clearLiveActivitySync(session.id);
      return false;
    }
  },

  async sync(
    session: DiveSession,
    pausedAccumulatedMs = 0
  ): Promise<void> {
    const updated = await this.update(session, pausedAccumulatedMs);
    if (!updated) {
      await this.start(session, pausedAccumulatedMs);
    }
  },

  async end(sessionId: string | null | undefined): Promise<void> {
    if (!canUseLiveActivity() || !sessionId) return;
    try {
      await nativeModule!.end(sessionId);
      clearLiveActivitySync(sessionId);
    } catch {
      // silent — native module absent or bridge error
    }
  },

  async endAll(): Promise<void> {
    if (!canUseLiveActivity()) return;
    try {
      await nativeModule!.endAll();
      clearLiveActivitySync();
    } catch {
      // silent — native module absent or bridge error
    }
  }
} as const;
