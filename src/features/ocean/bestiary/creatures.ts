import { surfaceCreatures } from "./surfaceCreatures";
import { twilightCreatures } from "./twilightCreatures";
import { midnightCreatures } from "./midnightCreatures";
import { abyssCreatures } from "./abyssCreatures";
import { trenchCreatures } from "./trenchCreatures";
import type { Creature } from "../bestiary";

export { surfaceCreatures } from "./surfaceCreatures";
export { twilightCreatures } from "./twilightCreatures";
export { midnightCreatures } from "./midnightCreatures";
export { abyssCreatures } from "./abyssCreatures";
export { trenchCreatures } from "./trenchCreatures";

export const CREATURES: readonly Creature[] = [
  ...surfaceCreatures,
  ...twilightCreatures,
  ...midnightCreatures,
  ...abyssCreatures,
  ...trenchCreatures
];
