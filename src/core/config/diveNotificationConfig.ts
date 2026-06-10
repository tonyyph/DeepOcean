import Constants from "expo-constants";

export type DiveNotificationConfig = {
  completionSound: string | true;
};

const DEFAULT_COMPLETION_SOUND = true;

function extraConfig(): Record<string, unknown> {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const dive = extra.diveNotifications;
  return dive && typeof dive === "object"
    ? (dive as Record<string, unknown>)
    : {};
}

function pickSound(
  envValue: string | undefined,
  extraValue: unknown
): string | true {
  const value =
    envValue && envValue.trim().length > 0
      ? envValue.trim()
      : typeof extraValue === "string" && extraValue.trim().length > 0
        ? extraValue.trim()
        : null;
  return value ?? DEFAULT_COMPLETION_SOUND;
}

export function getDiveNotificationConfig(): DiveNotificationConfig {
  const extra = extraConfig();
  return {
    completionSound: pickSound(
      process.env.EXPO_PUBLIC_DIVE_COMPLETE_SOUND,
      extra.completionSound
    )
  };
}
