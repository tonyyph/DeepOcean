import {
  decideExternalNavigation,
  handleExternalActionNavigation,
  resetExternalNavigationForTests,
  resolveDeepLinkNavigationTarget,
  resolveWidgetNavigationTarget
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

  test("recognizes tab route groups as the same public pathname", () => {
    expect(
      decideExternalNavigation(
        { pathname: "/(tabs)/stats", params: {} },
        resolveWidgetNavigationTarget("stats"),
        "push"
      ).kind
    ).toBe("skip");
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

  test("parses app-relative notification links and their params", () => {
    expect(resolveDeepLinkNavigationTarget("/session/abc?source=notification"))
      .toMatchObject({
        pathname: "/session/abc",
        params: { source: "notification" }
      });
  });
});
