export type WidgetActionType =
  | "start_focus"
  | "resume_current"
  | "pause_session"
  | "skip_break"
  | "open_ai_companion"
  | "view_daily_progress";

export type WidgetCommand = {
  action: WidgetActionType;
  minutes?: number;
};

export type WidgetDispatchStatus =
  | "success"
  | "ignored"
  | "unsupported"
  | "invalid";

export type WidgetDispatchResult = {
  status: WidgetDispatchStatus;
  action: WidgetActionType;
  reason?: string;
  target: WidgetNavigateTarget;
};

export type WidgetNavigateTarget = "dive" | "ai" | "stats" | "home";

export type WidgetPrimaryAction =
  | "start_focus"
  | "resume_current"
  | "pause_session"
  | "skip_break";

export type WidgetSnapshot = {
  schemaVersion: 3;
  capturedAt: number;
  isPremium: boolean;
  language: "en" | "vi";
  preferredMinutes: number;
  streakDays: number;
  todayFocusMinutes: number;
  dailyTargetMinutes: number;
  weeklyFocusMinutes: number;
  weeklyTargetMinutes: number;
  currentZone: string;
  currentDepthMeters: number;
  discoveryCount: number;
  totalDives: number;
  session: {
    id: string;
    status: "diving" | "paused";
    startedAt: number;
    elapsedSeconds: number;
    targetSeconds: number | null;
    expectedEndAt: number | null;
  } | null;
  primaryAction: WidgetPrimaryAction;
};
