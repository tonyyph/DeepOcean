import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  routeWidgetActionUrl,
  WIDGET_TARGET_ROUTES
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
    let active = true;
    const search = new URLSearchParams();
    const action = firstParam(params.action);
    const minutes = firstParam(params.minutes);
    if (action) search.set("action", action);
    if (minutes) search.set("minutes", minutes);

    void routeWidgetActionUrl(`deepocean://widget?${search}`).then((result) => {
      if (!active) return;
      console.log("[WidgetCommand]", {
        action: result.action,
        status: result.status,
        reason: result.reason,
        duplicate: result.duplicate
      });
      router.replace(WIDGET_TARGET_ROUTES[result.target] as never);
    });
    return () => {
      active = false;
    };
  }, [params.action, params.minutes, router]);

  return null;
}
