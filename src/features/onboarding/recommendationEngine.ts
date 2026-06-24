import type {
  AIRecommendation,
  GoalId,
  Language,
  RecommendedItem,
  RecommendedWorkflow
} from "@/domain/entities";

export type RecommendationInput = {
  selectedGoals: GoalId[];
  language: Language;
  usage?: {
    streakDays?: number;
    totalDives?: number;
    preferredMinutes?: number;
  };
};

export const GOAL_IDS: readonly GoalId[] = [
  "improve_focus",
  "build_consistency",
  "reduce_stress",
  "learn_better",
  "track_progress",
  "build_daily_routine",
  "stay_motivated",
  "improve_productivity"
] as const;

const GOAL_TO_WORKFLOW: Record<GoalId, RecommendedWorkflow["id"]> = {
  improve_focus: "deep_work",
  build_consistency: "habit_building",
  reduce_stress: "recovery",
  learn_better: "learning",
  track_progress: "daily_focus",
  build_daily_routine: "habit_building",
  stay_motivated: "daily_focus",
  improve_productivity: "deep_work"
};

export function recommendFallback({
  selectedGoals,
  language,
  usage
}: RecommendationInput): AIRecommendation {
  const goals: GoalId[] =
    selectedGoals.length > 0 ? uniqueGoals(selectedGoals) : ["improve_focus"];
  const workflowId = pickWorkflow(goals);
  const workflow = workflowCopy(language, workflowId, usage?.preferredMinutes);
  const items = ensurePremiumItem(
    goals.slice(0, 4).map((goal, index) => itemCopy(language, goal, index)),
    language
  );

  return {
    recommendedItems: items,
    recommendedWorkflow: workflow,
    shortExplanation:
      language === "vi"
        ? "Mình ghép mục tiêu của bạn thành một nhịp bắt đầu nhẹ, dễ duy trì và vẫn có chỗ để lặn sâu khi bạn sẵn sàng."
        : "I matched your goals into a calm starting rhythm: easy to repeat, useful today, and ready to deepen when you are.",
    generatedAt: Date.now(),
    source: "fallback"
  };
}

export function normalizeRecommendation(
  recommendation: AIRecommendation
): AIRecommendation {
  const seen = new Set<string>();
  return {
    ...recommendation,
    recommendedItems: recommendation.recommendedItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
  };
}

export async function requestPersonalizedRecommendation(
  input: RecommendationInput
): Promise<AIRecommendation> {
  await timeout(420);
  return recommendFallback(input);
}

