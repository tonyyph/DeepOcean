// Ocean zones — the spine of the entire progression system.
// Depth is measured in meters; every other subsystem (audio, visuals,
// haptics, discovery RNG) keys off `OceanZone`.
import { Ionicons } from "@expo/vector-icons";

export const OCEAN_ZONES = [
  "surface",
  "twilight",
  "midnight",
  "abyss",
  "trench"
] as const;
export type OceanZone = (typeof OCEAN_ZONES)[number];

export type ZoneDefinition = {
  id: OceanZone;
  label: string;
  /** Depth range in meters — [min, max). The final zone has Infinity max. */
  depth: readonly [number, number];
  /** Minimum focus minutes required to reach this zone in a single session. */
  unlockMinutes: number;
  description: string;
  /** Approximate light level 0–1, used to drive ambient brightness. */
  light: number;
};

export const ZONE_TABLE: Record<OceanZone, ZoneDefinition> = {
  surface: {
    id: "surface",
    label: "Sunlight Zone",
    depth: [0, 200],
    unlockMinutes: 0,
    description:
      "Warm light filters through the waves. Schools of fish drift past.",
    light: 1
  },
  twilight: {
    id: "twilight",
    label: "Twilight Zone",
    depth: [200, 1000],
    unlockMinutes: 15,
    description:
      "Color fades to indigo. Glowing jellies begin to appear.",
    light: 0.45
  },
  midnight: {
    id: "midnight",
    label: "Midnight Zone",
    depth: [1000, 4000],
    unlockMinutes: 30,
    description: "Total darkness. Strange silhouettes pulse with cold light.",
    light: 0.12
  },
  abyss: {
    id: "abyss",
    label: "Abyssal Zone",
    depth: [4000, 6000],
    unlockMinutes: 50,
    description: "Crushing pressure. Ancient species drift in slow silence.",
    light: 0.04
  },
  trench: {
    id: "trench",
    label: "Hadal Trench",
    depth: [6000, Number.POSITIVE_INFINITY],
    unlockMinutes: 75,
    description: "The deepest known dark. Few have ever descended this far.",
    light: 0.01
  }
};

/**
 * Map elapsed focus minutes (continuous) to depth in meters.
 * Curve: roughly linear within a zone, but each zone is "wider" than the last,
 * so deeper progress feels harder-earned. Pure function — easy to test.
 */
export function minutesToDepth(minutes: number): number {
  if (minutes <= 0) return 0;
  // Anchor depths at each zone's unlockMinutes -> depth[0]
  const anchors = OCEAN_ZONES.map((z) => ({
    minutes: ZONE_TABLE[z].unlockMinutes,
    depth: ZONE_TABLE[z].depth[0]
  }));
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!;
    const b = anchors[i + 1]!;
    if (minutes < b.minutes) {
      const t = (minutes - a.minutes) / (b.minutes - a.minutes);
      return a.depth + t * (b.depth - a.depth);
    }
  }
  // Past the trench anchor — extrapolate slowly (100m per extra minute).
  const last = anchors[anchors.length - 1]!;
  return last.depth + (minutes - last.minutes) * 100;
}

export function depthToZone(depthMeters: number): OceanZone {
  for (const z of OCEAN_ZONES) {
    const [min, max] = ZONE_TABLE[z].depth;
    if (depthMeters >= min && depthMeters < max) return z;
  }
  return "trench";
}

export function minutesToZone(minutes: number): OceanZone {
  return depthToZone(minutesToDepth(minutes));
}

export const QUICK_DURATIONS = [15, 25, 45, 60] as const;

// Zone visual config
export const ZONE_COLORS: Record<OceanZone, [string, string]> = {
  surface: ["#4FC3F7", "#0288D1"],
  twilight: ["#7E57C2", "#4527A0"],
  midnight: ["#26C6DA", "#00838F"],
  abyss: ["#42A5F5", "#1565C0"],
  trench: ["#80DEEA", "#00ACC1"]
};

export const ZONE_ICONS: Record<OceanZone, keyof typeof Ionicons.glyphMap> = {
  surface: "sunny-outline",
  twilight: "partly-sunny-outline",
  midnight: "moon-outline",
  abyss: "planet-outline",
  trench: "infinite-outline"
};
