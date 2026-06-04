export type Rarity = "common" | "uncommon" | "rare" | "legendary" | "mythic";

export interface OceanZone {
  id: string;
  name: string;
  depth: string;
  minDepth: number;
  maxDepth: number;
  accentColor: string;
  bgFrom: string;
  bgTo: string;
  description: string;
  atmosphere: string;
}

export interface Creature {
  id: string;
  name: string;
  emoji: string;
  zone: string;
  depth: number;
  rarity: Rarity;
  description: string;
  type: "creature";
}

export interface Artifact {
  id: string;
  name: string;
  emoji: string;
  zone: string;
  depth: number;
  rarity: Rarity;
  description: string;
  type: "artifact";
}

export type Discovery = Creature | Artifact;

export const OCEAN_ZONES: OceanZone[] = [
  {
    id: "surface",
    name: "Sunlit Zone",
    depth: "0 – 200m",
    minDepth: 0,
    maxDepth: 200,
    accentColor: "#22E4FF",
    bgFrom: "#051525",
    bgTo: "#0A2A45",
    description:
      "Where sunlight still penetrates. Familiar yet extraordinary life forms.",
    atmosphere: "Warm coastal currents, visibility up to 40m."
  },
  {
    id: "twilight",
    name: "Twilight Zone",
    depth: "200 – 1,000m",
    minDepth: 200,
    maxDepth: 1000,
    accentColor: "#5FF7E0",
    bgFrom: "#031030",
    bgTo: "#061840",
    description: "Fading light. Organisms migrate vertically every 24 hours.",
    atmosphere: "Perpetual dusk. Bioluminescence begins."
  },
  {
    id: "midnight",
    name: "Midnight Zone",
    depth: "1,000 – 4,000m",
    minDepth: 1000,
    maxDepth: 4000,
    accentColor: "#A78BFA",
    bgFrom: "#020A1E",
    bgTo: "#04112A",
    description:
      "Absolute darkness. Life illuminates itself through chemistry.",
    atmosphere: "No sunlight. Pressure: 100–400 atm."
  },
  {
    id: "abyss",
    name: "Abyssal Zone",
    depth: "4,000 – 6,000m",
    minDepth: 4000,
    maxDepth: 6000,
    accentColor: "#7186A5",
    bgFrom: "#010810",
    bgTo: "#020D1A",
    description:
      "Near-freezing temperatures. Alien ecosystems survive on marine snow.",
    atmosphere: "Temperature: 2°C. Sediment plains stretch for thousands of km."
  },
  {
    id: "trench",
    name: "Hadal Zone",
    depth: "6,000m+",
    minDepth: 6000,
    maxDepth: 11034,
    accentColor: "#FF6B6B",
    bgFrom: "#010508",
    bgTo: "#020810",
    description:
      "The deepest places on Earth. Only a handful of humans have visited.",
    atmosphere: "Pressure: 1,100+ atm. Beyond all conventional limits."
  }
];

export const RARITY_CONFIG: Record<
  Rarity,
  { label: string; color: string; glow: string }
> = {
  common: { label: "Common", color: "#5FF7E0", glow: "rgba(95,247,224,0.3)" },
  uncommon: {
    label: "Uncommon",
    color: "#22E4FF",
    glow: "rgba(34,228,255,0.3)"
  },
  rare: { label: "Rare", color: "#A78BFA", glow: "rgba(167,139,250,0.3)" },
  legendary: {
    label: "Legendary",
    color: "#F59E0B",
    glow: "rgba(245,158,11,0.3)"
  },
  mythic: { label: "Mythic", color: "#FF6B6B", glow: "rgba(255,107,107,0.4)" }
};

