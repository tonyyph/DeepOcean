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
export type AIProviderId = "gemini";

export type AIConfig = {
  /** Resolved provider to use, or null when none is configured. */
  provider: AIProviderId | null;
  gemini: { apiKey: string | null; model: string };
  /** Hard ceiling on request latency before we fall back to cache. */
  timeoutMs: number;
};

const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
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
  const explicit = pick(
    process.env.EXPO_PUBLIC_AI_PROVIDER,
    ai.provider
  ) as AIProviderId | null;

  // Resolve provider: explicit choice wins (if its key exists), else first key found.
  let provider: AIProviderId | null = null;
  if (explicit === "gemini" && geminiKey) provider = "gemini";
  else if (geminiKey) provider = "gemini";

  return {
    provider,
    gemini: { apiKey: geminiKey, model: geminiModel },
    timeoutMs: DEFAULT_TIMEOUT_MS
  };
}
