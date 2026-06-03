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
export const CREATURES: readonly Creature[] = [
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

  // ── Twilight (Twilight Zone) ───────────────────────────────────────────
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
    id: "cr_lanternfish",
    name: "Spotted Lanternfish",
    scientificName: "Myctophum punctatum",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 1.0,
    description: "Rows of tiny lights flicker along its silver flank."
  },
  {
    id: "cr_bristlemouth",
    name: "Bristlemouth",
    scientificName: "Cyclothone signata",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 1.0,
    description: "Small, countless, perhaps the most numerous fish on Earth."
  },
  {
    id: "cr_hatchetfish",
    name: "Silver Hatchetfish",
    scientificName: "Argyropelecus aculeatus",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 0.85,
    description: "A mirror-bright body and eyes turned forever upward."
  },
  {
    id: "cr_pelagic_shrimp",
    name: "Mesopelagic Shrimp",
    scientificName: "Sergestes similis",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 0.9,
    description: "When startled, it spits a glowing cloud and vanishes."
  },
  {
    id: "cr_comb_jelly",
    name: "Comb Jelly",
    scientificName: "Beroe cucumis",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 0.9,
    description: "Rainbows ripple along its rows of beating cilia."
  },
  {
    id: "cr_ribbon_barracudina",
    name: "Ribbon Barracudina",
    scientificName: "Arctozenus risso",
    zone: "twilight",
    rarity: "common",
    encounterWeight: 0.8,
    description: "A slender, glassy predator hanging in the dim blue."
  },
  {
    id: "cr_humboldt",
    name: "Humboldt Squid",
    scientificName: "Dosidicus gigas",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.4,
    description: "It flushes red and white, hunting in restless packs."
  },
  {
    id: "cr_cookiecutter",
    name: "Cookiecutter Shark",
    scientificName: "Isistius brasiliensis",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Small and glowing, it bites perfect circles from the great."
  },
  {
    id: "cr_swordfish",
    name: "Swordfish",
    scientificName: "Xiphias gladius",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "It warms its own eyes to hunt in the cold mid-water."
  },
  {
    id: "cr_snipe_eel",
    name: "Slender Snipe Eel",
    scientificName: "Nemichthys scolopaceus",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "A whip-thin ribbon with jaws that never fully close."
  },
  {
    id: "cr_glass_squid",
    name: "Glass Squid",
    scientificName: "Teuthowenia pellucida",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "Nearly invisible but for two glowing eyes."
  },
  {
    id: "cr_blackdragon",
    name: "Pacific Blackdragon",
    scientificName: "Idiacanthus antrostomus",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "The female trails a barbel tipped in cold blue light."
  },
  {
    id: "cr_lancetfish",
    name: "Longnose Lancetfish",
    scientificName: "Alepisaurus ferox",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "A tall sail and a mouth of fangs, soft and ravenous."
  },
  {
    id: "cr_helmet_jelly",
    name: "Helmet Jelly",
    scientificName: "Periphylla periphylla",
    zone: "twilight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Deep red so the light it makes will not betray it."
  },
  {
    id: "cr_loosejaw",
    name: "Stoplight Loosejaw",
    scientificName: "Malacosteus niger",
    zone: "twilight",
    rarity: "rare",
    encounterWeight: 0.17,
    description: "It sees in red light no other creature can perceive."
  },
  {
    id: "cr_opah",
    name: "Opah",
    scientificName: "Lampris guttatus",
    zone: "twilight",
    rarity: "rare",
    encounterWeight: 0.2,
    description: "The only truly warm-blooded fish, round as a moon."
  },
  {
    id: "cr_siphonophore",
    name: "Giant Siphonophore",
    scientificName: "Praya dubia",
    zone: "twilight",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "A chain of clones longer than a whale, glowing faintly."
  },
  {
    id: "cr_telescopefish",
    name: "Telescopefish",
    scientificName: "Gigantura chuni",
    zone: "twilight",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "Tubular eyes aimed upward, hunting silhouettes."
  },
  {
    id: "cr_pyrosome",
    name: "Giant Pyrosome",
    scientificName: "Pyrostremma spinosum",
    zone: "twilight",
    rarity: "rare",
    encounterWeight: 0.15,
    description:
      "A glowing tube you could swim inside, made of thousands of lives."
  },

  // ── Midnight (Midnight Zone) ───────────────────────────────────────────
  {
    id: "cr_bobtail",
    name: "Deep Bobtail Squid",
    scientificName: "Heteroteuthis dispar",
    zone: "midnight",
    rarity: "common",
    encounterWeight: 0.7,
    description: "A thumb-sized squid that releases a cloud of living light."
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
    id: "cr_fangtooth",
    name: "Common Fangtooth",
    scientificName: "Anoplogaster cornuta",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.35,
    description: "Teeth too long for its mouth, in a body the size of a fist."
  },
  {
    id: "cr_dragonfish",
    name: "Deep-sea Dragonfish",
    scientificName: "Grammatostomias flagellibarba",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Black as the water, with teeth even on its tongue."
  },
  {
    id: "cr_black_swallower",
    name: "Black Swallower",
    scientificName: "Chiasmodon niger",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "It can swallow prey far larger than itself."
  },
  {
    id: "cr_viperfish",
    name: "Sloane's Viperfish",
    scientificName: "Chauliodus sloani",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Needle fangs and a lure dangling from its first fin ray."
  },
  {
    id: "cr_chimaera",
    name: "Spookfish Chimaera",
    scientificName: "Hydrolagus affinis",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "A ghostly relative of sharks, older than the dinosaurs."
  },
  {
    id: "cr_cockeyed_squid",
    name: "Cock-eyed Squid",
    scientificName: "Histioteuthis heteropsis",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "One huge eye looks up, one small eye looks down."
  },
  {
    id: "cr_blob_sculpin",
    name: "Blob Sculpin",
    scientificName: "Psychrolutes phrictus",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Soft and slack, perfectly shaped for the crushing dark."
  },
  {
    id: "cr_sabertooth",
    name: "Sabertooth Fish",
    scientificName: "Coccorella atlantica",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description: "Small, dark, and armed with disproportionate fangs."
  },
  {
    id: "cr_flashlight",
    name: "Flashlight Fish",
    scientificName: "Anomalops katoptron",
    zone: "midnight",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Glowing organs it can blink on and off beneath each eye."
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
    id: "cr_gulper",
    name: "Gulper Eel",
    scientificName: "Eurypharynx pelecanoides",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.2,
    description: "A vast pelican mouth on a thin, whip-like tail."
  },
  {
    id: "cr_barreleye",
    name: "Barreleye",
    scientificName: "Macropinna microstoma",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "Glowing green eyes turn inside a transparent dome of a head."
  },
  {
    id: "cr_telescope_octopus",
    name: "Telescope Octopus",
    scientificName: "Amphitretus pelagicus",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.17,
    description: "Transparent and upright, its eyes raised on little stalks."
  },
  {
    id: "cr_frilled",
    name: "Frilled Shark",
    scientificName: "Chlamydoselachus anguineus",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.18,
    description:
      "An eel-like shark with rows of trident teeth, little changed in eons."
  },
  {
    id: "cr_goblin_shark",
    name: "Goblin Shark",
    scientificName: "Mitsukurina owstoni",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.17,
    description:
      "A long blade of a snout, and jaws that shoot forward to strike."
  },
  {
    id: "cr_football",
    name: "Footballfish",
    scientificName: "Himantolophus groenlandicus",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.18,
    description: "A round black shadow with a stout, glowing lantern."
  },
  {
    id: "cr_bearded_angler",
    name: "Bearded Sea Devil",
    scientificName: "Linophryne arborifera",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.17,
    description:
      "It carries both a glowing lure and a branching, luminous beard."
  },
  {
    id: "cr_whalefish",
    name: "Whalefish",
    scientificName: "Cetomimus gilli",
    zone: "midnight",
    rarity: "rare",
    encounterWeight: 0.16,
    description:
      "Velvet-skinned and eyeless, it feels the dark rather than sees it."
  },
  {
    id: "cr_giant_squid",
    name: "Giant Squid",
    scientificName: "Architeuthis dux",
    zone: "midnight",
    rarity: "legendary",
    encounterWeight: 0.05,
    description:
      "Two hunting tentacles unfurl from the black. Eyes like dinner plates."
  },
  {
    id: "cr_bigfin_squid",
    name: "Bigfin Squid",
    scientificName: "Magnapinna pacifica",
    zone: "midnight",
    rarity: "legendary",
    encounterWeight: 0.06,
    description:
      "Impossibly long, elbowed arms trailing far below its small body."
  },

  // ── Abyss (Abyssal Zone) ───────────────────────────────────────────────
  {
    id: "cr_sea_pig",
    name: "Sea Pig",
    scientificName: "Scotoplanes globosa",
    zone: "abyss",
    rarity: "common",
    encounterWeight: 0.8,
    description: "Plump sea cucumbers walking the mud on tube-foot legs."
  },
  {
    id: "cr_grenadier",
    name: "Abyssal Grenadier",
    scientificName: "Coryphaenoides armatus",
    zone: "abyss",
    rarity: "common",
    encounterWeight: 0.7,
    description:
      "A long tapering tail and a face that scents the dark for carrion."
  },
  {
    id: "cr_abyssal_jelly",
    name: "Crown Jelly",
    scientificName: "Atolla wyvillei",
    zone: "abyss",
    rarity: "common",
    encounterWeight: 0.7,
    description:
      "When attacked it spins a pinwheel of blue light — a burglar alarm."
  },
  {
    id: "cr_basket_star",
    name: "Abyssal Basket Star",
    scientificName: "Gorgonocephalus arcticus",
    zone: "abyss",
    rarity: "common",
    encounterWeight: 0.7,
    description: "A tangle of branching arms, combing the current for food."
  },
  {
    id: "cr_sea_cucumber",
    name: "Swimming Sea Cucumber",
    scientificName: "Enypniastes eximia",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Translucent and pink, it lifts off the floor and drifts away."
  },
  {
    id: "cr_lizardfish",
    name: "Deepsea Lizardfish",
    scientificName: "Bathysaurus ferox",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description: "A patient ambush predator lying still on the abyssal plain."
  },
  {
    id: "cr_glass_sponge",
    name: "Venus' Flower Basket",
    scientificName: "Euplectella aspergillum",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description:
      "A lattice of woven glass, often home to a pair of shrimp for life."
  },
  {
    id: "cr_giant_isopod",
    name: "Giant Isopod",
    scientificName: "Bathynomus giganteus",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "An armored scavenger that can fast for years between meals."
  },
  {
    id: "cr_vent_tubeworm",
    name: "Giant Tube Worm",
    scientificName: "Riftia pachyptila",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "Red plumes around hot vents, fed by bacteria instead of sun."
  },
  {
    id: "cr_predatory_tunicate",
    name: "Predatory Tunicate",
    scientificName: "Megalodicopia hians",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description:
      "A living trap shaped like a hooded mouth, waiting in the current."
  },
  {
    id: "cr_dinner_plate_jelly",
    name: "Dinner Plate Jelly",
    scientificName: "Solmissus incisa",
    zone: "abyss",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "It drifts with tentacles outstretched, hunting other jellies."
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
    id: "cr_tripod_fish",
    name: "Tripod Fish",
    scientificName: "Bathypterois grallator",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.18,
    description:
      "It stands on three stilted fins, facing into the current, blind and still."
  },
  {
    id: "cr_cusk_eel",
    name: "Abyssal Cusk-eel",
    scientificName: "Abyssobrotula galatheae",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.17,
    description: "Among the deepest-dwelling fish ever recorded."
  },
  {
    id: "cr_yeti_crab",
    name: "Yeti Crab",
    scientificName: "Kiwa hirsuta",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.17,
    description: "It farms bacteria on the hairy arms it waves over warm vents."
  },
  {
    id: "cr_scaly_foot",
    name: "Scaly-foot Snail",
    scientificName: "Chrysomallon squamiferum",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.16,
    description: "A snail armored in iron, found only at a few scalding vents."
  },
  {
    id: "cr_pompeii_worm",
    name: "Pompeii Worm",
    scientificName: "Alvinella pompejana",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.16,
    description:
      "It lives against vent walls, one of the most heat-tolerant animals known."
  },
  {
    id: "cr_pigbutt_worm",
    name: "Pigbutt Worm",
    scientificName: "Chaetopterus pugaporcinus",
    zone: "abyss",
    rarity: "rare",
    encounterWeight: 0.16,
    description:
      "A tiny inflated sphere of a worm, drifting in a cloud of mucus."
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
    id: "cr_deepstaria",
    name: "Deepstaria Jelly",
    scientificName: "Deepstaria enigmatica",
    zone: "abyss",
    rarity: "legendary",
    encounterWeight: 0.05,
    description:
      "A vast living sheet that billows and folds around whatever it meets."
  },

  // ── Trench (Hadal Trench) ──────────────────────────────────────────────
  {
    id: "cr_amphipod",
    name: "Hadal Amphipod",
    scientificName: "Hirondellea gigas",
    zone: "trench",
    rarity: "common",
    encounterWeight: 0.7,
    description: "Pale scavengers swarming the very bottom of the world."
  },
  {
    id: "cr_holothurian",
    name: "Trench Sea Cucumber",
    scientificName: "Elpidia glacialis",
    zone: "trench",
    rarity: "common",
    encounterWeight: 0.7,
    description: "It plows the deepest mud, eating the sediment grain by grain."
  },
  {
    id: "cr_xenophyophore",
    name: "Xenophyophore",
    scientificName: "Syringammina fragilissima",
    zone: "trench",
    rarity: "common",
    encounterWeight: 0.6,
    description:
      "A single giant cell that builds itself a fragile mineral shell."
  },
  {
    id: "cr_hadal_polychaete",
    name: "Hadal Bristle Worm",
    scientificName: "Polychaeta",
    zone: "trench",
    rarity: "common",
    encounterWeight: 0.65,
    description: "Threadlike and pale, it threads through the hadal sediment."
  },
  {
    id: "cr_white_holothurian",
    name: "Pale Trench Holothurian",
    scientificName: "Peniagone vitrea",
    zone: "trench",
    rarity: "common",
    encounterWeight: 0.65,
    description: "Almost glassy, it walks the deepest plains on stubby feet."
  },
  {
    id: "cr_supergiant",
    name: "Supergiant Amphipod",
    scientificName: "Alicella gigantea",
    zone: "trench",
    rarity: "uncommon",
    encounterWeight: 0.3,
    description: "A scavenger grown improbably large in the crushing dark."
  },
  {
    id: "cr_trench_grenadier",
    name: "Trench Rattail",
    scientificName: "Coryphaenoides yaquinae",
    zone: "trench",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description:
      "One of the deepest true fish, sweeping the trench for the dead."
  },
  {
    id: "cr_trench_isopod",
    name: "Hadal Isopod",
    scientificName: "Rectisura herculea",
    zone: "trench",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description:
      "Armored and patient, it endures pressures that would crush a hull."
  },
  {
    id: "cr_galatheid",
    name: "Hadal Squat Lobster",
    scientificName: "Munidopsis",
    zone: "trench",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description: "Long-clawed and blind, picking through the deepest debris."
  },
  {
    id: "cr_trench_anemone",
    name: "Hadal Sea Anemone",
    scientificName: "Galatheanthemum hadale",
    zone: "trench",
    rarity: "uncommon",
    encounterWeight: 0.28,
    description:
      "It anchors to the trench wall, tentacles open to the slow current."
  },
  {
    id: "cr_ethereal_snailfish",
    name: "Ethereal Snailfish",
    scientificName: "Pseudoliparis",
    zone: "trench",
    rarity: "rare",
    encounterWeight: 0.15,
    description: "Translucent and slow, glimpsed only by the deepest cameras."
  },
  {
    id: "cr_trench_cusk",
    name: "Mariana Cusk-eel",
    scientificName: "Abyssobrotula",
    zone: "trench",
    rarity: "rare",
    encounterWeight: 0.15,
    description: "A pale eel-shaped fish that haunts the hadal deep."
  },
  {
    id: "cr_glass_amphipod",
    name: "Translucent Amphipod",
    scientificName: "Eurythenes plasticus",
    zone: "trench",
    rarity: "rare",
    encounterWeight: 0.16,
    description:
      "Newly named, and already carrying traces of the surface within it."
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
    id: "cr_trench_jelly",
    name: "Hadal Pale Jelly",
    scientificName: "Unknown",
    zone: "trench",
    rarity: "legendary",
    encounterWeight: 0.05,
    description:
      "A faint, slow bell pulsing at the edge of the lights. Unnamed."
  },
  {
    id: "cr_titan",
    name: "Living Titan",
    scientificName: "Unknown",
    zone: "trench",
    rarity: "mythic",
    encounterWeight: 0.005,
    description: "You feel it before you see it. You never quite see it."
  },
  {
    id: "cr_leviathan",
    name: "Trench Leviathan",
    scientificName: "Unknown",
    zone: "trench",
    rarity: "mythic",
    encounterWeight: 0.006,
    description:
      "The sonar returns an echo too large to be real. Then it moves."
  },
  {
    id: "cr_obsidian_wyrm",
    name: "Obsidian Wyrm",
    scientificName: "Unknown",
    zone: "trench",
    rarity: "mythic",
    encounterWeight: 0.005,
    description:
      "A coil of darkness against the dark, gone the instant you look."
  }
];

