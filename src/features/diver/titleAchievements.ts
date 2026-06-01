// Title achievements — milestone-based unlocks independent of zone exploration.
// Conditions are checked purely from DiverProfile + collection count after each dive.

import type { DiverProfile } from "@/domain/entities";

export type TitleAchievement = {
  id: string;
  title: string;
  description: string;
  /** Ionicons glyph name. */
  icon: string;
};

type CheckExtras = {
  /** Number of distinct collection entries seen at least once. */
  collectionCount: number;
};

type AchievementDef = TitleAchievement & {
  check: (profile: DiverProfile, extras: CheckExtras) => boolean;
};

export const TITLE_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_dive",
    title: "Chuyến Lặn Đầu Tiên",
    description: "Bong bóng đầu tiên nổi lên mặt nước.",
    icon: "water-outline",
    check: (p) => p.totalDives >= 1
  },
  {
    id: "dives_5",
    title: "Nghiện Nước",
    description: "5 lần xuống nước — có vẻ bạn không thích ở trên bờ.",
    icon: "refresh-outline",
    check: (p) => p.totalDives >= 5
  },
  {
    id: "dives_10",
    title: "Thập Kỷ Ướt",
    description: "10 lần đắm mình vào biển sâu. Mang khăn theo nha.",
    icon: "trophy-outline",
    check: (p) => p.totalDives >= 10
  },
  {
    id: "dives_50",
    title: "Nửa Trăm Lần Xuống Nước",
    description: "Bạn rõ ràng thích nước hơn đất liền.",
    icon: "medal-outline",
    check: (p) => p.totalDives >= 50
  },
  {
    id: "focus_60",
    title: "Giờ Đầu Dưới Nước",
    description: "60 phút yên tĩnh trong lòng đại dương.",
    icon: "timer-outline",
    check: (p) => p.totalFocusMinutes >= 60
  },
  {
    id: "focus_300",
    title: "Cá Không Ngủ",
    description: "5 tiếng lặn — bạn đã trở thành một phần của biển.",
    icon: "moon-outline",
    check: (p) => p.totalFocusMinutes >= 300
  },
  {
    id: "focus_1000",
    title: "Huyền Thoại Tập Trung",
    description: "1000 phút không ai làm phiền bạn được.",
    icon: "flash-outline",
    check: (p) => p.totalFocusMinutes >= 1000
  },
  {
    id: "level_5",
    title: "Ngũ Hành Thủy",
    description: "Cấp 5 — nguyên tố nước đã chọn bạn.",
    icon: "leaf-outline",
    check: (p) => p.level >= 5
  },
  {
    id: "level_10",
    title: "Vua Biển Đông",
    description: "Cấp 10 — biển đã công nhận sự vĩ đại của bạn.",
    icon: "star-outline",
    check: (p) => p.level >= 10
  },
  {
    id: "collection_5",
    title: "Bộ Sưu Tập Nhí",
    description: "5 loài sinh vật — tủ kính của bạn đang đầy dần.",
    icon: "albums-outline",
    check: (_p, ex) => ex.collectionCount >= 5
  },
  {
    id: "collection_all",
    title: "Nhà Khoa Học Đại Dương",
    description: "Mọi sinh vật đã được ghi chép. Thám tử đại dương bậc nhất.",
    icon: "flask-outline",
    check: (_p, ex) => ex.collectionCount >= 12 // 9 creatures + 3 artifacts
  },
  {
    id: "streak_7",
    title: "Tuần Lặn Hoàn Hảo",
    description: "7 ngày liên tiếp — bạn là con cá thật sự rồi.",
    icon: "calendar-outline",
    check: (p) => p.currentStreakDays >= 7
  }
];

/**
 * Returns achievement definitions that are newly unlocked after this dive.
 * `alreadyUnlocked` is the list of IDs the player had BEFORE this dive.
 */
export function checkNewAchievements(
  profile: DiverProfile,
  extras: CheckExtras,
  alreadyUnlocked: string[]
): TitleAchievement[] {
  return TITLE_ACHIEVEMENTS.filter(
    (a) => !alreadyUnlocked.includes(a.id) && a.check(profile, extras)
  ).map(({ id, title, description, icon }) => ({
    id,
    title,
    description,
    icon
  }));
}
