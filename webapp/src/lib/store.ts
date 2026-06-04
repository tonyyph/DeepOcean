import { create } from "zustand";

export interface DiveSession {
  id: string;
  date: string;
  depth: number;
  duration: number; // minutes
  zone: string;
  discoveries: string[];
}

interface StoreState {
  totalDives: number;
  totalDiveTime: number; // minutes
  deepestDive: number; // meters
  currentStreak: number;
  speciesCollected: number;
  collection: string[]; // creature/artifact IDs
  sessions: DiveSession[];
  activeZoneFilter: string | null;
  setActiveZoneFilter: (zone: string | null) => void;
}

export const useStore = create<StoreState>(() => ({
  totalDives: 47,
  totalDiveTime: 1340,
  deepestDive: 8743,
  currentStreak: 12,
  speciesCollected: 31,
  collection: [
    "blue_whale",
    "giant_squid",
    "anglerfish",
    "dumbo_octopus",
    "hadal_snailfish",
    "vampire_squid",
    "oarfish",
    "black_dragonfish",
    "barreleye",
    "xenophyophore",
    "ancient_anchor",
    "hydrothermal_crystal",
    "void_shard",
    "ghost_shark",
    "supergiant_amphipod",
    "zombie_worm",
    "viperfish",
    "gulper_eel"
  ],
  sessions: [
    {
      id: "1",
      date: "2024-06-01",
      depth: 8743,
      duration: 92,
      zone: "trench",
      discoveries: ["hadal_snailfish", "void_shard", "xenophyophore"]
    },
    {
      id: "2",
      date: "2024-05-28",
      depth: 4900,
      duration: 68,
      zone: "abyss",
      discoveries: ["dumbo_octopus", "zombie_worm", "black_box"]
    },
    {
      id: "3",
      date: "2024-05-25",
      depth: 2500,
      duration: 48,
      zone: "midnight",
      discoveries: ["barreleye", "vampire_squid"]
    },
    {
      id: "4",
      date: "2024-05-20",
      depth: 1400,
      duration: 36,
      zone: "midnight",
      discoveries: ["anglerfish", "gulper_eel", "ships_bell"]
    },
    {
      id: "5",
      date: "2024-05-15",
      depth: 650,
      duration: 24,
      zone: "twilight",
      discoveries: ["giant_squid", "ancient_anchor"]
    }
  ],
  activeZoneFilter: null,
  setActiveZoneFilter: (zone) => useStore.setState({ activeZoneFilter: zone })
}));
