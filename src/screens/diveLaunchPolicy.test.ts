import { decideDiveLaunch } from "./diveLaunchPolicy";

describe("decideDiveLaunch", () => {
  it.each([undefined, "idle", "surfaced", "cancelled"] as const)(
    "starts once when the screen opens with status %s",
    (status) => {
      expect(decideDiveLaunch(false, status)).toEqual({
        hasChecked: true,
        shouldStart: true
      });
    }
  );

  it.each(["diving", "paused"] as const)(
    "keeps an existing %s session",
    (status) => {
      expect(decideDiveLaunch(false, status)).toEqual({
        hasChecked: true,
        shouldStart: false
      });
    }
  );

  it("does not restart after an abort clears the session", () => {
    expect(decideDiveLaunch(true, undefined)).toEqual({
      hasChecked: true,
      shouldStart: false
    });
  });

  it("does not restart after a session surfaces", () => {
    expect(decideDiveLaunch(true, "surfaced")).toEqual({
      hasChecked: true,
      shouldStart: false
    });
  });
});
