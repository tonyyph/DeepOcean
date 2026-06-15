export const en = {
  common: {
    dismiss: "Dismiss"
  },
  onboarding: {
    chapters: [
      {
        title: "DeepOcean",
        depth: "SURFACE",
        body: "A focus session becomes an underwater dive.",
        detail:
          "Choose a duration, put the phone down, and let the app hold the rhythm with calm sound, depth, and a clear place to return."
      },
      {
        title: "Focus dives",
        depth: "TWILIGHT ZONE",
        body: "Every focused minute carries you a little deeper.",
        detail:
          "Start a timed dive or a free dive. The dive screen tracks time, depth, and zone while staying quiet enough to leave your attention alone."
      },
      {
        title: "XP and streaks",
        depth: "MIDNIGHT ZONE",
        body: "Return from a dive with XP, levels, and streak progress.",
        detail:
          "DeepOcean rewards consistency without pressure. Short sessions count, longer dives reach deeper zones, and daily returns build momentum."
      },
      {
        title: "Collections",
        depth: "ABYSS",
        body: "Creatures, artifacts, and field notes surface after real focus.",
        detail:
          "Your Expedition Log starts empty and grows from completed dives. Locked entries tell you what to do next instead of leaving you guessing."
      },
      {
        title: "Pro, quietly",
        depth: "TRENCH",
        body: "Premium adds deeper themes, journals, and insights.",
        detail:
          "Pro should feel refined, not loud: more personal guidance, richer logs, and elegant themes when you want the ocean to feel more like yours."
      }
    ],
    pageLabel: "Onboarding page",
    back: "BACK",
    next: "NEXT",
    holdToBegin: "START FIRST DIVE",
    tapToContinue: "TAP TO CONTINUE"
  },
  guidance: {
    ai: {
      title: "Your guide improves after dives",
      body: "Log a first focus session and the guide can reflect on your rhythm, mood, and recent expedition instead of speaking generally."
    },
    collection: {
      title: "The log starts empty on purpose",
      body: "Complete dives to surface creatures and artifacts. Locked entries stay visible so you always know what kind of discovery is still waiting."
    }
  },
  profile: {
    title: "Diver Profile",
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
    themePickerPremiumActive:
      "Pro themes are available. Choose the atmosphere that best supports tonight's focus.",
    themeLockedCount: (count: number) =>
      `${count} premium theme${count === 1 ? "" : "s"} locked · upgrade to Pro`,
    proOnly: "PRO",
    themeFont: "Font",
    themeParticles: "Particles",
    themeColorIdentity: "Color identity",
    themeElementFusion: "Element fusion",
    themeBaseElement: "Base element",
    themeElement: "Element",
    themeFusionDescription: (first: string, second: string, name: string) =>
      `${first} + ${second} creates ${name}.`,
    themeStandaloneDescription:
      "A standalone ultimate form in the prismatic set.",
    themeCombinationDescription: (names: string) =>
      `Combine with matching elements to form: ${names}.`,
    applyTheme: "Apply theme",
    premium: "DeepOcean Pro",
    premiumDesc: "Unlock themes, deep insights, and full field journals",
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
    notifications: "NOTIFICATIONS",
    devEnablePremium: "Enable premium",
    devEnablePremiumDesc: "Local test toggle for premium UI and feature gates",
    developer: "DEVELOPER",
    about: "ABOUT",
    appVersion: "Version",
    appVersionValue: "#Ynot",
    builtWith: "Built with care for the deep"
  },
  notifications: {
    reminderTitle: "The deep is calling",
    reminderBody: "Take a breath and dive. Your streak is waiting.",
    activeDiveTitle: "Dive in progress",
    activeDiveBody: "Deep Ocean is still counting your focus time.",
    diveCompleteTitle: "Dive complete",
    diveCompleteBody: "Surface when you're ready. Your focus session is done.",
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
    noSessions:
      "Your first dive will appear here. Start with the default timer, stay with one task, and surface when the session is complete.",
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
    noDivesTitle: "No dives logged yet",
    noDives:
      "Start one focus dive and this space will turn into your weekly rhythm, recent expeditions, and depth history.",
    less: "less",
    more: "more"
  },
  sessionDetail: {
    title: "Expedition Report",
    back: "Back",
    duration: "DURATION",
    focusMinutes: "FOCUS",
    xpEarned: "XP EARNED",
    maxDepth: "MAX DEPTH",
    discoveries: "DISCOVERIES",
    levelUp: (from: number, to: number) => `Level ${from} → ${to}`,
    noLevelChange: "No level change",
    zoneJourney: "ZONE JOURNEY",
    discoveryLog: "DISCOVERY LOG",
    noDiscoveries:
      "No creatures or artifacts surfaced this dive. Longer dives and deeper zones improve the odds next time.",
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
      noResults:
        "No entries match this filter yet. Clear the filter or keep diving to unlock more of the log."
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
    discoveries: (n: number) => (n === 1 ? "1 discovery" : `${n} discoveries`),
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
      "Unlock premium themes, deeper AI insights, and full expedition journals. Support a small studio building calmly.",
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
        title: "Keep the Core Dive Free",
        body: "The timer, XP, streaks, and basic expedition history stay open while Pro adds more depth."
      },
      {
        icon: "diamond",
        title: "8 Premium Themes",
        body: "Unique app-wide visual identities with custom palettes, typography, particles, and depth fog."
      },
      {
        icon: "sparkles",
        title: "AI Deep Insights",
        body: "Mood-aware patterns, focus plans, and breathing rituals that adapt to your dive rhythm."
      },
      {
        icon: "telescope",
        title: "Full Field Journal",
        body: "Read the folklore, theories, and sealed notes behind every creature and artifact you discover."
      }
    ] as const,
    planLifetime: "LIFETIME",
    planAnnual: "1 YEAR",
    planMonthly: "MONTHLY",
    planLifetimeSub: "one-time",
    planMonthlySub: "/ month",
    lifetimeCta: "LIFETIME — UNLOCK EVERYTHING",
    lifetimePrice: "$44.99",
    annualCta: "1 YEAR — BEST VALUE",
    annualPrice: "$23.99 / year",
    annualPricePerMonth: "$1.99 / month",
    annualSaving: "Save 50%",
    monthlyCta: "MONTHLY",
    monthlyPrice: "$3.99 / month",
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
} as const;
