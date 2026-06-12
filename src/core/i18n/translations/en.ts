export const en = {
    onboarding: {
      chapters: [
        {
          title: "Breathe.",
          depth: "SURFACE",
          body: "You are standing at the surface of the ocean. The world above is loud. Down here, it isn't.",
          detail:
            "Deep Ocean turns a focus session into a dive: choose a duration, put the phone down, and let the app hold the rhythm with ambient sound, depth, and a quiet state of mind."
        },
        {
          title: "Descend.",
          depth: "TWILIGHT ZONE",
          body: "Each minute you focus, you sink a little deeper. Each zone has its own light, its own creatures, its own silence.",
          detail:
            "Start a free dive or set a target. While you work, the app tracks depth, zone, and progress while keeping the surface calm enough to stay out of your way."
        },
        {
          title: "Discover.",
          depth: "MIDNIGHT ZONE",
          body: "Hold attention long enough and the deep will show you things almost no one sees.",
          detail:
            "After sessions, you can encounter creatures, artifacts, story fragments, and XP rewards. Your collection grows from the moments when you actually stay with your attention."
        },
        {
          title: "Return.",
          depth: "DIVE LOG",
          body: "When you surface, what you brought back is yours to keep. The dive remembers you.",
          detail:
            "Deep Ocean keeps your dive history, streak, level, guide nudges, and daily reminders. Not to pressure you, but to make returning to focus feel like a small ritual."
        }
      ],
      pageLabel: "Onboarding page",
      back: "BACK",
      next: "NEXT",
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
