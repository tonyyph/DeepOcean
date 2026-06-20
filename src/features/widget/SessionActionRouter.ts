export type ActionSource = "widget" | "liveActivity" | "deepLink";

export type SessionActionPayload = {
  source: ActionSource;
  actionType: string;
  targetRoute: string;
  sessionId?: string;
  params?: Record<string, string | number | boolean | undefined>;
};

type CurrentSessionRoute = {
  pathname: string;
  sessionId?: string;
};

const ACTION_DEDUPLICATION_MS = 1_500;
const lastHandledActions = new Map<string, number>();

export function createSessionActionSignature(
  payload: SessionActionPayload
): string {
  return [
    payload.source,
    payload.actionType,
    payload.sessionId ?? "",
    payload.targetRoute
  ].join(":");
}

export function shouldIgnoreAction(
  payload: SessionActionPayload,
  now = Date.now()
): boolean {
  const signature = createSessionActionSignature(payload);
  const lastHandledAt = lastHandledActions.get(signature);
  if (
    lastHandledAt !== undefined &&
    now - lastHandledAt < ACTION_DEDUPLICATION_MS
  ) {
    return true;
  }

  lastHandledActions.set(signature, now);
  for (const [key, handledAt] of lastHandledActions) {
    if (now - handledAt >= ACTION_DEDUPLICATION_MS) {
      lastHandledActions.delete(key);
    }
  }
  return false;
}

export function isAlreadyAtTarget(
  payload: SessionActionPayload,
  current: CurrentSessionRoute
): boolean {
  if (current.pathname !== payload.targetRoute) return false;
  if (!payload.sessionId) return true;
  return current.sessionId === payload.sessionId;
}

export async function handleSessionAction(
  payload: SessionActionPayload,
  handler: () => Promise<void> | void,
  now = Date.now()
): Promise<void> {
  if (shouldIgnoreAction(payload, now)) return;
  await handler();
}

export function resetSessionActionRouterForTests(): void {
  lastHandledActions.clear();
}
