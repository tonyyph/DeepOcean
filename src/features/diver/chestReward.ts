import type { ChestRarity, ChestReward, DiveSession } from "@/domain/entities";
import { ARTIFACTS, CREATURES } from "@/features/ocean/bestiary";
import type { OceanZone } from "@/features/ocean/zones";

const ZONE_BASE_RARITY: Record<OceanZone, ChestRarity> = {
  surface: "driftwood",
  twilight: "bronze",
  midnight: "silver",
  abyss: "gold",
  trench: "void"
};

const RARITY_ORDER: readonly ChestRarity[] = [
  "driftwood",
  "bronze",
  "silver",
  "gold",
  "void"
];

function upgradeRarity(r: ChestRarity): ChestRarity {
  const idx = RARITY_ORDER.indexOf(r);
  return RARITY_ORDER[Math.min(idx + 1, RARITY_ORDER.length - 1)] ?? r;
}

const DISCOVERY_RARITY_SCORE: Record<string, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  legendary: 3,
  mythic: 4
};

const ALL_ITEMS = [...CREATURES, ...ARTIFACTS];

/**
 * Derive chest reward from a completed session. Pure — no I/O.
 *
 * Rarity is zone-based + upgraded one tier for natural completion.
 * XP is already awarded; the modal frames it as treasure recovered.
 */
export function buildChestReward(
  session: DiveSession,
  isDepthRecord: boolean
): ChestReward {
  let rarity = ZONE_BASE_RARITY[session.zone];

  const naturalCompletion =
    session.targetSeconds != null &&
    session.elapsedSeconds >= session.targetSeconds;
  if (naturalCompletion) {
    rarity = upgradeRarity(rarity);
  }

  let featuredDiscovery: ChestReward["featuredDiscovery"] = null;
  let bestScore = -1;
  for (const d of session.discoveries) {
    const id = d.kind === "creature" ? d.entry.id : d.entry.id;
    const item = ALL_ITEMS.find((i) => i.id === id);
    if (item) {
      const score = DISCOVERY_RARITY_SCORE[item.rarity] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        featuredDiscovery = { name: item.name, rarity: item.rarity };
      }
    }
  }

  return {
    rarity,
    xp: session.summary?.xpEarned ?? Math.round(session.elapsedSeconds / 60) * 5,
    featuredDiscovery,
    isDepthRecord
  };
}
