import { StorageKeys, storage } from "@/core/storage/mmkv";
import { DeepOceanLiveActivity } from "@/core/live-activity/DeepOceanLiveActivity";
import { useDiveSession } from "@/stores";
import { dispatchWidgetCommand } from "./dispatch";
import { WIDGET_ACTION_CONTRACTS } from "./actionContract";
import {
  createSessionActionSignature,
  resetSessionActionRouterForTests,
  shouldIgnoreAction,
  type ActionSource,
  type SessionActionPayload
} from "./SessionActionRouter";
import { writeWidgetSnapshot } from "./snapshot";
import type {
  WidgetActionType,
  WidgetDispatchResult,
} from "./types";
import { parseWidgetActionUrl } from "./urlAction";

const PENDING_ACTION_MAX_AGE_MS = 30_000;
const PROCESS_STARTED_AT = Date.now();
const handledResults = new Map<string, WidgetRouteResult>();

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

function actionIdFromUrl(
  url: string,
  signature: string,
  source: ActionSource,
  now: number
): string {
  try {
    const parsed = new URL(url);
    const explicitId =
      parsed.searchParams.get("actionId") ??
      parsed.searchParams.get("action_id");
    if (explicitId) return `${source}:${explicitId}`;
  } catch {
    // Invalid URLs still need a stable short-lived id for safe fallback.
  }
  return `${source}:${signature}:${Math.floor(now / 1_500)}`;
}

function sourceFromUrl(url: string): ActionSource {
  try {
    const source = new URL(url).searchParams.get("source");
    if (source === "live_activity" || source === "live-activity") {
      return "liveActivity";
    }
  } catch {
    // Invalid URLs use the widget source for diagnostics only.
  }
  return "widget";
}

function sessionIdFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const explicitSessionId =
      parsed.searchParams.get("sessionId") ??
      parsed.searchParams.get("session_id");
    if (explicitSessionId) return explicitSessionId;
    const actionId =
      parsed.searchParams.get("actionId") ??
      parsed.searchParams.get("action_id");
    return actionId?.split(":")[0] || undefined;
  } catch {
    return undefined;
  }
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
  const source = sourceFromUrl(url);
  const activeSessionId = useDiveSession.getState().session?.id;
  const sessionId = sessionIdFromUrl(url) ?? activeSessionId;
  const payload: SessionActionPayload = {
    source,
    actionType: command?.action ?? "invalid",
    sessionId,
    targetRoute: command
      ? `/${WIDGET_ACTION_CONTRACTS[command.action].target}`
      : "/"
  };
  const signature = createSessionActionSignature(payload);
  const actionId = actionIdFromUrl(url, signature, source, now);
  setPendingExternalAction({
    actionId,
    receivedAt: now,
    source: source === "liveActivity" ? "live-activity" : "widget",
    url
  });

  if (command && shouldIgnoreAction(payload, now)) {
    clearPendingExternalAction(actionId);
    const previous = handledResults.get(signature);
    if (previous) return { ...previous, actionId, duplicate: true };
    return {
      status: "ignored",
      action: command.action,
      actionId,
      target: WIDGET_ACTION_CONTRACTS[command.action].target,
      reason: "duplicate-action-in-flight",
      duplicate: true
    };
  }

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

  const hydratedSessionId = useDiveSession.getState().session?.id;
  const requiresExistingSession =
    command.action === "pause_session" ||
    command.action === "resume_current" ||
    command.action === "skip_break";
  if (
    requiresExistingSession &&
    sessionId &&
    hydratedSessionId !== sessionId
  ) {
    await DeepOceanLiveActivity.end(sessionId);
    clearPendingExternalAction(actionId);
    return {
      status: "ignored",
      action: command.action,
      actionId,
      target: "home",
      reason: "session-mismatch",
      duplicate: false
    };
  }

  const result: WidgetRouteResult = {
    ...dispatchWidgetCommand(command),
    actionId,
    duplicate: false
  };
  handledResults.set(signature, result);
  try {
    await writeWidgetSnapshot();
    return result;
  } finally {
    clearPendingExternalAction(actionId);
  }
}

export function resetWidgetActionRouterForTests(): void {
  handledResults.clear();
  resetSessionActionRouterForTests();
  clearPendingExternalAction();
}