function pickWorkflow(goals: readonly GoalId[]): RecommendedWorkflow["id"] {
  const scores = new Map<RecommendedWorkflow["id"], number>();
  for (const goal of goals) {
    const workflow = GOAL_TO_WORKFLOW[goal];
    scores.set(workflow, (scores.get(workflow) ?? 0) + 1);
  }
  return (
    [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "daily_focus"
  );
}

function uniqueGoals(goals: readonly GoalId[]): GoalId[] {
  const seen = new Set<GoalId>();
  return goals.filter((goal) => {
    if (seen.has(goal)) return false;
    seen.add(goal);
    return true;
  });
}

function ensurePremiumItem(
  items: readonly RecommendedItem[],
  language: Language
): RecommendedItem[] {
  if (items.some((item) => item.isPremium)) return [...items];

  const trackProgressIndex = items.findIndex(
    (item) => item.id === "item.track_progress"
  );
  if (trackProgressIndex >= 0) {
    return items.map((item, index) =>
      index === trackProgressIndex ? { ...item, isPremium: true } : item
    );
  }

  return [
    ...items,
    itemCopy(language, "track_progress", items.length, true)
  ];
}

function itemCopy(
  language: Language,
  goal: GoalId,
  index: number,
  forcePremium = false
): RecommendedItem {
  const isPremium = forcePremium || index === 2;
  const copy = ITEM_COPY[language][goal];
  return {
    id: `item.${goal}`,
    title: copy.title,
    description: copy.description,
    reason: copy.reason,
    isPremium
  };
}

function workflowCopy(
  language: Language,
  id: RecommendedWorkflow["id"],
  preferredMinutes = 25
): RecommendedWorkflow {
  const copy = WORKFLOW_COPY[language][id];
  return {
    id,
    title: copy.title,
    description: copy.description,
    steps: copy.steps,
    estimatedTime:
      language === "vi"
        ? `${preferredMinutes} phút mỗi vòng`
        : `${preferredMinutes} min per round`,
    isPremium: id === "deep_work"
  };
}

const ITEM_COPY: Record<
  Language,
  Record<GoalId, Omit<RecommendedItem, "id" | "isPremium">>
> = {
  en: {
    improve_focus: {
      title: "Single-current start",
      description: "Begin each dive by naming one task and hiding the rest.",
      reason: "A single target lowers context switching before the timer starts."
    },
    build_consistency: {
      title: "Small daily descent",
      description: "Use a short 15-25 minute dive at the same time each day.",
      reason: "Consistency grows faster when the start ritual stays predictable."
    },
    reduce_stress: {
      title: "Recovery buffer",
      description: "Add a one-minute breathing pause before and after the dive.",
      reason: "A softer entry keeps the app calming instead of another demand."
    },
    learn_better: {
      title: "Learning loop",
      description: "Study in one dive, then write a three-line recall note.",
      reason: "Recall turns quiet focus into retained knowledge."
    },
    track_progress: {
      title: "Weekly depth review",
      description: "Review streak, completion rate, and your best focus window.",
      reason: "Seeing the pattern helps you choose tomorrow's dive with less guesswork."
    },
    build_daily_routine: {
      title: "Anchor habit",
      description: "Attach your dive to an existing daily cue.",
      reason: "A known cue removes the decision of when to begin."
    },
    stay_motivated: {
      title: "Visible win",
      description: "End with one tiny note about what moved forward.",
      reason: "Motivation sticks better when progress is concrete."
    },
    improve_productivity: {
      title: "Priority trench",
      description: "Put the most valuable task into the first dive of the day.",
      reason: "The first protected block usually has the cleanest attention."
    }
  },
  vi: {
    improve_focus: {
      title: "Bắt đầu một luồng",
      description: "Trước khi lặn, gọi tên đúng một việc và cất phần còn lại.",
      reason: "Một mục tiêu rõ giúp não ít nhảy context hơn."
    },
    build_consistency: {
      title: "Lặn ngắn mỗi ngày",
      description: "Dùng phiên 15-25 phút vào cùng một khung giờ.",
      reason: "Thói quen dễ bền hơn khi nghi thức bắt đầu không đổi."
    },
    reduce_stress: {
      title: "Đệm hồi phục",
      description: "Thêm một phút thở chậm trước và sau phiên lặn.",
      reason: "Vào việc mềm hơn để app vẫn là nơi bình tĩnh, không thành áp lực."
    },
    learn_better: {
      title: "Vòng học sâu",
      description: "Học trong một phiên, rồi viết lại ba dòng mình nhớ.",
      reason: "Nhắc lại biến tập trung thành kiến thức còn ở lại."
    },
    track_progress: {
      title: "Tổng kết độ sâu tuần",
      description: "Xem streak, tỉ lệ hoàn thành và khung giờ tập trung tốt nhất.",
      reason: "Nhìn thấy pattern giúp bạn chọn phiên ngày mai dễ hơn."
    },
    build_daily_routine: {
      title: "Neo thói quen",
      description: "Gắn phiên lặn vào một tín hiệu hằng ngày đã có.",
      reason: "Có tín hiệu quen thì khỏi phải quyết định bắt đầu lúc nào."
    },
    stay_motivated: {
      title: "Một chiến thắng thấy được",
      description: "Kết thúc bằng một ghi chú nhỏ: hôm nay tiến thêm gì.",
      reason: "Động lực bền hơn khi tiến độ có hình dạng cụ thể."
    },
    improve_productivity: {
      title: "Ưu tiên xuống rãnh",
      description: "Đặt việc giá trị nhất vào phiên lặn đầu tiên trong ngày.",
      reason: "Block đầu ngày thường là lúc sự chú ý còn sạch nhất."
    }
  }
};

const WORKFLOW_COPY: Record<
  Language,
  Record<
    RecommendedWorkflow["id"],
    Omit<RecommendedWorkflow, "id" | "estimatedTime" | "isPremium">
  >
> = {
  en: {
    daily_focus: {
      title: "Daily focus workflow",
      description: "A reliable rhythm for one useful dive every day.",
      steps: ["Pick one task", "Dive for the default timer", "Log one win"]
    },
    deep_work: {
      title: "Deep work workflow",
      description: "A premium-style plan for longer protected attention.",
      steps: ["Clear distractions", "Dive 45 minutes", "Recover for 5 minutes"]
    },
    recovery: {
      title: "Recovery workflow",
      description: "A gentler dive when stress is the main blocker.",
      steps: ["Breathe slowly", "Dive 15 minutes", "Surface without rushing"]
    },
    learning: {
      title: "Learning workflow",
      description: "Focus, recall, and keep only the strongest notes.",
      steps: ["Choose a lesson", "Dive 25 minutes", "Write three recall lines"]
    },
    habit_building: {
      title: "Habit building workflow",
      description: "Make the starting ritual smaller than your resistance.",
      steps: ["Use a daily cue", "Dive 15 minutes", "Repeat tomorrow"]
    }
  },
  vi: {
    daily_focus: {
      title: "Workflow tập trung hằng ngày",
      description: "Một nhịp ổn định để mỗi ngày có một phiên thật sự hữu ích.",
      steps: ["Chọn một việc", "Lặn theo timer mặc định", "Ghi lại một tiến triển"]
    },
    deep_work: {
      title: "Workflow làm việc sâu",
      description: "Kế hoạch kiểu premium cho một block chú ý được bảo vệ lâu hơn.",
      steps: ["Dọn nhiễu", "Lặn 45 phút", "Hồi phục 5 phút"]
    },
    recovery: {
      title: "Workflow hồi phục",
      description: "Phiên lặn nhẹ hơn khi căng thẳng là vật cản chính.",
      steps: ["Thở chậm", "Lặn 15 phút", "Nổi lên từ tốn"]
    },
    learning: {
      title: "Workflow học sâu",
      description: "Tập trung, nhớ lại, rồi giữ phần ghi chú mạnh nhất.",
      steps: ["Chọn một bài", "Lặn 25 phút", "Viết lại ba dòng nhớ được"]
    },
    habit_building: {
      title: "Workflow xây thói quen",
      description: "Làm nghi thức bắt đầu nhỏ hơn lực cản của bạn.",
      steps: ["Dùng một tín hiệu hằng ngày", "Lặn 15 phút", "Lặp lại ngày mai"]
    }
  }
};

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
