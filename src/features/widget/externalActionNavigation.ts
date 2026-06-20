import {
  useGlobalSearchParams,
  usePathname,
  useRootNavigationState,
  useRouter,
  type Href
} from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import type { WidgetNavigateTarget } from "./types";

export type ExternalActionSource =
  | "widget"
  | "live-activity"
  | "notification"
  | "deep-link";

export type ExternalNavigationMode = "push" | "replace";

export type ExternalNavigationTarget = {
  href: Href;
  pathname: string;
  params: Record<string, string>;
};

export type ExternalNavigationDecision =
  | { kind: "skip"; reason: "same-route-and-params" | "duplicate-action" }
  | { kind: "dismiss"; reason: "ingress-over-target" }
  | { kind: "replace"; target: ExternalNavigationTarget }
  | { kind: "push"; target: ExternalNavigationTarget };

export type CurrentRoute = {
  pathname: string;
  params: Record<string, string | string[] | undefined>;
};

type RouterAdapter = {
  back?: () => void;
  canGoBack?: () => boolean;
  push: (href: Href) => void;
  replace: (href: Href) => void;
};

const NAVIGATION_DEDUPLICATION_MS = 1_500;
const recentNavigationIds = new Map<string, number>();

const WIDGET_TARGETS: Record<WidgetNavigateTarget, ExternalNavigationTarget> = {
  dive: { href: "/dive", pathname: "/dive", params: {} },
  ai: { href: "/(tabs)/ai", pathname: "/ai", params: {} },
  stats: { href: "/(tabs)/stats", pathname: "/stats", params: {} },
  home: { href: "/(tabs)", pathname: "/", params: {} }
};

function normalizePathname(pathname: string): string {
  const path = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const withoutGroups = path
    .split("/")
    .filter((segment) => segment && !/^\(.+\)$/.test(segment))
    .join("/");
  if (!withoutGroups || withoutGroups === "index") return "/";
  return `/${withoutGroups.replace(/\/+$/, "")}`;
}

function routeNameToPathname(name: string): string {
  return normalizePathname(name.startsWith("/") ? name : `/${name}`);
}

function routeParams(
  params: object | undefined
): Record<string, string | string[] | undefined> {
  if (!params) return {};
  const normalized: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (
      typeof value === "string" ||
      value === undefined ||
      (Array.isArray(value) && value.every((item) => typeof item === "string"))
    ) {
      normalized[key] = value;
    }
  }
  return normalized;
}

function normalizeParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) normalized[key] = first;
  }
  return normalized;
}

function paramsMatch(
  current: Record<string, string | string[] | undefined>,
  target: Record<string, string>
): boolean {
  const left = normalizeParams(current);
  const rightKeys = Object.keys(target).sort();
  return rightKeys.every((key) => left[key] === target[key]);
}

function hrefWithParams(
  pathname: string,
  params: Record<string, string>
): Href {
  return Object.keys(params).length > 0
    ? ({ pathname, params } as Href)
    : (pathname as Href);
}

export function resolveWidgetNavigationTarget(
  target: WidgetNavigateTarget
): ExternalNavigationTarget {
  return WIDGET_TARGETS[target];
}

export function resolveDeepLinkNavigationTarget(
  deepLink: string
): ExternalNavigationTarget | null {
  if (!deepLink.startsWith("/")) return null;
  let parsed: URL;
  try {
    parsed = new URL(deepLink, "https://deepocean.local");
  } catch {
    return null;
  }
  const pathname = normalizePathname(parsed.pathname);
  const params: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return {
    href: hrefWithParams(parsed.pathname, params),
    pathname,
    params
  };
}

export function decideExternalNavigation(
  current: CurrentRoute,
  target: ExternalNavigationTarget,
  mode: ExternalNavigationMode
): ExternalNavigationDecision {
  if (normalizePathname(current.pathname) !== target.pathname) {
    return mode === "replace"
      ? { kind: "replace", target }
      : { kind: "push", target };
  }
  if (paramsMatch(current.params, target.params)) {
    return { kind: "skip", reason: "same-route-and-params" };
  }
  return { kind: "replace", target };
}

