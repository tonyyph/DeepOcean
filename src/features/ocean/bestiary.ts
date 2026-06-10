import type { OceanZone } from "./zones";

export type Rarity = "common" | "uncommon" | "rare" | "legendary" | "mythic";

export type Creature = {
  id: string;
  name: string;
  scientificName: string;
  zone: OceanZone;
  rarity: Rarity;
  description: string;
  /** Probability multiplier per minute spent in zone. Tuned globally below. */
  encounterWeight: number;
};

export type Artifact = {
  id: string;
  name: string;
  zone: OceanZone;
  rarity: Rarity;
  lore: string;
};

// Bestiary catalog. The discovery engine is data-agnostic: it filters by zone
// and weights by RARITY_PROB × encounterWeight, so entries can be added freely
// without affecting determinism.

export { CREATURES } from "./bestiary/creatures";
export { ARTIFACTS } from "./bestiary/artifacts";
