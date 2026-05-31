import {
  CREATURES,
  ARTIFACTS,
  type Creature,
  type Artifact,
  type Rarity
} from "./bestiary";
import type { OceanZone } from "./zones";

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

function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    // Numerical Recipes LCG
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function rollFromPool<
  T extends { rarity: Rarity; encounterWeight?: number; zone: OceanZone }
>(pool: readonly T[], zone: OceanZone, rng: () => number): T | null {
  const candidates = pool.filter((p) => p.zone === zone);
  if (candidates.length === 0) return null;
  const weights = candidates.map(
    (c) => RARITY_PROB[c.rarity] * (c.encounterWeight ?? 1)
  );
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates[candidates.length - 1]!;
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
      const c = rollFromPool(CREATURES, zone, rng);
      if (c) out.push({ kind: "creature", entry: c, atMinute: toMinute });
    }
  }
  if (rng() < artifactChance) {
    const a = rollFromPool(ARTIFACTS, zone, rng);
    if (a) out.push({ kind: "artifact", entry: a, atMinute: toMinute });
  }
  return out;
}