export function decideIngressNavigation(
  previous: CurrentRoute | null,
  target: ExternalNavigationTarget,
  mode: ExternalNavigationMode
): ExternalNavigationDecision {
  if (previous) {
    const previousDecision = decideExternalNavigation(previous, target, mode);
    if (previousDecision.kind === "skip") {
      return { kind: "dismiss", reason: "ingress-over-target" };
    }
  }
  return mode === "replace"
    ? { kind: "replace", target }
    : { kind: "push", target };
}

export function handleExternalActionNavigation(input: {
  actionId: string;
  current: CurrentRoute;
  ingressPrevious?: CurrentRoute | null;
  mode: ExternalNavigationMode;
  now?: number;
  router: RouterAdapter;
  target: ExternalNavigationTarget;
}): ExternalNavigationDecision {
  const now = input.now ?? Date.now();
  const lastHandledAt = recentNavigationIds.get(input.actionId);
  if (
    lastHandledAt !== undefined &&
    now - lastHandledAt < NAVIGATION_DEDUPLICATION_MS
  ) {
    if (normalizePathname(input.current.pathname) === "/widget") {
      const ingressDecision = decideIngressNavigation(
        input.ingressPrevious ?? null,
        input.target,
        input.mode
      );
      if (
        ingressDecision.kind === "dismiss" &&
        input.router.back &&
        input.router.canGoBack?.()
      ) {
        input.router.back();
        return ingressDecision;
      }
    }
    return { kind: "skip", reason: "duplicate-action" };
  }

  const decision =
    normalizePathname(input.current.pathname) === "/widget"
      ? decideIngressNavigation(
          input.ingressPrevious ?? null,
          input.target,
          input.mode
        )
      : decideExternalNavigation(input.current, input.target, input.mode);
  recentNavigationIds.set(input.actionId, now);
  for (const [actionId, handledAt] of recentNavigationIds) {
    if (now - handledAt >= NAVIGATION_DEDUPLICATION_MS) {
      recentNavigationIds.delete(actionId);
    }
  }

  if (
    decision.kind === "dismiss" &&
    input.router.back &&
    input.router.canGoBack?.()
  ) {
    input.router.back();
  } else if (decision.kind === "replace") {
    input.router.replace(decision.target.href);
  } else if (decision.kind === "push") {
    input.router.push(decision.target.href);
  }
  return decision;
}

export function useExternalActionNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const rootState = useRootNavigationState();
  const currentRouteRef = useRef<CurrentRoute>({ pathname, params });
  const previousRoute = rootState.routes
    .slice(0, rootState.index)
    .reverse()
    .find((route) => routeNameToPathname(route.name) !== "/widget");
  const previousRouteRef = useRef<CurrentRoute | null>(
    previousRoute
      ? {
          pathname: routeNameToPathname(previousRoute.name),
          params: routeParams(previousRoute.params)
        }
      : null
  );

  useEffect(() => {
    currentRouteRef.current = { pathname, params };
    previousRouteRef.current = previousRoute
      ? {
          pathname: routeNameToPathname(previousRoute.name),
          params: routeParams(previousRoute.params)
        }
      : null;
  }, [params, pathname, previousRoute]);

  const navigateToTarget = useCallback(
    (input: {
      actionId: string;
      mode?: ExternalNavigationMode;
      target: ExternalNavigationTarget;
    }) =>
      handleExternalActionNavigation({
        actionId: input.actionId,
        current: currentRouteRef.current,
        ingressPrevious: previousRouteRef.current,
        mode: input.mode ?? "push",
        router,
        target: input.target
      }),
    [router]
  );

  const navigateToDeepLink = useCallback(
    (input: {
      actionId: string;
      deepLink: string;
      mode?: ExternalNavigationMode;
    }) => {
      const target = resolveDeepLinkNavigationTarget(input.deepLink);
      if (!target) return null;
      return navigateToTarget({
        actionId: input.actionId,
        mode: input.mode,
        target
      });
    },
    [navigateToTarget]
  );

  return { navigateToDeepLink, navigateToTarget };
}

export function resetExternalNavigationForTests(): void {
  recentNavigationIds.clear();
}
