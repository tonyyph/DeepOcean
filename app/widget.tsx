import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import {
  resolveWidgetNavigationTarget,
  routeWidgetActionUrl,
  useExternalActionNavigation
} from "@/features/widget";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function WidgetRoute() {
  const { navigateToTarget } = useExternalActionNavigation();
  const params = useLocalSearchParams<{
    action?: string | string[];
    actionId?: string | string[];
    minutes?: string | string[];
    source?: string | string[];
  }>();

  useEffect(() => {
    let active = true;
    const search = new URLSearchParams();
    const action = firstParam(params.action);
    const actionId = firstParam(params.actionId);
    const minutes = firstParam(params.minutes);
    const source = firstParam(params.source);
    if (action) search.set("action", action);
    if (actionId) search.set("actionId", actionId);
    if (minutes) search.set("minutes", minutes);
    if (source) search.set("source", source);

    void routeWidgetActionUrl(`deepocean://widget?${search}`).then((result) => {
      if (!active) return;
      console.log("[WidgetCommand]", {
        action: result.action,
        status: result.status,
        reason: result.reason,
        duplicate: result.duplicate
      });
      navigateToTarget({
        actionId: result.actionId,
        mode: "replace",
        target: resolveWidgetNavigationTarget(result.target)
      });
    });
    return () => {
      active = false;
    };
  }, [
    navigateToTarget,
    params.action,
    params.actionId,
    params.minutes,
    params.source
  ]);

  return null;
}
