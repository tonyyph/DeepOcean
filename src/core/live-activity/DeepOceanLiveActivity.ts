import { NativeModules, Platform } from "react-native";
import type { DiveSession } from "@/domain/entities";

type NativeLiveActivity = {
  start(
    sessionId: string,
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

export const DeepOceanLiveActivity = {
  async start(session: DiveSession): Promise<void> {
    if (!canUseLiveActivity()) return;
    try {
      await nativeModule!.start(
        session.id,
        session.targetSeconds,
        session.startedAt,
        session.elapsedSeconds,
        roundedDepth(session),
        session.zone
      );
    } catch (error) {
      console.log("[LiveActivity] start failed", error);
    }
  },

  async update(session: DiveSession): Promise<void> {
    if (!canUseLiveActivity()) return;
    try {
      await nativeModule!.update(
        session.id,
        session.status,
        session.startedAt,
        session.targetSeconds,
        session.elapsedSeconds,
        roundedDepth(session),
        session.zone
      );
    } catch (error) {
      console.log("[LiveActivity] update failed", error);
    }
  },

  async end(sessionId: string | null | undefined): Promise<void> {
    if (!canUseLiveActivity() || !sessionId) return;
    try {
      await nativeModule!.end(sessionId);
    } catch (error) {
      console.log("[LiveActivity] end failed", error);
    }
  }
} as const;
