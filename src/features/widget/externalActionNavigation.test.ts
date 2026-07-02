import {
  decideExternalNavigation,
  decideIngressNavigation,
  handleExternalActionNavigation,
  resetExternalNavigationForTests,
  resolveDeepLinkNavigationTarget,
  resolveWidgetNavigationTarget,
  shouldTrackAsActiveRoute
} from "./externalActionNavigation";

describe("external action navigation", () => {
  beforeEach(resetExternalNavigationForTests);

  test("skips when current route and params already match", () => {
    expect(
      decideExternalNavigation(
        { pathname: "/dive", params: { minutes: "25" } },
        {
          href: { pathname: "/dive", params: { minutes: "25" } },
          pathname: "/dive",
          params: { minutes: "25" }
        },
        "push"
      )
    ).toEqual({ kind: "skip", reason: "same-route-and-params" });
  });

  test("replaces the current route when only params differ", () => {
    expect(
      decideExternalNavigation(
        { pathname: "/dive", params: { minutes: "25" } },
        {
          href: { pathname: "/dive", params: { minutes: "50" } },
          pathname: "/dive",
          params: { minutes: "50" }
        },
        "push"
      ).kind
    ).toBe("replace");
  });

  test("ignores unrelated existing params when the target does not change them", () => {
    expect(
      decideExternalNavigation(
        { pathname: "/dive", params: { minutes: "25" } },
        resolveWidgetNavigationTarget("dive"),
        "replace"
      )
    ).toEqual({ kind: "skip", reason: "same-route-and-params" });
  });

  test("recognizes tab route groups as the same public pathname", () => {
    expect(
      decideExternalNavigation(
        { pathname: "/(tabs)/stats", params: {} },
        resolveWidgetNavigationTarget("stats"),
        "push"
      ).kind
    ).toBe("skip");
  });

  test("dismisses the widget ingress when it overlays the same dive", () => {
    expect(
      decideIngressNavigation(
        { pathname: "/dive", params: {} },
        resolveWidgetNavigationTarget("dive"),
        "replace"
      )
    ).toEqual({ kind: "dismiss", reason: "ingress-over-target" });
  });

  test("dismisses ingress without replacing the existing dive instance", () => {
    const router = {
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn()
    };
    const decision = handleExternalActionNavigation({
      actionId: "live-activity:session-1:pause",
      current: { pathname: "/widget", params: {} },
      ingressPrevious: { pathname: "/dive", params: {} },
      mode: "replace",
      router,
      target: resolveWidgetNavigationTarget("dive"),
      now: 1_000
    });

    expect(decision.kind).toBe("dismiss");
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  test("deduplicates concurrent ingress using one action id", () => {
    const router = { push: jest.fn(), replace: jest.fn() };
    const input = {
      actionId: "notification:42",
      current: { pathname: "/", params: {} },
      mode: "push" as const,
      router,
      target: resolveWidgetNavigationTarget("dive"),
      now: 1_000
    };
    expect(handleExternalActionNavigation(input).kind).toBe("push");
    expect(
      handleExternalActionNavigation({ ...input, now: 1_100 })
    ).toEqual({ kind: "skip", reason: "duplicate-action" });
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  test("still dismisses a duplicate widget ingress instead of leaving it visible", () => {
    const router = {
      back: jest.fn(),
      canGoBack: jest.fn(() => true),
      push: jest.fn(),
      replace: jest.fn()
    };
    const input = {
      actionId: "liveActivity:session-1:pause",
      current: { pathname: "/widget", params: {} },
      ingressPrevious: { pathname: "/dive", params: { minutes: "25" } },
      mode: "replace" as const,
      router,
      target: resolveWidgetNavigationTarget("dive"),
      now: 1_000
    };
    handleExternalActionNavigation(input);
    handleExternalActionNavigation({ ...input, now: 1_100 });

    expect(router.back).toHaveBeenCalledTimes(2);
    expect(router.replace).not.toHaveBeenCalled();
  });

  test("parses app-relative notification links and their params", () => {
    expect(resolveDeepLinkNavigationTarget("/session/abc?source=notification"))
      .toMatchObject({
        pathname: "/session/abc",
        params: { source: "notification" }
      });
  });

  // Regression guard for a real device bug: the transient "/widget" ingress
  // screen must never overwrite the tracked "last route the user was
  // actually on", or a stale/repeat widget tap loses track of where to
  // dismiss back to and ends up pushing a duplicate screen instead.
  test("tracks real screens as the active route but excludes the widget ingress screen", () => {
    expect(shouldTrackAsActiveRoute("/dive")).toBe(true);
    expect(shouldTrackAsActiveRoute("/(tabs)/stats")).toBe(true);
    expect(shouldTrackAsActiveRoute("/widget")).toBe(false);
  });
});