export const CREATURES: Creature[] = [
  // Surface zone
  {
    id: "blue_whale",
    name: "Blue Whale",
    emoji: "🐋",
    zone: "surface",
    depth: 150,
    rarity: "rare",
    description:
      "The largest animal to have ever lived — heart the size of a small car, heartbeat audible 3km away.",
    type: "creature"
  },
  {
    id: "great_white",
    name: "Great White Shark",
    emoji: "🦈",
    zone: "surface",
    depth: 50,
    rarity: "uncommon",
    description:
      "Apex predator. 300 serrated teeth arranged in rows. Can sense a single drop of blood in 100L of water.",
    type: "creature"
  },
  {
    id: "manta_ray",
    name: "Manta Ray",
    emoji: "🐟",
    zone: "surface",
    depth: 120,
    rarity: "uncommon",
    description:
      "Graceful filter feeder with wingspan up to 7m. Migrates thousands of kilometers.",
    type: "creature"
  },
  {
    id: "sea_turtle",
    name: "Green Sea Turtle",
    emoji: "🐢",
    zone: "surface",
    depth: 80,
    rarity: "common",
    description:
      "Ancient navigator, unchanged for 110 million years. Returns to the same beach to nest every cycle.",
    type: "creature"
  },
  {
    id: "whale_shark",
    name: "Whale Shark",
    emoji: "🦈",
    zone: "surface",
    depth: 180,
    rarity: "rare",
    description:
      "The ocean's gentle giant. Largest fish on Earth; filters 6,000L of water per hour.",
    type: "creature"
  },
  {
    id: "orca",
    name: "Orca",
    emoji: "🐳",
    zone: "surface",
    depth: 100,
    rarity: "uncommon",
    description:
      "Apex social predators. Each pod has unique dialect, culture, and hunting techniques.",
    type: "creature"
  },

  // Twilight zone
  {
    id: "giant_squid",
    name: "Giant Squid",
    emoji: "🦑",
    zone: "twilight",
    depth: 600,
    rarity: "legendary",
    description:
      "Elusive giant with eyes the size of dinner plates — the largest eyes of any animal. Battles sperm whales in the deep.",
    type: "creature"
  },
  {
    id: "lanternfish",
    name: "Lanternfish",
    emoji: "🐟",
    zone: "twilight",
    depth: 400,
    rarity: "common",
    description:
      "Billions of them create vast bioluminescent clouds. The most abundant vertebrate on Earth.",
    type: "creature"
  },
  {
    id: "oarfish",
    name: "Oarfish",
    emoji: "🐍",
    zone: "twilight",
    depth: 800,
    rarity: "rare",
    description:
      'World\'s longest bony fish, up to 11m. The real "sea serpent" of legend. Rarely seen alive.',
    type: "creature"
  },
  {
    id: "hatchetfish",
    name: "Hatchetfish",
    emoji: "🐟",
    zone: "twilight",
    depth: 700,
    rarity: "uncommon",
    description:
      "Silver-mirrored scales and downward-pointing photophores create perfect counter-illumination camouflage.",
    type: "creature"
  },
  {
    id: "firefly_squid",
    name: "Firefly Squid",
    emoji: "🦑",
    zone: "twilight",
    depth: 300,
    rarity: "uncommon",
    description:
      "Entire body studded with photophores. During spawning season, coastal bays glow electric blue.",
    type: "creature"
  },
  {
    id: "sperm_whale",
    name: "Sperm Whale",
    emoji: "🐋",
    zone: "twilight",
    depth: 900,
    rarity: "rare",
    description:
      "Deepest-diving mammal. Hunts giant squid in total darkness using sonar clicks louder than jet engines.",
    type: "creature"
  },

  // Midnight zone
  {
    id: "anglerfish",
    name: "Anglerfish",
    emoji: "🎣",
    zone: "midnight",
    depth: 2000,
    rarity: "rare",
    description:
      "Dangles a bacterial bioluminescent lure in eternal darkness. Males fuse permanently to the female body.",
    type: "creature"
  },
  {
    id: "viperfish",
    name: "Viperfish",
    emoji: "🐟",
    zone: "midnight",
    depth: 1500,
    rarity: "uncommon",
    description:
      "Fangs so long they cannot close its mouth. Lures prey with a photophore on its dorsal spine.",
    type: "creature"
  },
  {
    id: "barreleye",
    name: "Barreleye Fish",
    emoji: "🔭",
    zone: "midnight",
    depth: 2500,
    rarity: "rare",
    description:
      "Transparent fluid-filled head reveals barrel-shaped eyes that rotate to track prey overhead.",
    type: "creature"
  },
  {
    id: "vampire_squid",
    name: "Vampire Squid",
    emoji: "🦑",
    zone: "midnight",
    depth: 1800,
    rarity: "legendary",
    description:
      "Ancient lineage — neither squid nor octopus. Turns inside-out to display venomous spines when threatened.",
    type: "creature"
  },
  {
    id: "gulper_eel",
    name: "Gulper Eel",
    emoji: "🐛",
    zone: "midnight",
    depth: 3000,
    rarity: "rare",
    description:
      "Enormous hinged jaw can engulf prey larger than its entire body. Expands like a black balloon.",
    type: "creature"
  },
  {
    id: "black_dragonfish",
    name: "Black Dragonfish",
    emoji: "🐉",
    zone: "midnight",
    depth: 2000,
    rarity: "legendary",
    description:
      "One of the few animals that produces and sees red light — invisible to all other deep-sea creatures.",
    type: "creature"
  },
  {
    id: "stoplight_loosejaw",
    name: "Stoplight Loosejaw",
    emoji: "🐟",
    zone: "midnight",
    depth: 2200,
    rarity: "uncommon",
    description:
      "Jaw has no floor — operates like a bare skeleton trap. Emits red bioluminescence invisible to its prey.",
    type: "creature"
  },

  // Abyss zone
  {
    id: "dumbo_octopus",
    name: "Dumbo Octopus",
    emoji: "🐙",
    zone: "abyss",
    depth: 4500,
    rarity: "rare",
    description:
      "Ear-like fins flap gently as it drifts through crushing darkness. Deepest-known octopus.",
    type: "creature"
  },
  {
    id: "tripod_fish",
    name: "Tripod Fish",
    emoji: "🐟",
    zone: "abyss",
    depth: 4800,
    rarity: "uncommon",
    description:
      "Stands motionless on three elongated rays, facing the current, waiting for food to drift past.",
    type: "creature"
  },
  {
    id: "zombie_worm",
    name: "Zombie Worm",
    emoji: "🪱",
    zone: "abyss",
    depth: 4600,
    rarity: "rare",
    description:
      "Dissolves whale bones using acid secretions. Symbiotic bacteria convert the lipids into food.",
    type: "creature"
  },
  {
    id: "giant_isopod",
    name: "Giant Isopod",
    emoji: "🦞",
    zone: "abyss",
    depth: 5200,
    rarity: "uncommon",
    description:
      "Armored roly-poly of the deep. Can survive 5 years without food. Rolls into a perfect sphere.",
    type: "creature"
  },
  {
    id: "ghost_shark",
    name: "Ghost Shark",
    emoji: "👻",
    zone: "abyss",
    depth: 4200,
    rarity: "legendary",
    description:
      "Chimaera — cartilaginous fish barely changed in 300 million years. Venomous dorsal spine.",
    type: "creature"
  },
  {
    id: "sea_pig",
    name: "Sea Pig",
    emoji: "🐷",
    zone: "abyss",
    depth: 5000,
    rarity: "common",
    description:
      "Sea cucumber that walks the abyssal plain on its feeding tentacles. Groups of thousands scavenge the seafloor.",
    type: "creature"
  },

  // Trench zone
  {
    id: "hadal_snailfish",
    name: "Hadal Snailfish",
    emoji: "🐟",
    zone: "trench",
    depth: 8336,
    rarity: "legendary",
    description:
      "Deepest fish ever recorded. Adapted to pressure 800× surface — bones replaced with cartilage, cells protected by TMAO.",
    type: "creature"
  },
  {
    id: "supergiant_amphipod",
    name: "Supergiant Amphipod",
    emoji: "🦐",
    zone: "trench",
    depth: 7200,
    rarity: "legendary",
    description:
      "Shrimp-like crustacean growing to 34cm — 10× normal size. Gigantism driven by cold temperature and food scarcity.",
    type: "creature"
  },
  {
    id: "xenophyophore",
    name: "Xenophyophore",
    emoji: "🌑",
    zone: "trench",
    depth: 10600,
    rarity: "mythic",
    description:
      "Largest single-celled organism on Earth. Found only in the deepest trenches. Origin and classification debated.",
    type: "creature"
  },
  {
    id: "sea_spider",
    name: "Pycnogonid",
    emoji: "🕷️",
    zone: "trench",
    depth: 7500,
    rarity: "rare",
    description:
      "Enormous deep-sea spider with organs extending into its legs. Nearly no body — just legs.",
    type: "creature"
  }
];

