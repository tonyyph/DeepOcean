// Level progression — pure, no React, no I/O.
// XP model: "current-level XP". On level-up, threshold is subtracted and
// level increments. ProfileScreen's formula nextLevelXp = level * 500 matches.

/** XP needed to advance from `level` to `level + 1`. */
export function xpForNextLevel(level: number): number {
  return level * 500;
}

/**
 * Compute updated level + remaining XP after earning `earnedXp`.
 * Handles multiple level-ups in a single call (e.g. huge XP gain).
 */
export function computeLevelUp(
  currentLevel: number,
  currentXp: number,
  earnedXp: number
): { level: number; xp: number; levelsGained: number } {
  let level = currentLevel;
  let xp = currentXp + earnedXp;
  let levelsGained = 0;
  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level++;
    levelsGained++;
  }
  return { level, xp, levelsGained };
}

/** Fun Vietnamese rank titles keyed by minimum level. */
export const LEVEL_TITLES: Record<number, string> = {
  1: "Tân binh bong bóng",
  2: "Thợ lặn tập sự",
  3: "Thám tử vùng nước",
  4: "Thợ lặn ngọc trai đen",
  5: "Kẻ thổi còi san hô",
  6: "Thám hiểm gia bong bóng",
  7: "Thợ lặn Vuýp",
  8: "Đặc phái viên hải dương",
  9: "Hiệp sĩ ánh sáng xanh",
  10: "Vua biển đông",
  11: "Nhà thám hiểm vực tối",
  12: "Kẻ không sợ bóng tối",
  13: "Huyền thoại đáy đại dương",
  14: "Thủ lĩnh cá mực khổng lồ",
  15: "Chúa tể vùng biển sâu",
  16: "Linh hồn đại dương",
  17: "Kẻ ngủ cùng cá mập",
  18: "Huyền thoại vực thẳm",
  19: "Thần biển tái sinh",
  20: "Bất tử dưới biển"
};

/** Fun English rank titles keyed by minimum level. */
export const LEVEL_TITLES_EN: Record<number, string> = {
  1: "Bubble Rookie",
  2: "Trainee Diver",
  3: "Water Detective",
  4: "Black Pearl Diver",
  5: "Coral Whistleblower",
  6: "Bubble Explorer",
  7: "Vuýp Diver",
  8: "Ocean Special Agent",
  9: "Blue Light Knight",
  10: "King of the Eastern Sea",
  11: "Dark Abyss Explorer",
  12: "Fearless of the Dark",
  13: "Deep Sea Legend",
  14: "Giant Squid Leader",
  15: "Lord of the Deep Sea",
  16: "Soul of the Ocean",
  17: "Shark Sleeper",
  18: "Abyss Legend",
  19: "Reborn Sea God",
  20: "Immortal Under the Sea"
};

/** Returns the rank title for a level (falls back to the closest lower defined entry). */
export function getLevelTitle(level: number, isEnglish: boolean): string {
  const keys = (Object.keys(LEVEL_TITLES) as string[])
    .map(Number)
    .filter((l) => l <= level)
    .sort((a, b) => b - a);

  const key = keys[0] ?? 1;
  return isEnglish
    ? (LEVEL_TITLES_EN[key] ?? "Bubble Rookie")
    : (LEVEL_TITLES[key] ?? "Tân binh bong bóng");
}
