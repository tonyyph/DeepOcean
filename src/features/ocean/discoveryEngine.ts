import {
  CREATURES,
  ARTIFACTS,
  type Creature,
  type Artifact,
  type Rarity
} from "./bestiary";
import { OCEAN_ZONES, type OceanZone } from "./zones";

/**
 * Discovery engine — deterministic given (seed, zone, minute).
 *
 * Why deterministic? So we can replay a dive for analytics or reproduce a
 * "lucky" session if something goes wrong. We use a tiny LCG instead of
 * Math.random to keep things pure-functional and testable.
 */

export type Discovery =
  | { kind: "creature"; entry: Creature; atMinute: number }
  | { kind: "artifact"; entry: Artifact; atMinute: number };

const RARITY_PROB: Record<Rarity, number> = {
  common: 0.5,
  uncommon: 0.25,
  rare: 0.12,
  legendary: 0.03,
  mythic: 0.005
};

type WeightedEntry<T> = {
  entry: T;
  cumulativeWeight: number;
};

type WeightedZonePool<T> = {
  entries: readonly WeightedEntry<T>[];
  totalWeight: number;
};

function buildWeightedZonePools<
  T extends { rarity: Rarity; encounterWeight?: number; zone: OceanZone }
>(pool: readonly T[]): Record<OceanZone, WeightedZonePool<T>> {
  const grouped = {} as Record<
    OceanZone,
    { entries: WeightedEntry<T>[]; totalWeight: number }
  >;

  for (const zone of OCEAN_ZONES) {
    grouped[zone] = { entries: [], totalWeight: 0 };
  }

  for (const entry of pool) {
    const zonePool = grouped[entry.zone];
    const weight = RARITY_PROB[entry.rarity] * (entry.encounterWeight ?? 1);
    if (weight <= 0) continue;
    zonePool.totalWeight += weight;
    zonePool.entries.push({
      entry,
      cumulativeWeight: zonePool.totalWeight
    });
  }

  return grouped;
}

const CREATURE_POOLS_BY_ZONE = buildWeightedZonePools(CREATURES);
const ARTIFACT_POOLS_BY_ZONE = buildWeightedZonePools(ARTIFACTS);

function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    // Numerical Recipes LCG
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function rollFromPool<T>(
  pool: WeightedZonePool<T>,
  rng: () => number
): T | null {
  if (pool.totalWeight <= 0 || pool.entries.length === 0) return null;
  const target = rng() * pool.totalWeight;
  for (const item of pool.entries) {
    if (target <= item.cumulativeWeight) return item.entry;
  }
  return pool.entries[pool.entries.length - 1]?.entry ?? null;
}

/**
 * Roll discoveries for an elapsed window of focus.
 * Called once per "tick" by the session engine.
 *
 * @param seed       Session seed (set at dive start).
 * @param zone       Current zone (may have changed since last tick).
 * @param fromMinute Last roll time.
 * @param toMinute   Current elapsed time.
 */
export function rollDiscoveries(
  seed: number,
  zone: OceanZone,
  fromMinute: number,
  toMinute: number
): Discovery[] {
  if (toMinute <= fromMinute) return [];
  const rng = lcg(Math.floor(seed + fromMinute * 1000));
  const minutes = toMinute - fromMinute;

  // ~1 creature attempt per 3 min, ~1 artifact attempt per 12 min
  const creatureAttempts = Math.max(1, Math.round(minutes / 3));
  const artifactChance = minutes / 12;

  const out: Discovery[] = [];
  for (let i = 0; i < creatureAttempts; i++) {
    if (rng() < 0.35) {
      const c = rollFromPool(CREATURE_POOLS_BY_ZONE[zone], rng);
      if (c) out.push({ kind: "creature", entry: c, atMinute: toMinute });
    }
  }
  if (rng() < artifactChance) {
    const a = rollFromPool(ARTIFACT_POOLS_BY_ZONE[zone], rng);
    if (a) out.push({ kind: "artifact", entry: a, atMinute: toMinute });
  }
  return out;
}
