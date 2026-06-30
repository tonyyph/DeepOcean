export const vi = {
  common: {
    dismiss: "Đóng"
  },
  onboarding: {
    chapters: [
      {
        title: "DeepOcean",
        depth: "MẶT NƯỚC",
        body: "Một phiên tập trung trở thành một chuyến lặn.",
        detail:
          "Chọn thời lượng, đặt điện thoại xuống, rồi để app giữ nhịp bằng âm thanh dịu, độ sâu và một nơi rõ ràng để bạn quay lại."
      },
      {
        title: "Phiên lặn",
        depth: "VÙNG CHẠNG VẠNG",
        body: "Mỗi phút tập trung đưa bạn xuống sâu thêm một chút.",
        detail:
          "Bạn có thể đặt giờ hoặc lặn tự do. Màn hình lặn theo dõi thời gian, độ sâu và vùng biển nhưng vẫn đủ yên để không kéo bạn khỏi việc chính."
      },
      {
        title: "XP và streak",
        depth: "VÙNG NỬA ĐÊM",
        body: "Kết thúc chuyến lặn để nhận XP, cấp độ và tiến độ streak.",
        detail:
          "DeepOcean thưởng cho sự đều đặn mà không gây áp lực. Phiên ngắn vẫn có giá trị, lặn lâu hơn thì chạm vùng sâu hơn."
      },
      {
        title: "Bộ sưu tập",
        depth: "VỰC SÂU",
        body: "Sinh vật, cổ vật và ghi chép sẽ hiện ra sau những lần thật sự tập trung.",
        detail:
          "Nhật ký thám hiểm ban đầu sẽ trống, rồi lớn dần sau mỗi chuyến lặn. Mục bị khóa cũng nói rõ bạn nên làm gì tiếp."
      },
      {
        title: "Càng lặn càng riêng",
        depth: "RÃNH SÂU",
        body: "Theme sâu hơn, nhật ký đầy đủ và insight cá nhân nằm sẵn trong chuyến lặn.",
        detail:
          "DeepOcean giữ trải nghiệm yên tĩnh và trọn vẹn: hướng dẫn riêng, nhật ký giàu hơn và giao diện thanh lịch đều là một phần của app."
      }
    ],
    pageLabel: "Trang giới thiệu",
    back: "TRƯỚC",
    next: "TIẾP",
    holdToBegin: "BẮT ĐẦU CHUYẾN LẶN ĐẦU",
    tapToContinue: "CHẠM ĐỂ TIẾP TỤC",
    welcomeTitle: "DeepOcean",
    welcomeBody:
      "Biến phiên tập trung thành một chuyến lặn yên tĩnh, rồi để app dựng kế hoạch đầu tiên theo đúng điều bạn muốn cải thiện.",
    goalEyebrow: "BƯỚC 1 · MỤC TIÊU",
    goalTitle: "Bạn muốn lặn về phía nào?",
    goalBody:
      "Chọn ít nhất một mục tiêu. Tối đa sáu mục tiêu để kế hoạch vẫn gọn và dễ làm.",
    goalValidation: "Chọn ít nhất một mục tiêu để tiếp tục.",
    goalOptions: {
      improve_focus: "Tập trung tốt hơn",
      build_consistency: "Đều đặn hơn",
      reduce_stress: "Giảm căng thẳng",
      learn_better: "Học hiệu quả hơn",
      track_progress: "Theo dõi tiến độ",
      build_daily_routine: "Xây routine hằng ngày",
      stay_motivated: "Giữ động lực",
      improve_productivity: "Năng suất hơn"
    },
    planEyebrow: "BƯỚC 2 · KẾ HOẠCH RIÊNG",
    planTitle: "Dòng chảy đầu tiên đang hình thành",
    planBody:
      "DeepOcean biến mục tiêu thành kế hoạch tập trung ngắn gọn. Nếu AI chưa sẵn sàng, guide cục bộ vẫn tạo gợi ý để bạn đi tiếp.",
    recommendationReason: "VÌ SAO GỢI Ý NÀY HỢP",
    recommendationFallback:
      "Đang dùng fallback offline. Kế hoạch vẫn được lưu và có thể dùng ngay.",
    retryRecommendation: "THỬ LẠI",
    workflowEyebrow: "BƯỚC 3 · WORKFLOW",
    workflowTitle: "Chọn nhịp bắt đầu",
    workflowBody:
      "Đây sẽ là workflow app ghi nhớ cho bạn. Sau này có thể đổi trong Hồ sơ.",
    workflowOptions: {
      daily_focus: {
        id: "daily_focus" as const,
        title: "Workflow tập trung hằng ngày",
        description:
          "Một nhịp ổn định để mỗi ngày có một phiên thật sự hữu ích.",
        steps: [
          "Chọn một việc",
          "Lặn theo timer mặc định",
          "Ghi lại một tiến triển"
        ],
        estimatedTime: "25 phút mỗi vòng"
      },
      deep_work: {
        id: "deep_work" as const,
        title: "Workflow làm việc sâu",
        description: "Block chú ý dài hơn cho việc giá trị nhất.",
        steps: ["Dọn nhiễu", "Lặn 45 phút", "Hồi phục 5 phút"],
        estimatedTime: "45 phút mỗi vòng",
        isPremium: true
      },
      recovery: {
        id: "recovery" as const,
        title: "Workflow hồi phục",
        description: "Phiên lặn mềm hơn khi căng thẳng là vật cản chính.",
        steps: ["Thở chậm", "Lặn 15 phút", "Nổi lên từ tốn"],
        estimatedTime: "15 phút mỗi vòng"
      },
      learning: {
        id: "learning" as const,
        title: "Workflow học sâu",
        description: "Học, nhớ lại, rồi giữ phần ghi chú mạnh nhất.",
        steps: ["Chọn một bài", "Lặn 25 phút", "Viết lại ba dòng nhớ được"],
        estimatedTime: "25 phút mỗi vòng"
      },
      habit_building: {
        id: "habit_building" as const,
        title: "Workflow xây thói quen",
        description: "Làm nghi thức bắt đầu nhỏ hơn lực cản của bạn.",
        steps: [
          "Dùng một tín hiệu hằng ngày",
          "Lặn 15 phút",
          "Lặp lại ngày mai"
        ],
        estimatedTime: "15 phút mỗi vòng"
      }
    },
    completeEyebrow: "SẴN SÀNG",
    completeTitle: "Hệ thống lặn của bạn đã xong",
    completeBody:
      "DeepOcean sẽ nhớ mục tiêu, gợi ý và workflow để phiên sau mở ra đúng ngữ cảnh hơn.",
    summaryTitle: "THIẾT LẬP ĐÃ LƯU",
    defaultWorkflowTitle: "Workflow tập trung hằng ngày",
    startPersonalized: "VÀO DEEPOCEAN"
  },
  guidance: {
    ai: {
      title: "Người hướng dẫn sẽ hiểu bạn hơn sau mỗi lần lặn",
      body: "Hoàn thành phiên tập trung đầu tiên để gợi ý dựa trên nhịp lặn, tâm trạng và chuyến gần nhất thay vì chỉ nói chung chung."
    },
    collection: {
      title: "Nhật ký trống là có chủ ý",
      body: "Hoàn thành các chuyến lặn để mở sinh vật và cổ vật. Mục bị khóa vẫn hiện để bạn biết ngoài kia còn gì đang chờ."
    }
  },
  profile: {
    title: "Hồ sơ thợ lặn",
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
    languageNames: {
      en: "Tiếng Anh",
      vi: "Tiếng Việt"
    },
    theme: "Chủ đề giao diện",
    themeDesc: "Màu, font chữ, particle — đổi sạch luôn",
    themePickerTitle: "Chọn chủ đề cho app",
    themePickerSub:
      "Mỗi theme thay đổi toàn bộ màu, chữ, hạt lơ lửng — cả cảm giác lặn cũng khác.",
    themePickerPremiumActive:
      "Chọn bầu không khí hợp nhất với phiên tập trung tối nay.",
    themeLockedCount: (count: number) =>
      `Có ${count} theme để chọn`,
    proOnly: "",
    themeFont: "Font",
    themeParticles: "Hạt",
    themeColorIdentity: "Bản sắc màu",
    themeElementFusion: "Kết hợp nguyên tố",
    themeBaseElement: "Nguyên tố gốc",
    themeElement: "Nguyên tố",
    themeFusionDescription: (first: string, second: string, name: string) =>
      `${first} + ${second} tạo thành ${name}.`,
    themeStandaloneDescription:
      "Một dạng tối thượng độc lập trong bộ prismatic.",
    themeCombinationDescription: (names: string) =>
      `Kết hợp với nguyên tố phù hợp để tạo: ${names}.`,
    applyTheme: "Áp dụng chủ đề",
    premium: "DeepOcean",
    premiumDesc: "Theme, phân tích sâu và nhật ký thám hiểm đầy đủ",
    premiumActive: "Toàn bộ công cụ tập trung đã sẵn sàng.",
    premiumActiveBadge: "SẴN SÀNG",
    premiumSignalPlan: "KẾ HOẠCH",
    premiumSignalPlanValue: "Workflow cá nhân đang bật",
    premiumSignalInsight: "INSIGHT",
    premiumSignalInsightValue: "Pattern tuần đã sẵn sàng",
    premiumSignalTheme: "THEME",
    premiumSignalThemeValue: "Visual đã sẵn sàng",
    premiumPreviewPlan: "Xem trước: AI plan đổi theo mục tiêu bạn chọn.",
    premiumPreviewInsight:
      "Xem trước: streak, tỉ lệ hoàn thành và pattern tâm trạng sẽ thích nghi theo thời gian.",
    changeGoals: "Đổi mục tiêu & workflow",
    changeGoalsDesc: "Dựng lại kế hoạch lặn cá nhân",
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
    notifications: "THÔNG BÁO",
    devEnablePremium: "Bật toàn quyền",
    devEnablePremiumDesc:
      "Bật nhanh toàn quyền cục bộ để test feature gate",
    developer: "NHÀ PHÁT TRIỂN",
    about: "VỀ ỨNG DỤNG",
    legal: "PHÁP LÝ",
    appVersion: "Phiên bản",
    appVersionValue: "1.0.0",
    builtWith: "Làm ra bởi tình yêu với biển sâu",
    privacyPolicy: "Chính sách bảo mật",
    termsOfService: "Điều khoản sử dụng"
  },
  notifications: {
    reminderTitle: "Biển sâu đang gọi",
    reminderBody: "Hít một hơi và lặn xuống. Streak của bạn đang đợi.",
    activeDiveTitle: "Đang lặn",
    activeDiveBody: "Deep Ocean vẫn đang tính thời gian tập trung của bạn.",
    diveCompleteTitle: "Chuyến lặn đã hoàn thành",
    diveCompleteBody:
      "Bạn có thể nổi lên khi sẵn sàng. Phiên tập trung đã xong.",
    reminderChannel: "Nhắc nhở lặn",
    completionChannel: "Hoàn thành chuyến lặn",
    activeDiveChannel: "Đang lặn",
    pickerTitle: "Giờ nhắc nhở",
    pickerSubtitle: "Chọn thời điểm lời nhắc mỗi ngày",
    hours: "Giờ",
    minutes: "Phút",
    center: {
      title: "Thông báo",
      openAccessibility: "Mở thông báo",
      fallbackTitle: "DeepOcean",
      loadError: "Chưa tải được thông báo lúc này.",
      retry: "Thử lại",
      signalLog: "Nhật ký tín hiệu",
      unreadSummary: (count: number) => `${count} cập nhật chưa đọc`,
      allReviewed: "Đã xem hết tín hiệu",
      fallbackLatest: "Lời nhắc lặn và cập nhật phiên sẽ nằm ở đây.",
      total: "Tổng",
      unread: "Chưa đọc",
      latest: "Mới nhất",
      all: "Tất cả",
      emptyAllTitle: "Mặt biển đang yên tĩnh",
      emptyAllBody: "Lời nhắc và cập nhật chuyến lặn mới sẽ hiện ở đây.",
      emptyUnreadTitle: "Bạn đã xem hết rồi",
      emptyUnreadBody: "Không còn tín hiệu chưa đọc nào đang chờ bạn.",
      typeComplete: "Hoàn tất",
      typeWarning: "Cảnh báo",
      typeActionNeeded: "Cần chú ý",
      typeReminder: "Nhắc nhở",
      typeUpdate: "Cập nhật",
      now: "Vừa xong",
      minutesAgo: (count: number) => `${count}ph`,
      hoursAgo: (count: number) => `${count}g`,
      daysAgo: (count: number) => `${count}n`
    }
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
    personalPlanTitle: "KẾ HOẠCH LẶN RIÊNG",
    personalPlanUnlock: "MỞ KẾ HOẠCH",
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
    noSessions:
      "Chuyến lặn đầu tiên sẽ hiện ở đây. Bắt đầu bằng timer mặc định, ở lại với một việc, rồi nổi lên khi phiên hoàn tất.",
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
    askAgainRetriesLeft: (count: number) =>
      count === 1
        ? "Còn 1 lượt hỏi lại miễn phí"
        : `Còn ${count} lượt hỏi lại miễn phí`,
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
    deepHeader: "PHÂN TÍCH SÂU",
    deepPatternTitle: "NHỊP LẶN",
    deepPatternBody:
      "Buổi tối bạn lặn bền hơn. Thử chia 25 → 12 phút trong tuần này xem sao.",
    deepMoodTitle: "BẢN ĐỒ TÂM TRẠNG",
    deepMoodBody:
      "Những hôm bạn thấy tò mò lại là những hôm lặn sâu nhất. Mai cứ lặn trong tinh thần đó.",
    deepRitualTitle: "NGHI THỨC HÍT THỞ",
    deepRitualBody:
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
    noDivesTitle: "Chưa có chuyến lặn nào",
    noDives:
      "Bắt đầu một phiên tập trung và khu vực này sẽ thành nhịp tuần, lịch sử lặn và độ sâu của bạn.",
    less: "ít",
    more: "nhiều"
  },
  sessionDetail: {
    title: "Báo cáo chuyến lặn",
    back: "Quay lại",
    duration: "THỜI LƯỢNG",
    focusMinutes: "TẬP TRUNG",
    xpEarned: "XP NHẬN ĐƯỢC",
    maxDepth: "ĐỘ SÂU",
    discoveries: "KHÁM PHÁ",
    levelUp: (from: number, to: number) => `Cấp ${from} → ${to}`,
    noLevelChange: "Chưa lên cấp",
    zoneJourney: "HÀNH TRÌNH CÁC TẦNG",
    discoveryLog: "NHẬT KÝ KHÁM PHÁ",
    noDiscoveries:
      "Chuyến này chưa gặp sinh vật hay cổ vật nào. Lặn lâu hơn và xuống vùng sâu hơn sẽ tăng cơ hội lần tới.",
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
      noResults:
        "Bộ lọc này chưa có mục nào. Xóa bộ lọc hoặc tiếp tục lặn để mở thêm nhật ký."
    },
    story: {
      whisperLabel: "TIẾNG THÌ THẦM TỪ ĐÁY BIỂN",
      firstSeen: "Lần đầu gặp",
      sightings: (n: number) => (n === 1 ? "Mới gặp 1 lần" : `Đã gặp ${n} lần`),
      rarityLabel: "ĐỘ HIẾM",
      zoneLabel: "VÙNG BIỂN",
      storyTitle: "GHI CHÉP CHUYẾN LẶN",
      journalTitle: "NHẬT KÝ MẬT",
      lockedTitle: "Vẫn còn ẩn mình",
      lockedBody:
        "Thứ này chưa từng lộ diện với bạn. Cứ lặn tiếp đi — mỗi phút dưới biển là một cơ hội mới.",
      close: "Nổi lên",
      creature: "SINH VẬT",
      artifact: "CỔ VẬT"
    }
  },
  dive: {
    diveTime: "THỜI GIAN LẶN",
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
    continue: "Không, lặn tiếp",
    completeTitle: "CHUYẾN LẶN HOÀN TẤT",
    completeMsg: "Phiên tập trung đã hoàn thành. Hít một hơi và nổi lên nhé.",
    completeCta: "Nổi lên"
  },
  paywall: {
    title: "Quyền truy cập DeepOcean",
    subtitle:
      "Theme, phân tích AI sâu hơn và nhật ký thám hiểm đầy đủ đều có sẵn trong bản này.",
    compareTitle: "Công cụ có sẵn",
    compareFree: "Bản thường",
    comparePro: "Có sẵn",
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
    unlockingThemeHint: "Theme này có sẵn. Áp dụng trong phần chọn chủ đề.",
    benefits: [
      {
        icon: "water",
        title: "Công cụ lặn cốt lõi",
        body: "Timer, XP, streak và lịch sử thám hiểm luôn mở cho mọi thợ lặn."
      },
      {
        icon: "diamond",
        title: "Toàn bộ theme",
        body: "Giao diện riêng cho toàn app: bảng màu, font chữ, hạt lơ lửng và sương sâu."
      },
      {
        icon: "sparkles",
        title: "Phân tích AI sâu",
        body: "Nhịp tập trung, kế hoạch theo tâm trạng và bài thở cá nhân hoá theo thói quen lặn."
      },
      {
        icon: "telescope",
        title: "Nhật ký thám hiểm đầy đủ",
        body: "Đọc truyền thuyết, giả thuyết và ghi chú mật phía sau từng sinh vật/cổ vật đã khám phá."
      }
    ] as const,
    planLifetime: "MÃI MÃI",
    planAnnual: "1 NĂM",
    planMonthly: "THÁNG",
    planLifetimeSub: "một lần",
    planMonthlySub: "/ tháng",
    lifetimeCta: "LIFETIME — MỞ TẤT CẢ",
    lifetimePrice: "799.000đ",
    annualCta: "1 NĂM — TỐT NHẤT",
    annualPrice: "299.000đ / năm",
    annualPricePerMonth: "24.917đ / tháng",
    annualSaving: "Tiết kiệm 50%",
    monthlyCta: "THEO THÁNG",
    monthlyPrice: "49.000đ / tháng",
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
  },
  codex: {
    setsTitle: "BỘ CODEX VÙNG BIỂN",
    setProgress: (found: number, total: number) => `${found}/${total}`,
    setComplete: "HOÀN THÀNH",
    completeTitle: "HOÀN THÀNH BỘ CODEX",
    completeBody: (zone: string) =>
      `Bạn đã ghi chép đầy đủ mọi loài sinh vật ở ${zone}. Đại dương sẽ nhớ sự tận tụy của bạn.`,
    completeCta: "Đã hiểu"
  },
  chest: {
    tapToOpen: "CHẠM ĐỂ MỞ",
    opening: "ĐANG MỞ…",
    rarityDriftwood: "RƯƠNG TRÔI DẠT",
    rarityBronze: "RƯƠNG ĐỒNG",
    raritySilver: "RƯƠNG BẠC",
    rarityGold: "RƯƠNG VÀNG",
    rarityVoid: "RƯƠNG HƯ KHÔNG",
    xpReward: (n: number) => `+${n} XP`,
    discoveryHighlight: "KHÁM PHÁ",
    depthRecord: "KỶ LỤC ĐỘ SÂU CÁ NHÂN",
    noDiscovery: "Đại dương giữ bí mật lần này.",
    continueLabel: "Tiếp tục",
    shortDive: "Mỗi chuyến lặn đều có giá trị."
  }
} as const;