export const ARTIFACTS: Artifact[] = [
  {
    id: "ancient_anchor",
    name: "Phoenician Anchor",
    emoji: "⚓",
    zone: "twilight",
    depth: 380,
    rarity: "uncommon",
    description:
      "Bronze anchor, circa 800 BCE. Recovered from a submerged merchant route.",
    type: "artifact"
  },
  {
    id: "ships_bell",
    name: "Ship's Bell",
    emoji: "🔔",
    zone: "midnight",
    depth: 2100,
    rarity: "rare",
    description:
      "Brass bell from an unidentified vessel. Name still faintly legible through corrosion.",
    type: "artifact"
  },
  {
    id: "roman_amphora",
    name: "Roman Amphora",
    emoji: "🏺",
    zone: "twilight",
    depth: 310,
    rarity: "uncommon",
    description:
      "Wine vessel from a Roman merchant ship, 1st century CE. Perfectly sealed.",
    type: "artifact"
  },
  {
    id: "black_box",
    name: "Flight Recorder",
    emoji: "📦",
    zone: "abyss",
    depth: 4900,
    rarity: "rare",
    description:
      "Undamaged black box. Aircraft registration unidentified. Data still intact.",
    type: "artifact"
  },
  {
    id: "hydrothermal_crystal",
    name: "Hydrothermal Crystal",
    emoji: "💎",
    zone: "midnight",
    depth: 3400,
    rarity: "legendary",
    description:
      "Mineral crystal formed over millennia around a black smoker vent at 350°C. Contains trapped ancient water.",
    type: "artifact"
  },
  {
    id: "void_shard",
    name: "Void Shard",
    emoji: "🌑",
    zone: "trench",
    depth: 9600,
    rarity: "mythic",
    description:
      "Unknown mineral. Absorbs all incident light. No reflection. No classification. Origin: unresolved.",
    type: "artifact"
  },
  {
    id: "cold_war_buoy",
    name: "SOSUS Hydrophone",
    emoji: "📡",
    zone: "abyss",
    depth: 5100,
    rarity: "uncommon",
    description:
      "Cold War-era military hydrophone. Part of the SOSUS submarine detection network, 1960s.",
    type: "artifact"
  },
  {
    id: "whale_bone",
    name: "Whale Fall Relic",
    emoji: "🦴",
    zone: "midnight",
    depth: 1600,
    rarity: "common",
    description:
      "Whale skeleton supporting a chemosynthetic ecosystem. Hundreds of species feed on it for decades.",
    type: "artifact"
  }
];

export const ALL_DISCOVERIES: Discovery[] = [...CREATURES, ...ARTIFACTS];
