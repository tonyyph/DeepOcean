/**
 * Lore — mysterious story fragments for creatures and artifacts.
 *
 * Two layers:
 *  - `whisper`: 1 line shown for undiscovered entries (a hint of mystery).
 *  - `story`:   multi-paragraph lore shown after discovery; gated extended
 *               sections only revealed for Pro divers.
 *
 * Lore is intentionally not in the i18n bundle (mirrors `bestiary.ts` which
 * keeps creature names in English only). When localised lore is needed,
 * promote to translations.
 */

export type LoreEntry = {
  /** Short, vague — used before discovery. */
  whisper: string;
  /** Discovered: 1–2 short paragraphs. */
  story: string;
  /** Pro-only deeper passage — folklore, theory, field notes. */
  proStory: string;
};

const fallback: LoreEntry = {
  whisper:
    "Something moves at the edge of the lamplight. The deep has not introduced you yet.",
  story:
    "You witnessed it — briefly, completely — and the dive log holds the shape of that encounter.",
  proStory:
    "Field journal access required. Unlock Pro to read collected expedition notes for this species."
};

export const LORE: Readonly<Record<string, LoreEntry>> = {
  cr_dolphin: {
    whisper: "Laughter on the wave-crest. You haven't met them yet.",
    story:
      "They came in close — pod of seven — and held pace with you for the length of a breath. There is an old story that says dolphins remember every diver they choose to escort.",
    proStory:
      "Field notes — Common Dolphin pods exhibit pod-level personality. Coastal observers in Greece have logged the same individuals returning to specific reef structures across seasons. The cliff divers of Cabo call them 'the courteous ones'."
  },
  cr_manta: {
    whisper: "A wide darkness slides under the boat. Nothing splashes.",
    story:
      "The manta passed close enough that its underside reflected the lamplight back at you in pale constellations. The marks on a manta's belly are as unique as a fingerprint.",
    proStory:
      "Field notes — Manta birostris is known to seek out cleaner-fish stations and remain motionless for minutes at a time. Divers report being 'studied' by the same individual across multiple visits. There is no proof. There is no doubt."
  },
  cr_jelly: {
    whisper: "A green pulse, far below. Then nothing. Then another.",
    story:
      "It is mostly water. It carries its own light. When threatened, it brightens — not to flee, but to be remembered.",
    proStory:
      "Field notes — Aequorea victoria's green fluorescent protein revolutionised molecular biology. The jelly itself remains almost ignored by the surface world. Down here, it is one of the only honest lights."
  },
  cr_squid: {
    whisper: "Something black opens, then closes, then is not there.",
    story:
      "Cloaked in its own webbing, the vampire squid does not flee — it inverts itself, becoming a small black star with spines outward. It is one of the oldest body plans still alive.",
    proStory:
      "Field notes — Vampyroteuthis infernalis has lived in low-oxygen midnight water since before vertebrates walked. It does not hunt. It collects what falls. The deep is its inheritance."
  },
  cr_anglerfish: {
    whisper: "A single dot of light. It does not blink. It waits.",
    story:
      "The lure is a tenant — a bioluminescent bacterial colony living in the angler's esca. Two organisms, one hunt.",
    proStory:
      "Field notes — In Melanocetus, males are dwarves that fuse permanently to the female, sharing her bloodstream. They become, in time, a single creature with several minds. The deep does not prefer solitude. It prefers commitment."
  },
  cr_dumbo: {
    whisper: "Slow wings beat in the dark. Not bird. Not yet octopus.",
    story:
      "It flapped — there is no other word — slowly past your light. Dumbo octopuses live deeper than almost any cephalopod and seem entirely untroubled by it.",
    proStory:
      "Field notes — Grimpoteuthis swallows prey whole, has been seen at over 7,000 m, and broods its eggs anywhere the sediment will hold still. The most patient creature in the column."
  },
  cr_oarfish: {
    whisper: "A long ribbon of silver. Longer than thought.",
    story:
      "Sailors called it the sea-serpent. It is real. It is rare. It is the longest bony fish that exists, and you saw it.",
    proStory:
      "Field notes — Regalecus glesne tend to surface only when sick or dying, which is how every fishing village in the world has its own quiet legend. Folklore in Okinawa says they appear before earthquakes. Folklore is not always wrong."
  },
  cr_snailfish: {
    whisper: "Where pressure crushes lamp glass, something still swims.",
    story:
      "At seven kilometres down — the deepest a vertebrate is known to live — this small, pale fish was hovering over the silt. It looked relaxed.",
    proStory:
      "Field notes — Pseudoliparis swirei holds the record for vertebrate depth: 8,178 m in the Mariana Trench. Its body is mostly gel; its bones, soft. It thrives in conditions that should not allow a spine at all."
  },
  cr_titan: {
    whisper: "You felt it before the lamp could reach. Something noticed back.",
    story:
      "You did not see all of it. No one has. You saw enough to know that the trench is not empty, and that whatever lives in it has been there longer than your species has had language.",
    proStory:
      "Field notes — Witness reports from three independent expeditions describe a slow-moving silhouette of immense length, registering on sonar then vanishing. Classified, in private logs, as 'Living Titan'. Officially: a sensor artefact. Unofficially: every captain has a story."
  },
  ar_amphora: {
    whisper: "A shape of fired clay rests where a ship should not have sunk.",
    story:
      "Bronze-age amphora, claimed by coral, claimed back by you. There is grain dust inside that has been undisturbed for three thousand years.",
    proStory:
      "Field notes — The amphora's seal mark matches a port that the historical record places fifty kilometres further north. Either the manifest is wrong, the port was wrong, or the sea moved the boat further than its captain intended."
  },
  ar_compass: {
    whisper: "Brass, cold even in your gloved hand. The needle is alive.",
    story:
      "Its needle still moves. It does not point to magnetic north. It points to whatever was important to the last person who held it.",
    proStory:
      "Field notes — Three test holders, three different bearings, all stable, all repeatable. The instrument is calibrated; the world is not. Compass is currently sealed in archival storage. Do not photograph the needle for more than ten seconds."
  },
  ar_obelisk: {
    whisper:
      "Edges too clean. Surfaces too dark. The water around it is colder.",
    story:
      "Black, perfectly rectangular, free of barnacles, free of erosion. It was here before the trench was a trench.",
    proStory:
      "Field notes — Material analysis inconclusive. Surface reflects 0.4% of incident light at all wavelengths sampled. Sediment dating gives a lower bound but no upper bound. The obelisk has no upper bound."
  }
};

export function getLore(id: string): LoreEntry {
  return LORE[id] ?? fallback;
}
