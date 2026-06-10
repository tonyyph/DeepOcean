import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  dispatchWidgetCommand,
  parseWidgetActionUrl,
  writeWidgetSnapshot,
  type WidgetNavigateTarget
} from "@/features/widget";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function WidgetRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    action?: string | string[];
    minutes?: string | string[];
  }>();

  useEffect(() => {
    const navigate = (target: WidgetNavigateTarget) => {
      router.replace(target === "ai" ? "/(tabs)/ai" : "/(tabs)/stats");
    };
    const search = new URLSearchParams();
    const action = firstParam(params.action);
    const minutes = firstParam(params.minutes);
    if (action) search.set("action", action);
    if (minutes) search.set("minutes", minutes);

    const command = parseWidgetActionUrl(`deepocean://widget?${search}`);
    if (command) {
      const result = dispatchWidgetCommand(command, { navigate });
      writeWidgetSnapshot();
      console.log("[WidgetCommand]", {
        action: command.action,
        status: result.status,
        reason: result.reason
      });
      if (
        command.action === "open_ai_companion" ||
        command.action === "view_daily_progress"
      ) {
        return;
      }
    }

    router.replace("/(tabs)");
  }, [params.action, params.minutes, router]);

  return null;
}
