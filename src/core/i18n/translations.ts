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
      level: (n: number) => `Level ${n} - Explorer`,
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
      themeLockedCount: (count: number) =>
        `${count} premium theme${count === 1 ? "" : "s"} locked · upgrade to Pro`,
      proOnly: "PRO",
      themeFont: "Font",
      themeParticles: "Particles",
      applyTheme: "Apply theme",
      premium: "DeepOcean Pro",
      premiumDesc: "Unlock every theme + future premium features",
      premiumActive: "All premium content unlocked. Thank you — dive on.",
      replayOnboarding: "Replay onboarding",
      confirm: "Confirm",
      cancel: "Cancel",
      editNameTitle: "DIVER NAME",
      editNamePlaceholder: "Enter your name",
      editNameSave: "SAVE",
      soundVolume: "Ambient sound",
      soundVolumeDesc: "Volume level of underwater ambience",
      soundOff: "Off",
      soundLow: "Low",
      soundFull: "Full",
      diveReminders: "Dive reminders",
      diveRemindersDesc: "Daily nudge to keep your streak alive",
      reminderTime: "Reminder time",
      reminderTimeDesc: "When your daily nudge arrives",
      showDiscoveries: "Discovery alerts",
      showDiscoveriesDesc: "Show pop-ups when you encounter something",
      devEnablePremium: "Enable premium",
      devEnablePremiumDesc:
        "Local test toggle for premium UI and feature gates",
      developer: "DEVELOPER",
      about: "ABOUT",
      appVersion: "Version",
      appVersionValue: "#Ynot",
      builtWith: "Built with care for the deep"
    },
    notifications: {
      reminderTitle: "The deep is calling",
      reminderBody: "Take a breath and dive. Your streak is waiting.",
      pickerTitle: "Reminder time",
      pickerSubtitle: "Pick when your daily nudge arrives",
      hours: "Hours",
      minutes: "Minutes"
    },
    home: {
      greeting: {
        awake: "Still awake?",
        morning: "Good morning,",
        afternoon: "Good afternoon,",
        evening: "Good evening,"
      },
      ready: "Ready when you are.",
      beginDive: "BEGIN DIVE",
      estimatedReach: "Estimated reach",
      freeDive: "Free dive",
      freeDiveDesc: "No timer. Surface whenever you're ready.",
      customDuration: "Custom duration",
      startCustomDive: "START CUSTOM DIVE",
      startFreeDive: "START FREE DIVE",
      guideTitle: "YOUR GUIDE SUGGESTS",
      streak: "Streak",
      dives: "Dives",
      level: "Level",
      diver: "Diver",
      min: "minutes",
      minShort: "m",
      lastDiveTitle: "LAST DIVE",
      lastDiveZone: "Zone",
      lastDiveMinutes: (n: number) => `${n} min`,
      lastDiveXp: (n: number) => `+${n} XP`,
      zoneProgressTitle: "DEPTH PROGRESS",
      zoneLocked: "Locked",
      noSessions: "No dives yet",
      streakMilestoneTitle: "STREAK MILESTONE",
      streakMilestoneBody: (days: number, target: number) =>
        `You're on a ${days}-day streak. Reach ${target} days for your next milestone.`,
      streakMilestoneReached: (days: number) =>
        `Incredible run. You reached a ${days}-day streak.`,
      streakMilestoneCta: "KEEP THE STREAK"
    },
    ai: {
      title: "Marine Guide",
      subtitle: "A quiet voice from the deep",
      today: "TODAY",
      listening: "Listening to the currents\u2026",
      askAgain: "ASK AGAIN",
      refreshError: "Unable to refresh now. Please try again.",
      nudge: "A NUDGE FOR YOU",
      lastExpedition: "LAST EXPEDITION",
      mood: "MOOD",
      moodPrompt: "How do you want to feel after this dive?",
      moodLabels: {
        focused: "Focused",
        tired: "Tired",
        burned_out: "Burned out",
        motivated: "Motivated",
        curious: "Curious",
        happy: "Happy",
        calm: "Calm",
        excited: "Excited",
        anxious: "Anxious",
        stressed: "Stressed",
        distracted: "Distracted",
        bored: "Bored",
        sleepy: "Sleepy",
        sluggish: "Sluggish",
        overwhelmed: "Overwhelmed"
      },
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
    sessionDetail: {
      title: "Expedition Report",
      duration: "DURATION",
      focusMinutes: "FOCUS",
      xpEarned: "XP EARNED",
      maxDepth: "MAX DEPTH",
      discoveries: "DISCOVERIES",
      levelUp: (from: number, to: number) => `Level ${from} → ${to}`,
      noLevelChange: "No level change",
      zoneJourney: "ZONE JOURNEY",
      discoveryLog: "DISCOVERY LOG",
      noDiscoveries: "No creatures or artifacts surfaced this dive.",
      reachedAt: (m: number) => `at ${m} min`,
      minuteMark: (m: number) => `${m}m`,
      notFound: "This expedition could not be found.",
      shareTitle: "SHARE THIS DIVE",
      shareCta: "SHARE EXPEDITION",
      shareText: (
        minutes: number,
        depth: string,
        xp: number,
        discoveries: number
      ) =>
        `My DeepOcean dive: ${minutes} min focused, ${depth} m depth, +${xp} XP, ${discoveries} discoveries.`
    },
    collection: {
      title: "Expedition Log",
      catalogued: (found: number, total: number) =>
        `${found} / ${total} catalogued`,
      undiscovered: "Undiscovered",
      filters: {
        all: "All",
        zone: "Zone",
        rarity: "Rarity",
        common: "Common",
        uncommon: "Uncommon",
        rare: "Rare",
        legendary: "Legendary",
        mythic: "Mythic",
        proDetailsLabel: "Pro details",
        noResults: "No entries match this filter yet."
      },
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
      discovered: "DISCOVERED",
      creature: "Creature",
      artifact: "Artifact",
      resumeDive: "Resume dive",
      pause: "Pause",
      surface: "Surface",
      abort: "Abort",
      surfaceTitle: "Surface now?",
      surfaceMsg: "You can return to the deep anytime.",
      keepDiving: "Keep diving",
      abortTitle: "ABORT DIVE?",
      abortMsg: "This dive will be discarded.",
      continue: "Continue"
    },
    paywall: {
      title: "Dive Deeper with Pro",
      subtitle:
        "Unlock every zone, theme, and AI companion. Support a small studio building calmly.",
      compareTitle: "Standard vs Pro",
      compareFree: "Standard",
      comparePro: "Pro",
      compareThemesLabel: "Theme access",
      compareThemesFree: "1 theme",
      compareThemesPro: "All themes",
      compareJournalLabel: "Expedition journal",
      compareJournalFree: "Teaser only",
      compareJournalPro: "Full entries",
      compareAiLabel: "AI guidance",
      compareAiFree: "Basic",
      compareAiPro: "Deep insights",
      unlockingTheme: (name: string) => `Unlocking "${name}"`,
      unlockingThemeHint:
        "This theme is locked. Upgrade to Pro to apply it immediately.",
      benefits: [
        {
          icon: "water",
          title: "Explore Every Depth",
          body: "Unlock all 5 ocean zones — from the Sunlit Zone to the Hadal Trench."
        },
        {
          icon: "diamond",
          title: "6 Premium Themes",
          body: "Unique visual identity for each zone: ambient particles, depth fog, custom typography."
        },
        {
          icon: "sparkles",
          title: "AI Dive Companion",
          body: "Personalized coaching that adapts to your diving patterns and focus rhythms."
        },
        {
          icon: "telescope",
          title: "Exclusive Discoveries",
          body: "Rare & mythic creatures only accessible to Pro divers. Over 160 entries in your bestiary."
        }
      ] as const,
      planLifetime: "LIFETIME",
      planAnnual: "1 YEAR",
      planMonthly: "MONTHLY",
      planLifetimeSub: "one-time",
      planMonthlySub: "/ month",
      lifetimeCta: "LIFETIME — UNLOCK EVERYTHING",
      lifetimePrice: "37.89$",
      annualCta: "1 YEAR — BEST VALUE",
      annualPrice: "22.72$ / year",
      annualPricePerMonth: "1.89$ / month",
      annualSaving: "Save 50%",
      monthlyCta: "MONTHLY",
      monthlyPrice: "3.75$ / month",
      trialBadge: "7-DAY FREE TRIAL",
      trialDescription:
        "Try everything free for 7 days. Cancel anytime before renewal.",
      trialCta: "START FREE TRIAL",
      promoPlaceholder: "Experience code",
      promoApply: "APPLY",
      promoInvalid: "Invalid code",
      promoExpired: "Code has expired",
      promoSuccess: (days: number) =>
        `Active · ${days} day${days === 1 ? "" : "s"} left`,
      restore: "RESTORE PURCHASES",
      unavailable: "Purchases are unavailable on this build.",
      errorTitle: "Purchase failed",
      errorBody: "Something went wrong. No charge was made — please try again.",
      disclaimer:
        "Billing is handled by the App Store / Google Play. Subscriptions renew automatically. Cancel anytime."
    },
    achievement: {
      zoneUnlocked: "ZONE UNLOCKED",
      tapToDismiss: "Tap anywhere to continue"
    },
    levelUp: {
      badge: "LEVEL UP",
      multiLevel: (n: number) => `LEVEL UP ×${n}`,
      from: (prev: number, next: number) => `Level ${prev} → Level ${next}`,
      tapToDismiss: "Tap anywhere to continue"
    },
    titleAchievement: {
      badge: "ACHIEVEMENT UNLOCKED",
      tapToDismiss: "Tap anywhere to continue"
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
      themeLockedCount: (count: number) =>
        `Đang khóa ${count} theme premium · nâng cấp Pro để mở`,
      proOnly: "PRO",
      themeFont: "Font",
      themeParticles: "Hạt",
      applyTheme: "Áp dụng chủ đề",
      premium: "DeepOcean Pro",
      premiumDesc: "Mở khoá tất cả theme + tính năng cao cấp sắp ra mắt",
      premiumActive: "Đã mở khoá toàn bộ. Cảm ơn bạn — lặn vui nha!",
      replayOnboarding: "Xem lại phần giới thiệu",
      confirm: "Xác nhận",
      cancel: "Huỷ",
      editNameTitle: "TÊN CỦA BẠN",
      editNamePlaceholder: "Nhập tên thợ lặn",
      editNameSave: "LƯU LẠI",
      soundVolume: "Âm thanh biển",
      soundVolumeDesc: "Mức âm lượng tiếng sóng khi lặn",
      soundOff: "Tắt",
      soundLow: "Nhỏ",
      soundFull: "To",
      diveReminders: "Nhắc nhở lặn",
      diveRemindersDesc: "Nhắc bạn nhảy xuống mỗi ngày để giữ streak",
      reminderTime: "Giờ nhắc nhở",
      reminderTimeDesc: "Thời điểm lời nhắc mỗi ngày xuất hiện",
      showDiscoveries: "Thông báo khám phá",
      showDiscoveriesDesc: "Hiện pop-up khi bắt gặp sinh vật/cổ vật",
      devEnablePremium: "Bật premium",
      devEnablePremiumDesc:
        "Bật nhanh premium cục bộ để test UI và các tính năng bị khóa",
      developer: "NHÀ PHÁT TRIỂN",
      about: "VỀ ỨNG DỤNG",
      appVersion: "Phiên bản",
      appVersionValue: "#Ynot",
      builtWith: "Làm ra bởi tình yêu với biển sâu"
    },
    notifications: {
      reminderTitle: "Biển sâu đang gọi",
      reminderBody: "Hít một hơi và lặn xuống. Streak của bạn đang đợi.",
      pickerTitle: "Giờ nhắc nhở",
      pickerSubtitle: "Chọn thời điểm lời nhắc mỗi ngày",
      hours: "Giờ",
      minutes: "Phút"
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
      customDuration: "Thời lượng tuỳ chỉnh",
      startCustomDive: "BẮT ĐẦU LẶN TUỲ CHỈNH",
      startFreeDive: "BẮT ĐẦU LẶN TỰ DO",
      guideTitle: "NGƯỜI HƯỚNG DẪN GỢI Ý",
      streak: "Liên tiếp",
      dives: "Lần lặn",
      level: "Cấp độ",
      diver: "Thợ lặn",
      min: "phút",
      minShort: "ph",
      lastDiveTitle: "CHUYẾN LẶN TRƯỚC",
      lastDiveZone: "Vùng",
      lastDiveMinutes: (n: number) => `${n} phút`,
      lastDiveXp: (n: number) => `+${n} XP`,
      zoneProgressTitle: "TIẾN ĐỘ ĐỘ SÂU",
      zoneLocked: "Chưa mở",
      noSessions: "Chưa lặn lần nào",
      streakMilestoneTitle: "MỐC STREAK",
      streakMilestoneBody: (days: number, target: number) =>
        `Bạn đang giữ streak ${days} ngày. Chạm mốc ${target} ngày để mở milestone tiếp theo.`,
      streakMilestoneReached: (days: number) =>
        `Quá đỉnh. Bạn đã chạm streak ${days} ngày liên tiếp.`,
      streakMilestoneCta: "GIỮ STREAK"
    },
    ai: {
      title: "La Bàn Biển Cả",
      subtitle: "Tiếng thì thầm từ nơi ánh sáng không chạm tới",
      today: "HÔM NAY",
      listening: "Đang hỏi cá biển xem thế nào\u2026",
      askAgain: "HỎI LẠI",
      refreshError: "Làm mới chưa thành công. Thử lại giúp mình nhé.",
      nudge: "LỜI ĐỘNG VIÊN CHO BẠN",
      lastExpedition: "CHUYẾN LẶN GẦN NHẤT",
      mood: "TÂM TRẠNG",
      moodPrompt: "Hôm nay muốn cảm thấy thế nào sau khi lặn?",
      moodLabels: {
        focused: "Tập trung",
        tired: "Mệt mỏi",
        burned_out: "Kiệt sức",
        motivated: "Hăng hái",
        curious: "Tò mò",
        anxious: "Lo lắng",
        excited: "Hào hứng",
        happy: "Hạnh phúc",
        calm: "Bình yên",
        stressed: "Căng thẳng",
        distracted: "Dễ xao nhãng",
        sleepy: "Buồn ngủ",
        bored: "Chán nản",
        sluggish: "Uể oải",
        overwhelmed: "Quá tải"
      },
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
    sessionDetail: {
      title: "Báo cáo chuyến lặn",
      duration: "THỜI LƯỢNG",
      focusMinutes: "TẬP TRUNG",
      xpEarned: "XP NHẬN ĐƯỢC",
      maxDepth: "ĐỘ SÂU",
      discoveries: "KHÁM PHÁ",
      levelUp: (from: number, to: number) => `Cấp ${from} → ${to}`,
      noLevelChange: "Chưa lên cấp",
      zoneJourney: "HÀNH TRÌNH CÁC TẦNG",
      discoveryLog: "NHẬT KÝ KHÁM PHÁ",
      noDiscoveries: "Chuyến này chưa gặp sinh vật hay cổ vật nào.",
      reachedAt: (m: number) => `phút ${m}`,
      minuteMark: (m: number) => `phút ${m}`,
      notFound: "Không tìm thấy chuyến lặn này.",
      shareTitle: "CHIA SẺ CHUYẾN LẶN",
      shareCta: "CHIA SẺ BÁO CÁO",
      shareText: (
        minutes: number,
        depth: string,
        xp: number,
        discoveries: number
      ) =>
        `Mình vừa lặn với DeepOcean: tập trung ${minutes} phút, xuống ${depth} m, +${xp} XP, khám phá ${discoveries} mục.`
    },
    collection: {
      title: "Nhật ký thám hiểm",
      catalogued: (found: number, total: number) =>
        `Tìm được ${found} / ${total} loài`,
      undiscovered: "Còn ẩn trong bóng tối",
      filters: {
        all: "Tất cả",
        zone: "Vùng",
        rarity: "Độ hiếm",
        common: "Thường",
        uncommon: "Hiếm vừa",
        rare: "Hiếm",
        legendary: "Huyền thoại",
        mythic: "Thần thoại",
        proDetailsLabel: "Chi tiết Pro",
        noResults: "Bộ lọc này chưa có mục nào."
      },
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
      discovered: "ĐÃ KHÁM PHÁ",
      creature: "Sinh vật",
      artifact: "Cổ vật",
      resumeDive: "Lặn tiếp",
      pause: "Nghỉ một chút",
      surface: "Nổi lên",
      abort: "Nghỉ luôn",
      surfaceTitle: "Về mặt nước thôi?",
      surfaceMsg: "Biển lúc nào cũng ở đây chờ bạn.",
      keepDiving: "Chưa, lặn thêm chút",
      abortTitle: "BỎ CUỘC RỒI À?",
      abortMsg: "Chuyến này sẽ không được lưu lại đâu nhé.",
      continue: "Không, lặn tiếp"
    },
    paywall: {
      title: "Lặn sâu hơn với Pro",
      subtitle:
        "Mở khoá mọi vùng biển, theme và AI Companion. Ủng hộ đội ngũ nhỏ đang làm app.",
      compareTitle: "Bản thường vs Pro",
      compareFree: "Bản thường",
      comparePro: "Pro",
      compareThemesLabel: "Theme có thể dùng",
      compareThemesFree: "1 theme",
      compareThemesPro: "Toàn bộ",
      compareJournalLabel: "Nhật ký thám hiểm",
      compareJournalFree: "Chỉ xem nhá hàng",
      compareJournalPro: "Xem đầy đủ",
      compareAiLabel: "Hướng dẫn AI",
      compareAiFree: "Cơ bản",
      compareAiPro: "Phân tích sâu",
      unlockingTheme: (name: string) => `Mở khoá "${name}"`,
      unlockingThemeHint:
        "Theme này đang bị khóa. Nâng cấp Pro để áp dụng ngay.",
      benefits: [
        {
          icon: "water",
          title: "Khám phá mọi độ sâu",
          body: "Mở khoá cả 5 vùng biển — từ Vùng Mặt trời đến Rãnh Hadal."
        },
        {
          icon: "diamond",
          title: "6 Theme Premium",
          body: "Giao diện riêng cho từng vùng: ambient particle, sương sâu, font chữ độc quyền."
        },
        {
          icon: "sparkles",
          title: "AI Dive Companion",
          body: "Hướng dẫn cá nhân hoá theo nhịp lặn và mức tập trung của bạn."
        },
        {
          icon: "telescope",
          title: "Khám phá Độc quyền",
          body: "Sinh vật hiếm và huyền thoại chỉ dành cho Pro. Hơn 160 mục trong bộ sưu tập."
        }
      ] as const,
      planLifetime: "MÃI MÃI",
      planAnnual: "1 NĂM",
      planMonthly: "THÁNG",
      planLifetimeSub: "một lần",
      planMonthlySub: "/ tháng",
      lifetimeCta: "LIFETIME — MỞ TẤT CẢ",
      lifetimePrice: "999.000đ",
      annualCta: "1 NĂM — TỐT NHẤT",
      annualPrice: "599.000đ / năm",
      annualPricePerMonth: "49.917đ / tháng",
      annualSaving: "Tiết kiệm 50%",
      monthlyCta: "THEO THÁNG",
      monthlyPrice: "99.000đ / tháng",
      trialBadge: "7 NGÀY MIỄN PHÍ",
      trialDescription:
        "Trải nghiệm miễn phí 7 ngày. Hủy bất cứ lúc nào trước khi gia hạn.",
      trialCta: "BẮT ĐẦU DÙNG THỬ MIỄN PHÍ",
      promoPlaceholder: "Mã trải nghiệm",
      promoApply: "ÁP DỤNG",
      promoInvalid: "Mã không hợp lệ",
      promoExpired: "Mã đã hết hạn",
      promoSuccess: (days: number) => `Hoạt động · còn ${days} ngày`,
      restore: "KHÔI PHỤC GIAO DỊCH",
      unavailable: "Bản dựng này chưa hỗ trợ mua hàng.",
      errorTitle: "Mua hàng thất bại",
      errorBody: "Đã có lỗi xảy ra. Bạn chưa bị trừ tiền — vui lòng thử lại.",
      disclaimer:
        "Thanh toán qua App Store / Google Play. Gói đăng ký tự gia hạn. Hủy bất kỳ lúc nào."
    },
    achievement: {
      zoneUnlocked: "VÙNG MỚI MỞ KHOÁ",
      tapToDismiss: "Chạm vào bất kỳ đâu để tiếp tục"
    },
    levelUp: {
      badge: "LÊN CẤP",
      multiLevel: (n: number) => `LÊN CẤP ×${n}`,
      from: (prev: number, next: number) => `Cấp ${prev} → Cấp ${next}`,
      tapToDismiss: "Chạm vào bất kỳ đâu để tiếp tục"
    },
    titleAchievement: {
      badge: "THÀNH TỰU MỚI",
      tapToDismiss: "Chạm vào bất kỳ đâu để tiếp tục"
    }
  }
} as const;
