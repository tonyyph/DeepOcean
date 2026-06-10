import { StorageKeys, storage } from "@/core/storage/mmkv";
import { useDiveSession, usePremium, useSettings } from "@/stores";
import { getWidgetPrimaryAction } from "./policy";
import type { WidgetSnapshot } from "./types";

function buildSnapshot(): WidgetSnapshot {
  const dive = useDiveSession.getState();
  const premium = usePremium.getState();
  const settings = useSettings.getState();

  return {
    schemaVersion: 1,
    capturedAt: Date.now(),
    isPremium: premium.isPremium,
    preferredMinutes: settings.preferredSessionMinutes,
    session: dive.session
      ? {
          status: dive.session.status,
          elapsedSeconds: dive.session.elapsedSeconds,
          targetSeconds: dive.session.targetSeconds
        }
      : null,
    primaryAction: getWidgetPrimaryAction(dive.session)
  };
}

export function writeWidgetSnapshot(): void {
  storage.set(StorageKeys.widgetSnapshot, JSON.stringify(buildSnapshot()));
}

export function installWidgetSnapshotSync(): () => void {
  writeWidgetSnapshot();
  return () => {};
}
