import type { Language } from "@/domain/entities";

export type { Language };

export type Translations = typeof translations.en;

export const translations = {
  en: {
    onboarding: {
      chapters: [
        {
          title: "Breathe.",
          body: "You are standing at the surface of the ocean. The world above is loud. Down here, it isn't."
        },
        {
          title: "Descend.",
          body: "Each minute you focus, you sink a little deeper. Each zone has its own light, its own creatures, its own silence."
        },
        {
          title: "Discover.",
          body: "Hold attention long enough and the deep will show you things almost no one sees."
        },
        {
          title: "Return.",
          body: "When you surface, what you brought back is yours to keep. The dive remembers you."
        }
      ],
      holdToBegin: "HOLD TO BEGIN DESCENT",
      tapToContinue: "TAP TO CONTINUE"
    },
    profile: {
      title: "DIVER PROFILE",
      level: (n: number) => `Level ${n} Explorer`,
      xp: "XP",
      settings: "SETTINGS",
      appearance: "APPEARANCE",
      account: "ACCOUNT",
      haptics: "Haptics",
      hapticsDesc: "Tactile feedback during dives",
      reducedMotion: "Reduced motion",
      reducedMotionDesc: "Soften animated transitions",
      preferredLength: "Preferred dive length",
      language: "Language",
      languageDesc: "App display language",
      theme: "Theme",
      themeDesc: "Visual identity — colors, fonts, particles",
      themePickerTitle: "Choose a theme",
      themePickerSub:
        "Each theme reshapes the entire app — palette, typography, ambient field.",
      themeFont: "Font",
      themeParticles: "Particles",
      applyTheme: "Apply theme",
      premium: "DeepOcean Pro",
      premiumDesc: "Unlock every theme + future premium features",
      premiumActive: "All premium content unlocked. Thank you — dive on.",
      restorePurchases: "Restore purchases",
      replayOnboarding: "Replay onboarding",
      confirm: "Confirm",
      cancel: "Cancel"
    },
    home: {
      greeting: {
        awake: "Still awake",
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening"
      },
      ready: "Ready when you are.",
      beginDive: "BEGIN DIVE",
      estimatedReach: "Estimated reach",
      freeDive: "Free dive",
      freeDiveDesc: "No timer. Surface whenever you're ready.",
      guideTitle: "YOUR GUIDE SUGGESTS",
      streak: "Streak",
      dives: "Dives",
      level: "Level",
      diver: "Diver",
      min: "minutes",
      minShort: "m"
    },
    ai: {
      title: "Marine Guide",
      subtitle: "A quiet voice from the deep",
      today: "TODAY",
      listening: "Listening to the currents\u2026",
      askAgain: "ASK AGAIN",
      lastExpedition: "LAST EXPEDITION",
      mood: "MOOD",
      moodPrompt: "How do you want to feel after this dive?",
      moods: ["Calm", "Focused", "Curious", "Resolute"] as const,
      proHeader: "DEEP INSIGHTS · PRO",
      proLocked:
        "Personal trend analysis, mood-correlated dive plans, and a private breathing guide — unlock with Pro.",
      proUnlockCta: "UNLOCK DEEP INSIGHTS",
      proPatternTitle: "DIVE PATTERN",
      proPatternBody:
        "Your focus arcs longer in the evenings. Try a 25 → 12 minute split this week.",
      proMoodTitle: "MOOD MAP",
      proMoodBody:
        "Curious sessions correlate with your deepest reach. Lead with curiosity tomorrow.",
      proRitualTitle: "BREATHING RITUAL",
      proRitualBody:
        "4 in · 7 hold · 8 out. Three rounds before descent stabilises your descent rate."
    },
    stats: {
      title: "Dive Analytics",
      subtitle: "The shape of your focus",
      maxDepth: "MAX DEPTH",
      totalFocus: "TOTAL FOCUS",
      dives: "DIVES",
      level: "LEVEL",
      weeklyHeatmap: "WEEKLY HEATMAP",
      recentExpeditions: "RECENT EXPEDITIONS",
      noDives: "No dives yet. Your first descent will appear here.",
      less: "less",
      more: "more"
    },
    collection: {
      title: "Expedition Log",
      catalogued: (found: number, total: number) =>
        `${found} / ${total} catalogued`,
      undiscovered: "Undiscovered",
      story: {
        whisperLabel: "WHISPER FROM THE DEEP",
        firstSeen: "First sighted",
        sightings: (n: number) =>
          n === 1 ? "Encountered once" : `Encountered ${n} times`,
        rarityLabel: "RARITY",
        zoneLabel: "ZONE",
        storyTitle: "FIELD ENTRY",
        proTitle: "EXPEDITION JOURNAL · PRO",
        proLocked:
          "Pro divers unlock the full field journal: folklore, theories, sealed witness notes.",
        proUnlockCta: "UNLOCK FIELD JOURNAL",
        lockedTitle: "Still in the dark",
        lockedBody:
          "This entry has not surfaced yet. Keep diving — every minute below shifts the odds.",
        close: "Surface",
        creature: "CREATURE",
        artifact: "ARTIFACT"
      }
    },
    dive: {
      discoveries: (n: number) =>
        n === 1 ? "1 discovery" : `${n} discoveries`,
      resumeDive: "Resume dive",
      pause: "Pause",
      surface: "Surface",
      abort: "Abort",
      surfaceTitle: "Surface now?",
      surfaceMsg: "You can return to the deep anytime.",
      keepDiving: "Keep diving",
      abortTitle: "Abort dive?",
      abortMsg: "This dive will be discarded.",
      continue: "Continue"
    },
    paywall: {
      title: "Dive Deeper with Pro",
      subtitle:
        "Unlock every theme, future premium features, and support a small studio building calmly.",
      unlockingTheme: (name: string) => `Unlocking “${name}”`,
      benefits: [
        "All 4 premium themes + future drops",
        "Unique ambient particle fields per theme",
        "Custom display font per theme",
        "Priority for new dive zones & creatures"
      ] as const,
      lifetimeCta: "UNLOCK EVERYTHING",
      lifetimePrice: "$14.99 · one-time",
      singlePackCta: "UNLOCK THIS THEME ONLY",
      singlePackPrice: "$3.99",
      maybeLater: "Maybe later",
      disclaimer:
        "Mock IAP — tapping unlock toggles a local flag. Wire RevenueCat / react-native-iap for real billing."
    }
  },
  vi: {
    onboarding: {
      chapters: [
        {
          title: "Thở đi.",
          body: "Bạn đang đứng ở mặt biển. Thế giới bên trên ồn ào lắm. Ở đây thì không."
        },
        {
          title: "Xuống thôi.",
          body: "Mỗi phút tập trung, bạn lặn thêm một chút. Mỗi vùng biển có ánh sáng riêng, sinh vật riêng, sự yên lặng riêng."
        },
        {
          title: "Khám phá.",
          body: "Giữ sự chú ý đủ lâu và biển sâu sẽ cho bạn thấy những thứ mà hầu như chẳng ai nhìn thấy."
        },
        {
          title: "Trở về.",
          body: "Khi bạn nổi lên, tất cả những gì mang về đều là của bạn. Biển nhớ bạn đấy."
        }
      ],
      holdToBegin: "GIỮ ĐỂ BẮT ĐẦU XUỐNG BIỂN",
      tapToContinue: "CHẠM ĐỂ TIẾP TỤC"
    },
    profile: {
      title: "HỒ SƠ CỦA BẠN",
      level: (n: number) => `Cấp ${n} · Thám hiểm viên`,
      xp: "ĐIỂM XP",
      settings: "CÀI ĐẶT",
      appearance: "GIAO DIỆN",
      account: "TÀI KHOẢN",
      haptics: "Rung",
      hapticsDesc: "Rung nhẹ theo nhịp lặn — không phải bị gọi đâu",
      reducedMotion: "Bớt hiệu ứng",
      reducedMotionDesc: "Giảm animation cho mượt máy",
      preferredLength: "Mỗi lần lặn bao lâu?",
      language: "Ngôn ngữ",
      languageDesc: "Chọn ngôn ngữ hiển thị trong app",
      theme: "Chủ đề giao diện",
      themeDesc: "Màu, font chữ, particle — đổi sạch luôn",
      themePickerTitle: "Chọn chủ đề cho app",
      themePickerSub:
        "Mỗi theme thay đổi toàn bộ màu, chữ, hạt lơ lửng — cả cảm giác lặn cũng khác.",
      themeFont: "Font",
      themeParticles: "Hạt",
      applyTheme: "Áp dụng chủ đề",
      premium: "DeepOcean Pro",
      premiumDesc: "Mở khoá tất cả theme + tính năng cao cấp sắp ra mắt",
      premiumActive: "Đã mở khoá toàn bộ. Cảm ơn bạn — lặn vui nha!",
      restorePurchases: "Khôi phục thanh toán",
      replayOnboarding: "Xem lại phần giới thiệu",
      confirm: "Xác nhận",
      cancel: "Huỷ"
    },
    home: {
      greeting: {
        awake: "Đêm hôm vẫn chưa ngủ à?",
        morning: "Sáng rồi, tỉnh chưa?",
        afternoon: "Chiều rồi đó,",
        evening: "Tối rồi, lặn chút thôi,"
      },
      ready: "Sẵn sàng thì nhảy xuống thôi.",
      beginDive: "BẮT ĐẦU LẶN",
      estimatedReach: "Dự kiến xuống tới",
      freeDive: "Lặn tự do",
      freeDiveDesc: "Không đồng hồ, không áp lực. Nổi lên khi nào cũng được.",
      guideTitle: "NGƯỜI HƯỚNG DẪN GỢI Ý",
      streak: "Liên tiếp",
      dives: "Lần lặn",
      level: "Cấp độ",
      diver: "Thợ lặn",
      min: "phút",
      minShort: "ph"
    },
    ai: {
      title: "La Bàn Biển Cả",
      subtitle: "Tiếng thì thầm từ nơi ánh sáng không chạm tới",
      today: "HÔM NAY",
      listening: "Đang hỏi cá biển xem thế nào\u2026",
      askAgain: "HỎI LẠI",
      lastExpedition: "CHUYẾN LẶN GẦN NHẤT",
      mood: "TÂM TRẠNG",
      moodPrompt: "Hôm nay muốn cảm thấy thế nào sau khi lặn?",
      moods: ["Bình yên", "Tập trung", "Tò mò", "Quyết tâm"] as const,
      proHeader: "PHÂN TÍCH SÂU · PRO",
      proLocked:
        "Phân tích xu hướng cá nhân, kế hoạch lặn theo tâm trạng và bài thở riêng — chỉ có ở bản Pro.",
      proUnlockCta: "MỞ PHÂN TÍCH SÂU",
      proPatternTitle: "NHỊP LẶN",
      proPatternBody:
        "Buổi tối bạn lặn bền hơn. Thử chia 25 → 12 phút trong tuần này xem sao.",
      proMoodTitle: "BẢN ĐỒ TÂM TRẠNG",
      proMoodBody:
        "Những hôm bạn thấy tò mò lại là những hôm lặn sâu nhất. Mai cứ lặn trong tinh thần đó.",
      proRitualTitle: "NGHI THỨC HÍT THỞ",
      proRitualBody:
        "Hít 4 · giữ 7 · thở 8. Ba vòng trước khi lặn là tốc độ xuống ên như lụa."
    },
    stats: {
      title: "Thống kê chiến tích",
      subtitle: "Bạn đã lặn xa tới đâu rồi?",
      maxDepth: "ĐỘ SÂU KỶ LỤC",
      totalFocus: "TỔNG GIỜ TẬP TRUNG",
      dives: "LẦN LẶN",
      level: "CẤP ĐỘ",
      weeklyHeatmap: "7 NGÀY QUA",
      recentExpeditions: "CHUYẾN LẶN GẦN ĐÂY",
      noDives: "Chưa có gì cả. Nhảy xuống lặn thử đi, nước ấm lắm!",
      less: "ít",
      more: "nhiều"
    },
    collection: {
      title: "Nhật ký thám hiểm",
      catalogued: (found: number, total: number) =>
        `Tìm được ${found} / ${total} loài`,
      undiscovered: "Còn ẩn trong bóng tối",
      story: {
        whisperLabel: "TIẾNG THÌ THẦM TỪ ĐÁY BIỂN",
        firstSeen: "Lần đầu gặp",
        sightings: (n: number) =>
          n === 1 ? "Mới gặp 1 lần" : `Đã gặp ${n} lần`,
        rarityLabel: "ĐỘ HIẾM",
        zoneLabel: "VÙNG BIỂN",
        storyTitle: "GHI CHÉP CHUYẾN LẶN",
        proTitle: "NHẬT KÝ MẬT · PRO",
        proLocked:
          "Diver Pro mới được mở trang nhật ký mật: truyền thuyết, giả thuyết, lời khai chưa công bố.",
        proUnlockCta: "MỞ NHẬT KÝ MẬT",
        lockedTitle: "Vẫn còn ẩn mình",
        lockedBody:
          "Thứ này chưa từng lộ diện với bạn. Cứ lặn tiếp đi — mỗi phút dưới biển là một cơ hội mới.",
        close: "Nổi lên",
        creature: "SINH VẬT",
        artifact: "CỔ VẬT"
      }
    },
    dive: {
      discoveries: (n: number) =>
        n === 1 ? "Tìm thấy 1 thứ!" : `Tìm thấy ${n} thứ!`,
      resumeDive: "Lặn tiếp",
      pause: "Nghỉ một chút",
      surface: "Nổi lên",
      abort: "Nghỉ luông",
      surfaceTitle: "Về mặt nước thôi?",
      surfaceMsg: "Biển lúc nào cũng ở đây chờ bạn.",
      keepDiving: "Chưa, lặn thêm chút",
      abortTitle: "Bỏ cuộc rồi à?",
      abortMsg: "Chuyến này sẽ không được lưu lại đâu nhé.",
      continue: "Không, lặn tiếp"
    },
    paywall: {
      title: "Lặn sâu hơn với Pro",
      subtitle:
        "Mở khoá tất cả theme, các tính năng cao cấp sắp tới, và ủng hộ đội ngũ nhỏ đang làm app một cách tử tế.",
      unlockingTheme: (name: string) => `Mở khoá “${name}”`,
      benefits: [
        "4 theme premium + các theme sắp ra",
        "Ambient particle field riêng cho từng theme",
        "Font chữ hiển thị riêng cho từng theme",
        "Ưu tiên vùng lặn & sinh vật mới"
      ] as const,
      lifetimeCta: "MỞ TẤT CẢ",
      lifetimePrice: "349.000đ · một lần",
      singlePackCta: "CHỈ MỞ THEME NÀY",
      singlePackPrice: "99.000đ",
      maybeLater: "Để sau",
      disclaimer:
        "IAP giả lập — nút unlock chỉ bật flag local. Tích hợp RevenueCat / react-native-iap khi lên prod."
    }
  }
} as const;
