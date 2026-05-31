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

// Sample bestiary — small but real. Extend freely; the engine doesn't care.
export const CREATURES: readonly Creature[] = [
  {
    id: "cr_dolphin",
    name: "Common Dolphin",
    scientificName: "Delphinus delphis",
    zone: "surface",
    rarity: "common",
    encounterWeight: 1.0,
    description: "Playful pods skim the sunlit waves."
  },
  {
    id: "cr_manta",
    name: "Giant Manta Ray",
    scientificName: "Mobula birostris",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.4,
    description: "A silent shadow glides beneath the surface."
  },
  {
    id: "cr_jelly",
    name: "Crystal Jelly",
    scientificName: "Aequorea victoria",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 0.9,
    description: "A pulse of green-blue light, drifting."
  },
  {
    id: "cr_squid",
    name: "Vampire Squid",
    scientificName: "Vampyroteuthis infernalis",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.25,
    description: "Cloaked in living webbing, ancient and unbothered."
  },
  {
    id: "cr_anglerfish",
    name: "Anglerfish",
    scientificName: "Melanocetus johnsonii",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "A single lure burns in the dark."
  },
  {
    id: "cr_dumbo",
    name: "Dumbo Octopus",
    scientificName: "Grimpoteuthis",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.2,
    description: "Ear-like fins flap in slow, deliberate beats."
  },
  {
    id: "cr_oarfish",
    name: "Giant Oarfish",
    scientificName: "Regalecus glesne",
    zone: "abyss",
    rarity: "legendary",
    encounterWeight: 0.05,
    description: "A ribbon of silver, longer than a bus."
  },
  {
    id: "cr_snailfish",
    name: "Hadal Snailfish",
    scientificName: "Pseudoliparis swirei",
    zone: "trench",
    rarity: "legendary",
    encounterWeight: 0.06,
    description: "Thrives where almost nothing else can."
  },
  {
    id: "cr_titan",
    name: "Living Titan",
    scientificName: "Unknown",
    zone: "trench",
    rarity: "mythic",
    encounterWeight: 0.005,
    description: "You feel it before you see it. You never quite see it."
  }
];

export const ARTIFACTS: readonly Artifact[] = [
  {
    id: "ar_amphora",
    name: "Sunken Amphora",
    zone: "surface",
    rarity: "uncommon",
    lore: "Bronze-age cargo, claimed by coral."
  },
  {
    id: "ar_compass",
    name: "Brass Compass",
    zone: "twilight",
    rarity: "rare",
    lore: "Its needle still points — but not to north."
  },
  {
    id: "ar_obelisk",
    name: "Black Obelisk",
    zone: "abyss",
    rarity: "legendary",
    lore: "No barnacles. No erosion. No explanation."
  }
];
