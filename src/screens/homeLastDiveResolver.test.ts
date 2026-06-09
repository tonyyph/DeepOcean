import {
  resolveLastDiveSession,
  shouldShowLastDiveSkeleton
} from "./homeLastDiveResolver";

describe("homeLastDiveResolver", () => {
  test("resolveLastDiveSession prefers live session first", () => {
    const live = { id: "live" };
    const fallback = { id: "fallback" };
    const cached = { id: "cached" };

    expect(resolveLastDiveSession(live, fallback, cached)).toBe(live);
  });

  test("resolveLastDiveSession falls back in order fallback -> cached", () => {
    const fallback = { id: "fallback" };
    const cached = { id: "cached" };

    expect(resolveLastDiveSession(null, fallback, cached)).toBe(fallback);
    expect(resolveLastDiveSession(null, null, cached)).toBe(cached);
    expect(resolveLastDiveSession(null, null, null)).toBeNull();
  });

  test("shouldShowLastDiveSkeleton only when loading and no session", () => {
    expect(shouldShowLastDiveSkeleton(true, null)).toBe(true);
    expect(shouldShowLastDiveSkeleton(true, { id: "session" })).toBe(false);
    expect(shouldShowLastDiveSkeleton(false, null)).toBe(false);
  });
});
