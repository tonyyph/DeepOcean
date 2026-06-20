import {
  createSessionActionSignature,
  handleSessionAction,
  isAlreadyAtTarget,
  resetSessionActionRouterForTests,
  shouldIgnoreAction,
  type SessionActionPayload
} from "./SessionActionRouter";

const payload: SessionActionPayload = {
  source: "liveActivity",
  actionType: "pause_session",
  sessionId: "dive_1",
  targetRoute: "/dive"
};

describe("SessionActionRouter", () => {
  beforeEach(resetSessionActionRouterForTests);

  test("creates a stable source/action/session/route signature", () => {
    expect(createSessionActionSignature(payload)).toBe(
      "liveActivity:pause_session:dive_1:/dive"
    );
  });

  test("ignores the same payload inside the duplicate window", () => {
    expect(shouldIgnoreAction(payload, 1_000)).toBe(false);
    expect(shouldIgnoreAction(payload, 1_200)).toBe(true);
    expect(shouldIgnoreAction(payload, 2_500)).toBe(false);
  });

  test("does not collapse actions for different sessions", () => {
    expect(shouldIgnoreAction(payload, 1_000)).toBe(false);
    expect(
      shouldIgnoreAction({ ...payload, sessionId: "dive_2" }, 1_100)
    ).toBe(false);
  });

  test("recognizes the same dive session as the current target", () => {
    expect(
      isAlreadyAtTarget(payload, {
        pathname: "/dive",
        sessionId: "dive_1"
      })
    ).toBe(true);
    expect(
      isAlreadyAtTarget(payload, {
        pathname: "/dive",
        sessionId: "dive_2"
      })
    ).toBe(false);
  });

  test("handles a duplicate payload only once", async () => {
    const handler = jest.fn(async () => {});
    await handleSessionAction(payload, handler, 1_000);
    await handleSessionAction(payload, handler, 1_100);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
