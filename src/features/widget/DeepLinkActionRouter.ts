import { StorageKeys, storage } from "@/core/storage/mmkv";
import { useDiveSession } from "@/stores";
import { dispatchWidgetCommand } from "./dispatch";
import { writeWidgetSnapshot } from "./snapshot";
import type {
  WidgetActionType,
  WidgetDispatchResult,
} from "./types";
import { parseWidgetActionUrl } from "./urlAction";

const DUPLICATE_WINDOW_MS = 1_500;
const PENDING_ACTION_MAX_AGE_MS = 30_000;
const PROCESS_STARTED_AT = Date.now();
let lastHandled: { key: string; at: number; result: WidgetRouteResult } | null =
  null;

export type WidgetRouteResult = WidgetDispatchResult & {
  actionId: string;
  duplicate: boolean;
};

type PendingExternalAction = {
  actionId: string;
  receivedAt: number;
  source: "widget" | "live-activity";
  url: string;
};

const INVALID_ACTION: WidgetActionType = "start_focus";

function actionIdFromUrl(url: string, key: string, now: number): string {
  try {
    const parsed = new URL(url);
    const explicitId =
      parsed.searchParams.get("actionId") ??
      parsed.searchParams.get("action_id");
    if (explicitId) return `widget:${explicitId}`;
  } catch {
    // Invalid URLs still need a stable short-lived id for safe fallback.
  }
  return `widget:${key}:${Math.floor(now / DUPLICATE_WINDOW_MS)}`;
}

function sourceFromUrl(url: string): PendingExternalAction["source"] {
  try {
    const source = new URL(url).searchParams.get("source");
    if (source === "live_activity" || source === "live-activity") {
      return "live-activity";
    }
  } catch {
    // Invalid URLs use the widget source for diagnostics only.
  }
  return "widget";
}

function setPendingExternalAction(action: PendingExternalAction): void {
  storage.set(StorageKeys.pendingExternalAction, JSON.stringify(action));
}

function clearPendingExternalAction(actionId?: string): void {
  if (!actionId) {
    storage.delete(StorageKeys.pendingExternalAction);
    return;
  }
  const serialized = storage.getString(StorageKeys.pendingExternalAction);
  if (!serialized) return;
  try {
    const pending = JSON.parse(serialized) as Partial<PendingExternalAction>;
    if (pending.actionId !== actionId) return;
  } catch {
    // Malformed pending state is stale by definition.
  }
  storage.delete(StorageKeys.pendingExternalAction);
}

export function discardStalePendingExternalAction(now = Date.now()): void {
  const serialized = storage.getString(StorageKeys.pendingExternalAction);
  if (!serialized) return;
  try {
    const pending = JSON.parse(serialized) as Partial<PendingExternalAction>;
    if (
      typeof pending.receivedAt === "number" &&
      pending.receivedAt >= PROCESS_STARTED_AT &&
      pending.receivedAt <= now &&
      now - pending.receivedAt <= PENDING_ACTION_MAX_AGE_MS
    ) {
      return;
    }
  } catch {
    // Clear malformed pending action state below.
  }
  storage.delete(StorageKeys.pendingExternalAction);
}

export async function routeWidgetActionUrl(
  url: string,
  now = Date.now()
): Promise<WidgetRouteResult> {
  const command = parseWidgetActionUrl(url);
  const key = command ? JSON.stringify(command) : url;
  const actionId = actionIdFromUrl(url, key, now);
  setPendingExternalAction({
    actionId,
    receivedAt: now,
    source: sourceFromUrl(url),
    url
  });

  await useDiveSession.getState().initialize();
  if (!command) {
    clearPendingExternalAction(actionId);
    return {
      status: "invalid",
      action: INVALID_ACTION,
      actionId,
      target: "home",
      reason: "invalid-widget-url",
      duplicate: false
    };
  }

  if (
    lastHandled &&
    lastHandled.key === key &&
    now - lastHandled.at < DUPLICATE_WINDOW_MS
  ) {
    clearPendingExternalAction(actionId);
    return { ...lastHandled.result, duplicate: true };
  }

  const result: WidgetRouteResult = {
    ...dispatchWidgetCommand(command),
    actionId,
    duplicate: false
  };
  lastHandled = { key, at: now, result };
  try {
    await writeWidgetSnapshot();
    return result;
  } finally {
    clearPendingExternalAction(actionId);
  }
}

export function resetWidgetActionRouterForTests(): void {
  lastHandled = null;
  clearPendingExternalAction();
}
