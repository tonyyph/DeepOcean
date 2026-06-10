import type { Creature } from "../bestiary";

export const surfaceCreatures: readonly Creature[] = [
  // ── Surface (Sunlight Zone) ────────────────────────────────────────────
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
    id: "cr_green_turtle",
    name: "Green Sea Turtle",
    scientificName: "Chelonia mydas",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.9,
    description: "An unhurried mariner grazing on seagrass meadows."
  },
  {
    id: "cr_flying_fish",
    name: "Tropical Flying Fish",
    scientificName: "Exocoetus volitans",
    zone: "surface",
    rarity: "common",
    encounterWeight: 1.0,
    description: "It breaks the surface and glides on glassy wings."
  },
  {
    id: "cr_mahi",
    name: "Mahi-mahi",
    scientificName: "Coryphaena hippurus",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.85,
    description: "Electric gold and green, fastest of the warm currents."
  },
  {
    id: "cr_moon_jelly",
    name: "Moon Jelly",
    scientificName: "Aurelia aurita",
    zone: "surface",
    rarity: "common",
    encounterWeight: 1.0,
    description: "Four pale rings pulse beneath a translucent dome."
  },
  {
    id: "cr_man_o_war",
    name: "Portuguese Man o' War",
    scientificName: "Physalia physalis",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.8,
    description: "Not one creature but a colony, sailing on a blue float."
  },
  {
    id: "cr_remora",
    name: "Common Remora",
    scientificName: "Remora remora",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.8,
    description: "A hitchhiker, riding the giants of the open sea."
  },
  {
    id: "cr_barracuda",
    name: "Great Barracuda",
    scientificName: "Sphyraena barracuda",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.8,
    description: "A silver dart, watching with a still, patient eye."
  },
  {
    id: "cr_sea_otter",
    name: "Sea Otter",
    scientificName: "Enhydra lutris",
    zone: "surface",
    rarity: "common",
    encounterWeight: 0.7,
    description: "It floats on its back, cracking shells on a chosen stone."
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
    id: "cr_sailfish",
    name: "Atlantic Sailfish",
    scientificName: "Istiophorus albicans",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "It raises a cobalt sail and turns the water to spray."
  },
  {
    id: "cr_blue_shark",
    name: "Blue Shark",
    scientificName: "Prionace glauca",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.4,
    description: "Slim and indigo, a wanderer of the open ocean."
  },
  {
    id: "cr_mola",
    name: "Ocean Sunfish",
    scientificName: "Mola mola",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "An enormous disc basking sideways in the warm light."
  },
  {
    id: "cr_sargassum",
    name: "Sargassum Fish",
    scientificName: "Histrio histrio",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "A master of disguise, lost among floating weed."
  },
  {
    id: "cr_bluefin",
    name: "Atlantic Bluefin Tuna",
    scientificName: "Thunnus thynnus",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "Warm-blooded muscle, built for endless ocean crossings."
  },
  {
    id: "cr_hammerhead",
    name: "Scalloped Hammerhead",
    scientificName: "Sphyrna lewini",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "Its strange wide head sweeps the water like a sensor."
  },
  {
    id: "cr_pilot_whale",
    name: "Short-finned Pilot Whale",
    scientificName: "Globicephala macrorhynchus",
    zone: "surface",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "A close-knit family, moving as a single dark thought."
  },
  {
    id: "cr_leatherback",
    name: "Leatherback Turtle",
    scientificName: "Dermochelys coriacea",
    zone: "surface",
    rarity: "rare",
    encounterWeight: 0.2,
    description: "Ancient and ridged, it dives deeper than any other turtle."
  },
  {
    id: "cr_whale_shark",
    name: "Whale Shark",
    scientificName: "Rhincodon typus",
    zone: "surface",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "The largest fish alive, starlit and utterly gentle."
  },
  {
    id: "cr_basking",
    name: "Basking Shark",
    scientificName: "Cetorhinus maximus",
    zone: "surface",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "It cruises with a cavernous mouth open to the plankton."
  },
  {
    id: "cr_humpback",
    name: "Humpback Whale",
    scientificName: "Megaptera novaeangliae",
    zone: "surface",
    rarity: "rare",
    encounterWeight: 0.15,
    description: "Its long song carries for miles through the warm water."
  },
  {
    id: "cr_orca",
    name: "Orca",
    scientificName: "Orcinus orca",
    zone: "surface",
    rarity: "rare",
    encounterWeight: 0.15,
    description: "Sharp black and white, the sea's most cunning hunter."
  },
  {
    id: "cr_blue_whale",
    name: "Blue Whale",
    scientificName: "Balaenoptera musculus",
    zone: "surface",
    rarity: "legendary",
    encounterWeight: 0.05,
    description:
      "The largest animal ever to live. The water itself bends around it."
  },

];
