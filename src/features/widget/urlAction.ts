import type { WidgetActionType, WidgetCommand } from "./types";

const ACTIONS: ReadonlySet<WidgetActionType> = new Set([
  "start_focus",
  "resume_current",
  "pause_session",
  "skip_break",
  "open_ai_companion",
  "view_daily_progress"
]);

function clampMinutes(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(180, Math.max(5, parsed));
}

function normalizeAction(raw: string | null): WidgetActionType | null {
  if (!raw) return null;
  if (ACTIONS.has(raw as WidgetActionType)) return raw as WidgetActionType;
  return null;
}

export function parseWidgetActionUrl(url: string): WidgetCommand | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== "deepocean:" && parsed.protocol !== "deepocean-widget:") {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.replace(/^\/+/, "");
  const isWidgetRoute =
    host === "widget" ||
    host === "action" ||
    path.startsWith("widget") ||
    path.startsWith("action");
  if (!isWidgetRoute) return null;

  const action = normalizeAction(parsed.searchParams.get("action"));
  if (!action) return null;

  const minutes = clampMinutes(parsed.searchParams.get("minutes"));
  if (minutes === undefined) return { action };
  return { action, minutes };
}
