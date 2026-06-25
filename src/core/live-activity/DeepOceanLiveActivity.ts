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

export const DeepOceanLiveActivity = {
  async start(
    session: DiveSession,
    pausedAccumulatedMs = 0
  ): Promise<boolean> {
    if (!canUseLiveActivity()) return false;
    try {
      return Boolean(
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
    } catch {
      return false;
    }
  },

  async update(
    session: DiveSession,
    pausedAccumulatedMs = 0
  ): Promise<boolean> {
    if (!canUseLiveActivity()) return false;
    try {
      return Boolean(
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
    } catch {
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
    } catch {
      // silent — native module absent or bridge error
    }
  },

  async endAll(): Promise<void> {
    if (!canUseLiveActivity()) return;
    try {
      await nativeModule!.endAll();
    } catch {
      // silent — native module absent or bridge error
    }
  }
} as const;
