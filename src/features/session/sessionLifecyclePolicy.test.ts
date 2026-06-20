import type { DiveSession } from "@/domain/entities";
import {
  ACTIVE_DIVE_SCHEMA_VERSION,
  decideActiveDiveRestore,
  MAX_PAUSED_RESTORE_AGE_MS,
  parsePersistedActiveDive,
  type PersistedActiveDive
} from "./sessionLifecyclePolicy";

const NOW = 2_000_000;

function session(overrides: Partial<DiveSession> = {}): DiveSession {
  return {
    id: "dive_test",
    startedAt: NOW - 60_000,
    endedAt: null,
    targetSeconds: 25 * 60,
    elapsedSeconds: 60,
    status: "diving",
    zone: "surface",
    depthMeters: 0,
    oxygenPct: 1,
    discoveries: [],
    seed: 1,
    ...overrides
  };
}

function snapshot(
  overrides: Partial<PersistedActiveDive> = {}
): PersistedActiveDive {
  return {
    schemaVersion: ACTIVE_DIVE_SCHEMA_VERSION,
    savedAt: NOW - 1_000,
    session: session(),
    lastRollMinute: 1,
    pausedStartedAt: null,
    pausedAccumulatedMs: 0,
    completionNotificationId: "completion",
    activeNotificationId: "active",
    ...overrides
  };
}

describe("active dive cold-start policy", () => {
  test("restores a timed running dive whose expected end is in the future", () => {
    expect(decideActiveDiveRestore(snapshot(), NOW).kind).toBe("restore");
  });

  test("clears an expired running dive", () => {
    const persisted = snapshot({
      session: session({ startedAt: NOW - 30 * 60_000 })
    });
    expect(decideActiveDiveRestore(persisted, NOW)).toMatchObject({
      kind: "clear",
      reason: "expired"
    });
  });

  test("clears an open-ended running dive after process restart", () => {
    const persisted = snapshot({
      session: session({ targetSeconds: null })
    });
    expect(decideActiveDiveRestore(persisted, NOW)).toMatchObject({
      kind: "clear",
      reason: "open-ended-cold-start"
    });
  });

  test("restores a recent paused dive and rejects a stale paused dive", () => {
    const paused = snapshot({
      session: session({ status: "paused" }),
      pausedStartedAt: NOW - 10_000
    });
    expect(decideActiveDiveRestore(paused, NOW).kind).toBe("restore");
    expect(
      decideActiveDiveRestore(
        { ...paused, savedAt: NOW - MAX_PAUSED_RESTORE_AGE_MS - 1 },
        NOW
      )
    ).toMatchObject({ kind: "clear", reason: "paused-too-long" });
  });

  test("parses valid storage and safely rejects malformed storage", () => {
    expect(parsePersistedActiveDive(JSON.stringify(snapshot())).kind).toBe(
      "restore"
    );
    expect(parsePersistedActiveDive("{broken")).toMatchObject({
      kind: "clear",
      reason: "malformed"
    });
  });
});