export const ARTIFACTS: readonly Artifact[] = [
  // ── Surface ────────────────────────────────────────────────────────────
  {
    id: "ar_ships_bell",
    name: "Ship's Bell",
    zone: "surface",
    rarity: "common",
    lore: "Green with verdigris, a name still half-legible on the rim."
  },
  {
    id: "ar_anchor",
    name: "Rusted Anchor",
    zone: "surface",
    rarity: "common",
    lore: "It held against a storm it ultimately lost."
  },
  {
    id: "ar_bottle",
    name: "Message in a Bottle",
    zone: "surface",
    rarity: "common",
    lore: "The cork held. The ink, sadly, did not."
  },
  {
    id: "ar_float",
    name: "Glass Fishing Float",
    zone: "surface",
    rarity: "common",
    lore: "It drifted for decades before it finally sank."
  },
  {
    id: "ar_cannonball",
    name: "Iron Cannonball",
    zone: "surface",
    rarity: "common",
    lore: "Fused to its neighbors in a single rusted mass."
  },
  {
    id: "ar_lifering",
    name: "Faded Life Ring",
    zone: "surface",
    rarity: "common",
    lore: "It once meant the difference. Now it means a memory."
  },
  {
    id: "ar_clay_pipe",
    name: "Clay Pipe",
    zone: "surface",
    rarity: "common",
    lore: "A sailor's small comfort, dropped overboard one quiet night."
  },
  {
    id: "ar_signal_flag",
    name: "Tattered Signal Flag",
    zone: "surface",
    rarity: "common",
    lore: "Its colors are gone, but the message was surely urgent."
  },
  {
    id: "ar_amphora",
    name: "Sunken Amphora",
    zone: "surface",
    rarity: "uncommon",
    lore: "Bronze-age cargo, claimed by coral."
  },
  {
    id: "ar_porthole",
    name: "Brass Porthole",
    zone: "surface",
    rarity: "uncommon",
    lore: "The glass survived. Whatever it looked out upon did not."
  },
  {
    id: "ar_coin_spanish",
    name: "Spanish Doubloon",
    zone: "surface",
    rarity: "uncommon",
    lore: "Gold does not rust. It simply waits."
  },
  {
    id: "ar_figurehead",
    name: "Carved Figurehead",
    zone: "surface",
    rarity: "rare",
    lore: "She still faces forward, toward a horizon long since reached."
  },

  // ── Twilight ───────────────────────────────────────────────────────────
  {
    id: "ar_lantern",
    name: "Storm Lantern",
    zone: "twilight",
    rarity: "common",
    lore: "Its flame is long out, but the glass remembers the light."
  },
  {
    id: "ar_logbook",
    name: "Waterlogged Logbook",
    zone: "twilight",
    rarity: "common",
    lore: "The last entry breaks off mid-sentence."
  },
  {
    id: "ar_inkwell",
    name: "Glass Inkwell",
    zone: "twilight",
    rarity: "common",
    lore: "Still half full, the ink long since dissolved into the sea."
  },
  {
    id: "ar_sextant",
    name: "Tarnished Sextant",
    zone: "twilight",
    rarity: "uncommon",
    lore: "It measured the stars for a navigator who lost his way."
  },
  {
    id: "ar_pocket_watch",
    name: "Stopped Pocket Watch",
    zone: "twilight",
    rarity: "uncommon",
    lore: "Frozen at the hour the water reached it."
  },
  {
    id: "ar_spyglass",
    name: "Captain's Spyglass",
    zone: "twilight",
    rarity: "uncommon",
    lore: "Brass, collapsible, and aimed forever at nothing."
  },
  {
    id: "ar_barometer",
    name: "Aneroid Barometer",
    zone: "twilight",
    rarity: "uncommon",
    lore: "Its needle still leans toward 'Stormy'."
  },
  {
    id: "ar_medallion",
    name: "Saint's Medallion",
    zone: "twilight",
    rarity: "uncommon",
    lore: "A small prayer for safe passage, worn smooth by anxious thumbs."
  },
  {
    id: "ar_compass",
    name: "Brass Compass",
    zone: "twilight",
    rarity: "rare",
    lore: "Its needle still points — but not to north."
  },
  {
    id: "ar_diving_helmet",
    name: "Standard Diving Helmet",
    zone: "twilight",
    rarity: "rare",
    lore: "Copper and glass, the air hose long since parted."
  },
  {
    id: "ar_telegraph",
    name: "Engine Order Telegraph",
    zone: "twilight",
    rarity: "rare",
    lore: "Its dial rests on 'Full Astern'. The order came too late."
  },
  {
    id: "ar_ships_wheel",
    name: "Ship's Wheel",
    zone: "twilight",
    rarity: "rare",
    lore: "Six spokes remain. A hand could still turn it, if a hand were here."
  },
  {
    id: "ar_violin",
    name: "Salt-warped Violin",
    zone: "twilight",
    rarity: "rare",
    lore: "It played as the deck tilted. Some say it plays still."
  },

  // ── Midnight ───────────────────────────────────────────────────────────
  {
    id: "ar_typewriter",
    name: "Corroded Typewriter",
    zone: "midnight",
    rarity: "common",
    lore: "A single key is still depressed, as if mid-word."
  },
  {
    id: "ar_anchor_chain",
    name: "Colossal Anchor Chain",
    zone: "midnight",
    rarity: "uncommon",
    lore: "Each link the size of a man, vanishing into the dark below."
  },
  {
    id: "ar_propeller",
    name: "Bronze Propeller",
    zone: "midnight",
    rarity: "uncommon",
    lore: "Three great blades, motionless after a lifetime of turning."
  },
  {
    id: "ar_skull_coral",
    name: "Coral-bound Skull",
    zone: "midnight",
    rarity: "uncommon",
    lore: "The sea has begun to make something new of an old sailor."
  },
  {
    id: "ar_amphora_sealed",
    name: "Sealed Clay Vessel",
    zone: "midnight",
    rarity: "uncommon",
    lore: "Still stoppered. Whatever it holds, it has held for centuries."
  },
  {
    id: "ar_cannon",
    name: "Bronze Cannon",
    zone: "midnight",
    rarity: "rare",
    lore: "It fired its last shot above. It rests, now, far below."
  },
  {
    id: "ar_chest",
    name: "Iron Strongbox",
    zone: "midnight",
    rarity: "rare",
    lore: "The lock is rusted shut. The weight inside has not shifted."
  },
  {
    id: "ar_diving_suit",
    name: "Atmospheric Diving Suit",
    zone: "midnight",
    rarity: "rare",
    lore: "An empty armored shell, arms drifting in the slow current."
  },
  {
    id: "ar_chandelier",
    name: "Liner's Chandelier",
    zone: "midnight",
    rarity: "rare",
    lore: "Crystal that once caught ballroom light, hanging in the black."
  },
  {
    id: "ar_safe",
    name: "Purser's Safe",
    zone: "midnight",
    rarity: "rare",
    lore: "The dial spins freely now, guarding secrets no one will claim."
  },
  {
    id: "ar_bell_diving",
    name: "Diving Bell",
    zone: "midnight",
    rarity: "rare",
    lore: "It carried air and hope downward. The cable snapped here."
  },
  {
    id: "ar_idol_jade",
    name: "Jade Idol",
    zone: "midnight",
    rarity: "legendary",
    lore: "Carved by hands that knew this sea before any chart did."
  },

  // ── Abyss ──────────────────────────────────────────────────────────────
  {
    id: "ar_lamp_oil",
    name: "Ceramic Oil Lamp",
    zone: "abyss",
    rarity: "uncommon",
    lore: "Older than any wreck. It should not be this deep."
  },
  {
    id: "ar_anchor_ancient",
    name: "Stone Anchor",
    zone: "abyss",
    rarity: "uncommon",
    lore: "Bored through by hands that worked stone, not iron."
  },
  {
    id: "ar_sphere",
    name: "Perfect Metal Sphere",
    zone: "abyss",
    rarity: "rare",
    lore: "Seamless, unblemished, and slightly warm to the touch."
  },
  {
    id: "ar_disc",
    name: "Etched Stone Disc",
    zone: "abyss",
    rarity: "rare",
    lore: "Spiraling marks that no scholar has ever managed to read."
  },
  {
    id: "ar_pillar",
    name: "Toppled Pillar",
    zone: "abyss",
    rarity: "rare",
    lore: "Fluted and broken, from a hall the ocean swallowed whole."
  },
  {
    id: "ar_mosaic",
    name: "Tessellated Mosaic",
    zone: "abyss",
    rarity: "rare",
    lore: "The tiles still hold their colors. The image is of something swimming."
  },
  {
    id: "ar_chalice",
    name: "Encrusted Chalice",
    zone: "abyss",
    rarity: "rare",
    lore: "Beneath the coral, a glint of worked silver remains."
  },
  {
    id: "ar_obelisk",
    name: "Black Obelisk",
    zone: "abyss",
    rarity: "legendary",
    lore: "No barnacles. No erosion. No explanation."
  },
  {
    id: "ar_monolith",
    name: "Carved Monolith",
    zone: "abyss",
    rarity: "legendary",
    lore: "It faces the trench, as if waiting for something to answer."
  },
  {
    id: "ar_arch",
    name: "Broken Archway",
    zone: "abyss",
    rarity: "legendary",
    lore: "A doorway to nothing, leading nowhere, built by no one we know."
  },
  {
    id: "ar_tablet",
    name: "Cuneiform Tablet",
    zone: "abyss",
    rarity: "legendary",
    lore: "Wet clay should not survive. This has, for a very long time."
  },
  {
    id: "ar_mask_gold",
    name: "Gold Funerary Mask",
    zone: "abyss",
    rarity: "legendary",
    lore: "It gazes upward, still, toward a sky it will never see again."
  },

  // ── Trench ─────────────────────────────────────────────────────────────
  {
    id: "ar_lattice",
    name: "Crystalline Lattice",
    zone: "trench",
    rarity: "rare",
    lore: "A structure too regular for nature, too strange for craft."
  },
  {
    id: "ar_filament",
    name: "Singing Filament",
    zone: "trench",
    rarity: "rare",
    lore: "The hydrophones pick up a tone whenever the current stirs it."
  },
  {
    id: "ar_orb",
    name: "Pulsing Orb",
    zone: "trench",
    rarity: "legendary",
    lore: "It brightens, faintly, each time you draw near. Then dims."
  },
  {
    id: "ar_shard",
    name: "Impossible Shard",
    zone: "trench",
    rarity: "legendary",
    lore: "Broken from something larger. You hope you never find the rest."
  },
  {
    id: "ar_spire",
    name: "Black Spire Fragment",
    zone: "trench",
    rarity: "legendary",
    lore: "Snapped clean, its surface drinking the light from your lamps."
  },
  {
    id: "ar_ring_metal",
    name: "Seamless Metal Ring",
    zone: "trench",
    rarity: "legendary",
    lore: "Large enough to swim through. You decide not to."
  },
  {
    id: "ar_obsidian_tablet",
    name: "Obsidian Tablet",
    zone: "trench",
    rarity: "legendary",
    lore: "Its glyphs catch a light that your lamps are not casting."
  },
  {
    id: "ar_dark_lens",
    name: "Black Lens",
    zone: "trench",
    rarity: "legendary",
    lore: "Look through it and the trench seems, somehow, to look back."
  },
  {
    id: "ar_glyph_stone",
    name: "Glowing Glyph Stone",
    zone: "trench",
    rarity: "mythic",
    lore: "The symbols rearrange when you are not watching them directly."
  },
  {
    id: "ar_relic_warm",
    name: "Warm Relic",
    zone: "trench",
    rarity: "mythic",
    lore: "Here, at the coldest place on Earth, this one object is warm."
  },
  {
    id: "ar_anomaly",
    name: "Trench Anomaly",
    zone: "trench",
    rarity: "mythic",
    lore: "The instruments disagree on whether it is even there."
  },
  {
    id: "ar_vessel_unknown",
    name: "Vessel of Unknown Make",
    zone: "trench",
    rarity: "mythic",
    lore: "Not built by any hand recorded. The door, mercifully, is closed."
  }
];
