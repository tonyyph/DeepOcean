import { useDiveSession, useSettings } from "@/stores";
import type { WidgetCommand, WidgetDispatchResult } from "./types";

function startMinutesOrPreferred(minutes: number | undefined): number {
  if (typeof minutes === "number") return minutes;
  const preferred = useSettings.getState().preferredSessionMinutes;
  return Number.isFinite(preferred) ? preferred : 25;
}

export function dispatchWidgetCommand(
  command: WidgetCommand
): WidgetDispatchResult {
  const dive = useDiveSession.getState();
  const session = dive.session;

  switch (command.action) {
    case "start_focus": {
      if (session?.status === "diving") {
        return {
          status: "ignored",
          action: command.action,
          target: "dive",
          reason: "session-already-diving"
        };
      }
      if (session?.status === "paused") {
        dive.resume();
        return {
          status: "success",
          action: "resume_current",
          target: "dive"
        };
      }
      dive.start(startMinutesOrPreferred(command.minutes));
      return { status: "success", action: command.action, target: "dive" };
    }

    case "resume_current": {
      if (session?.status !== "paused") {
        return {
          status: "ignored",
          action: command.action,
          target: session?.status === "diving" ? "dive" : "home",
          reason: "session-not-paused"
        };
      }
      dive.resume();
      return { status: "success", action: command.action, target: "dive" };
    }

    case "pause_session": {
      if (session?.status !== "diving") {
        return {
          status: "ignored",
          action: command.action,
          target: session?.status === "paused" ? "dive" : "home",
          reason: "session-not-diving"
        };
      }
      dive.pause();
      return { status: "success", action: command.action, target: "dive" };
    }

    case "skip_break": {
      // Break state is not modeled in the current app. Best approximation for
      // retention is to resume immediately when paused.
      if (session?.status === "paused") {
        dive.resume();
        return { status: "success", action: command.action, target: "dive" };
      }
      return {
        status: "unsupported",
        action: command.action,
        target: "home",
        reason: "break-state-not-modeled"
      };
    }

    case "open_ai_companion": {
      return { status: "success", action: command.action, target: "ai" };
    }

    case "view_daily_progress": {
      return { status: "success", action: command.action, target: "stats" };
    }

    default: {
      return {
        status: "invalid",
        action: command.action,
        target: "home"
      };
    }
  }
}
