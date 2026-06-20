import type { DiveSession } from "@/domain/entities";

export const ACTIVE_DIVE_SCHEMA_VERSION = 1 as const;
export const MAX_PAUSED_RESTORE_AGE_MS = 24 * 60 * 60 * 1000;
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

export type PersistedActiveDive = {
  schemaVersion: typeof ACTIVE_DIVE_SCHEMA_VERSION;
  savedAt: number;
  session: DiveSession;
  lastRollMinute: number;
  pausedStartedAt: number | null;
  pausedAccumulatedMs: number;
  completionNotificationId: string | null;
  activeNotificationId: string | null;
};

export type ActiveDiveRestoreDecision =
  | { kind: "none" }
  | { kind: "restore"; snapshot: PersistedActiveDive }
  | {
      kind: "clear";
      reason:
        | "malformed"
        | "terminal"
        | "clock-skew"
        | "expired"
        | "open-ended-cold-start"
        | "paused-too-long";
      snapshot: PersistedActiveDive | null;
    };

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isPersistedActiveDive(value: unknown): value is PersistedActiveDive {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PersistedActiveDive>;
  const session = candidate.session as Partial<DiveSession> | undefined;
  return (
    candidate.schemaVersion === ACTIVE_DIVE_SCHEMA_VERSION &&
    isFiniteNonNegative(candidate.savedAt) &&
    isFiniteNonNegative(candidate.lastRollMinute) &&
    isFiniteNonNegative(candidate.pausedAccumulatedMs) &&
    (candidate.pausedStartedAt === null ||
      isFiniteNonNegative(candidate.pausedStartedAt)) &&
    Boolean(session) &&
    typeof session?.id === "string" &&
    isFiniteNonNegative(session.startedAt) &&
    isFiniteNonNegative(session.elapsedSeconds) &&
    (session.targetSeconds === null ||
      isFiniteNonNegative(session.targetSeconds)) &&
    (session.status === "diving" || session.status === "paused")
  );
}

export function parsePersistedActiveDive(
  serialized: string | undefined
): ActiveDiveRestoreDecision {
  if (!serialized) return { kind: "none" };
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isPersistedActiveDive(parsed)) {
      return { kind: "clear", reason: "malformed", snapshot: null };
    }
    return { kind: "restore", snapshot: parsed };
  } catch {
    return { kind: "clear", reason: "malformed", snapshot: null };
  }
}

export function decideActiveDiveRestore(
  snapshot: PersistedActiveDive,
  now: number
): ActiveDiveRestoreDecision {
  const { session } = snapshot;
  if (session.status !== "diving" && session.status !== "paused") {
    return { kind: "clear", reason: "terminal", snapshot };
  }
  if (session.startedAt > now + CLOCK_SKEW_TOLERANCE_MS) {
    return { kind: "clear", reason: "clock-skew", snapshot };
  }
  if (session.status === "paused") {
    if (now - snapshot.savedAt > MAX_PAUSED_RESTORE_AGE_MS) {
      return { kind: "clear", reason: "paused-too-long", snapshot };
    }
    return { kind: "restore", snapshot };
  }
  if (session.targetSeconds === null) {
    return { kind: "clear", reason: "open-ended-cold-start", snapshot };
  }
  const expectedEndAt =
    session.startedAt +
    session.targetSeconds * 1000 +
    snapshot.pausedAccumulatedMs;
  if (expectedEndAt <= now) {
    return { kind: "clear", reason: "expired", snapshot };
  }
  return { kind: "restore", snapshot };
}
