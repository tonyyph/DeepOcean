import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import {
  NotificationService,
  type PermissionState
} from "@/core/notifications/NotificationService";

/**
 * Tracks OS notification permission and exposes a prompt action.
 * Re-syncs whenever the app returns to the foreground, so a permission change
 * made in OS settings is reflected without a restart.
 */
export function useNotificationPermission(): {
  state: PermissionState;
  isGranted: boolean;
  request: () => Promise<boolean>;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<PermissionState>("undetermined");

  const refresh = useCallback(async () => {
    setState(await NotificationService.getPermissionState());
  }, []);

  useEffect(() => {
    const syncTimer = setTimeout(() => {
      void refresh();
    }, 0);
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") void refresh();
    });
    return () => {
      clearTimeout(syncTimer);
      sub.remove();
    };
  }, [refresh]);

  const request = useCallback(async () => {
    const granted = await NotificationService.requestPermission();
    await refresh();
    return granted;
  }, [refresh]);

  return { state, isGranted: state === "granted", request, refresh };
}
