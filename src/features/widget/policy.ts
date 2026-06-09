import type { DiveSession } from "@/domain/entities";
import type { WidgetPrimaryAction } from "./types";

export function getWidgetPrimaryAction(
  session: DiveSession | null
): WidgetPrimaryAction {
  if (!session) return "start_focus";
  if (session.status === "paused") return "resume_current";
  if (session.status === "diving") return "pause_session";

  // The app has no explicit break state yet. Keep the primary focus action simple.
  return "start_focus";
}
