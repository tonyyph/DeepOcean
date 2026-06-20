import type {
  WidgetActionType,
  WidgetNavigateTarget
} from "./types";

export type WidgetActionContract = {
  target: WidgetNavigateTarget;
  requiredParams: readonly string[];
  optionalParams: readonly string[];
  fallback: WidgetNavigateTarget;
};

export const WIDGET_ACTION_CONTRACTS: Record<
  WidgetActionType,
  WidgetActionContract
> = {
  start_focus: {
    target: "dive",
    requiredParams: [],
    optionalParams: ["minutes"],
    fallback: "dive"
  },
  resume_current: {
    target: "dive",
    requiredParams: [],
    optionalParams: [],
    fallback: "home"
  },
  pause_session: {
    target: "dive",
    requiredParams: [],
    optionalParams: [],
    fallback: "home"
  },
  skip_break: {
    target: "dive",
    requiredParams: [],
    optionalParams: [],
    fallback: "home"
  },
  open_ai_companion: {
    target: "ai",
    requiredParams: [],
    optionalParams: [],
    fallback: "home"
  },
  view_daily_progress: {
    target: "stats",
    requiredParams: [],
    optionalParams: [],
    fallback: "home"
  }
};

export function buildWidgetActionUrl(
  action: WidgetActionType,
  params: { minutes?: number } = {}
): string {
  const search = new URLSearchParams({ action });
  if (typeof params.minutes === "number") {
    search.set("minutes", String(params.minutes));
  }
  return `deepocean-widget://widget?${search.toString()}`;
}
