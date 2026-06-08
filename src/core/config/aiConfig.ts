import Constants from "expo-constants";

/**
 * AI provider configuration.
 *
 * Keys are read first from public env vars (the modern Expo pattern —
 * `EXPO_PUBLIC_*` is inlined at build time from `.env` / EAS secrets) and fall
 * back to `app.json` → `expo.extra.ai`. Nothing secret is committed; a missing
 * key simply means that provider is unavailable and the companion runs in
 * offline/cached mode.
 */
export type AIProviderId = "gemini" | "groq" | "openrouter";

export type AIConfig = {
  /** Ordered provider chain used for fallback attempts. */
  fallbackOrder: AIProviderId[];
  gemini: { apiKey: string | null; model: string };
  groq: { apiKey: string | null; model: string };
  openrouter: {
    apiKey: string | null;
    model: string;
    baseUrl: string;
  };
  /** Hard ceiling on request latency before we fall back to cache. */
  timeoutMs: number;
};

const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENROUTER_MODEL = "deepseek/deepseek-chat-v3-0324:free";
const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_TIMEOUT_MS = 12_000;

function extraAI(): Record<string, unknown> {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const ai = extra.ai;
  return ai && typeof ai === "object" ? (ai as Record<string, unknown>) : {};
}

function pick(
  envValue: string | undefined,
  extraValue: unknown
): string | null {
  if (envValue && envValue.trim().length > 0) return envValue.trim();
  if (typeof extraValue === "string" && extraValue.trim().length > 0) {
    return extraValue.trim();
  }
  return null;
}

export function getAIConfig(): AIConfig {
  const ai = extraAI();

  const geminiKey = pick(
    process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    ai.geminiApiKey ?? ai.openAiApiKey
  );

  const geminiModel =
    pick(
      process.env.EXPO_PUBLIC_GEMINI_MODEL,
      ai.geminiModel ?? ai.openAiModel
    ) ?? DEFAULT_GEMINI_MODEL;

  const groqKey = pick(process.env.EXPO_PUBLIC_GROQ_API_KEY, ai.groqApiKey);
  const groqModel =
    pick(process.env.EXPO_PUBLIC_GROQ_MODEL, ai.groqModel) ??
    DEFAULT_GROQ_MODEL;

  const openrouterKey = pick(
    process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
    ai.openrouterApiKey
  );
  const openrouterModel =
    pick(process.env.EXPO_PUBLIC_OPENROUTER_MODEL, ai.openrouterModel) ??
    DEFAULT_OPENROUTER_MODEL;
  const openrouterBaseUrl =
    pick(process.env.EXPO_PUBLIC_OPENROUTER_BASE_URL, ai.openrouterBaseUrl) ??
    DEFAULT_OPENROUTER_BASE_URL;

  const explicit = pick(
    process.env.EXPO_PUBLIC_AI_PROVIDER,
    ai.provider
  ) as AIProviderId | null;

  const configured: AIProviderId[] = [];
  if (geminiKey) configured.push("gemini");
  if (groqKey) configured.push("groq");
  if (openrouterKey) configured.push("openrouter");

  const fallbackOrder = configured.slice();
  if (explicit && configured.includes(explicit)) {
    fallbackOrder.splice(fallbackOrder.indexOf(explicit), 1);
    fallbackOrder.unshift(explicit);
  }

  return {
    fallbackOrder,
    gemini: { apiKey: geminiKey, model: geminiModel },
    groq: { apiKey: groqKey, model: groqModel },
    openrouter: {
      apiKey: openrouterKey,
      model: openrouterModel,
      baseUrl: openrouterBaseUrl
    },
    timeoutMs: DEFAULT_TIMEOUT_MS
  };
}
