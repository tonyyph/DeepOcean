import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { AppSettings } from "@/domain/entities";
import { create, StoreApi, UseBoundStore } from "zustand";

const store = new TypedStore<AppSettings>(StorageKeys.settings);
const DEFAULT: AppSettings = {
  hapticsEnabled: true,
  ambientVolume: 0.65,
  reducedMotion: false,
  preferredSessionMinutes: 25,
  language: "en",
  diveRemindersEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
  showDiscoveryAlerts: true
};

type SettingsState = AppSettings & {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
};

export const useSettings: UseBoundStore<StoreApi<SettingsState>> =
  create<SettingsState>((set) => ({
    // Merge with DEFAULT so existing persisted data missing new fields gets safe defaults
    ...DEFAULT,
    ...store.get(DEFAULT),
    update: (patch) =>
      set((s) => {
        const next = { ...s, ...patch };
        const { update: _u, reset: _r, ...persisted } = next;
        store.set(persisted as AppSettings);
        return next;
      }),
    reset: () =>
      set(() => {
        store.set(DEFAULT);
        return {
          ...DEFAULT,
          update: useSettings.getState().update,
          reset: useSettings.getState().reset
        };
      })
  }));
