import { useDiveSession, useSettings } from "@/stores";
import type { WidgetCommand, WidgetDispatchResult } from "./types";

export type WidgetNavigateTarget = "ai" | "stats";

type DispatchDeps = {
  navigate: (target: WidgetNavigateTarget) => void;
};

function startMinutesOrPreferred(minutes: number | undefined): number {
  if (typeof minutes === "number") return minutes;
  const preferred = useSettings.getState().preferredSessionMinutes;
  return Number.isFinite(preferred) ? preferred : 25;
}

export function dispatchWidgetCommand(
  command: WidgetCommand,
  deps: DispatchDeps
): WidgetDispatchResult {
  const dive = useDiveSession.getState();
  const session = dive.session;

  switch (command.action) {
    case "start_focus": {
      if (session?.status === "diving") {
        return {
          status: "ignored",
          action: command.action,
          reason: "session-already-diving"
        };
      }
      if (session?.status === "paused") {
        dive.resume();
        return { status: "success", action: "resume_current" };
      }
      dive.start(startMinutesOrPreferred(command.minutes));
      return { status: "success", action: command.action };
    }

    case "resume_current": {
      if (session?.status !== "paused") {
        return {
          status: "ignored",
          action: command.action,
          reason: "session-not-paused"
        };
      }
      dive.resume();
      return { status: "success", action: command.action };
    }

    case "pause_session": {
      if (session?.status !== "diving") {
        return {
          status: "ignored",
          action: command.action,
          reason: "session-not-diving"
        };
      }
      dive.pause();
      return { status: "success", action: command.action };
    }

    case "skip_break": {
      // Break state is not modeled in the current app. Best approximation for
      // retention is to resume immediately when paused.
      if (session?.status === "paused") {
        dive.resume();
        return { status: "success", action: command.action };
      }
      return {
        status: "unsupported",
        action: command.action,
        reason: "break-state-not-modeled"
      };
    }

    case "open_ai_companion": {
      deps.navigate("ai");
      return { status: "success", action: command.action };
    }

    case "view_daily_progress": {
      deps.navigate("stats");
      return { status: "success", action: command.action };
    }

    default: {
      return { status: "invalid", action: command.action };
    }
  }
}
