import * as Haptics from "expo-haptics";
import type { OceanZone } from "@/features/ocean/zones";

/**
 * Haptics — semantic wrappers. Components should describe *intent*
 * (e.g. "diveStart", "discovery"), not concrete impact styles. This lets us
 * retune the haptic language globally without touching feature code.
 */

export const hapticDiveStart = async (): Promise<void> => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

export const hapticDiveSurface = async (): Promise<void> => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticDiscovery = async (): Promise<void> => {
  // Triple-tap pattern — feels like sonar ping
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 80);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 220);
};

export const hapticZoneChange = async (zone: OceanZone): Promise<void> => {
  // Deeper zones = heavier haptics. Simulates increasing pressure.
  const weight: Record<OceanZone, Haptics.ImpactFeedbackStyle> = {
    surface: Haptics.ImpactFeedbackStyle.Light,
    twilight: Haptics.ImpactFeedbackStyle.Light,
    midnight: Haptics.ImpactFeedbackStyle.Medium,
    abyss: Haptics.ImpactFeedbackStyle.Heavy,
    trench: Haptics.ImpactFeedbackStyle.Heavy
  };
  await Haptics.impactAsync(weight[zone]);
};

export const hapticTick = async (): Promise<void> => {
  await Haptics.selectionAsync();
};
