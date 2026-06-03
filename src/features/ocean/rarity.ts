import type { AppTheme } from "@/design-system/themes";
import type { Rarity } from "./bestiary";

/**
 * Maps a discovery rarity to a theme accent colour. Centralised so every
 * surface (collection, story sheet, live overlay) stays visually consistent.
 */
export function rarityColor(rarity: Rarity, t: AppTheme): string {
  switch (rarity) {
    case "uncommon":
      return t.colors.success;
    case "rare":
      return t.colors.accent;
    case "legendary":
      return t.colors.warning;
    case "mythic":
      return t.colors.danger;
    default:
      return t.colors.textMuted;
  }
}
