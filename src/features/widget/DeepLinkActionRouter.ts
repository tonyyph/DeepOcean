import { useDiveSession } from "@/stores";
import { dispatchWidgetCommand } from "./dispatch";
import { writeWidgetSnapshot } from "./snapshot";
import type {
  WidgetActionType,
  WidgetDispatchResult,
  WidgetNavigateTarget
} from "./types";
import { parseWidgetActionUrl } from "./urlAction";

const DUPLICATE_WINDOW_MS = 1_500;
let lastHandled: { key: string; at: number; result: WidgetRouteResult } | null =
  null;

export type WidgetRouteResult = WidgetDispatchResult & {
  duplicate: boolean;
};

const INVALID_ACTION: WidgetActionType = "start_focus";

export async function routeWidgetActionUrl(
  url: string,
  now = Date.now()
): Promise<WidgetRouteResult> {
  await useDiveSession.getState().initialize();
  const command = parseWidgetActionUrl(url);
  if (!command) {
    return {
      status: "invalid",
      action: INVALID_ACTION,
      target: "home",
      reason: "invalid-widget-url",
      duplicate: false
    };
  }

  const key = JSON.stringify(command);
  if (
    lastHandled &&
    lastHandled.key === key &&
    now - lastHandled.at < DUPLICATE_WINDOW_MS
  ) {
    return { ...lastHandled.result, duplicate: true };
  }

  const result: WidgetRouteResult = {
    ...dispatchWidgetCommand(command),
    duplicate: false
  };
  lastHandled = { key, at: now, result };
  await writeWidgetSnapshot();
  return result;
}

export const WIDGET_TARGET_ROUTES: Record<WidgetNavigateTarget, string> = {
  dive: "/dive",
  ai: "/(tabs)/ai",
  stats: "/(tabs)/stats",
  home: "/(tabs)"
};

export function resetWidgetActionRouterForTests(): void {
  lastHandled = null;
}
