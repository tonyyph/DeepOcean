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
export type AIProviderId = "openai" | "anthropic";

export type AIConfig = {
  /** Resolved provider to use, or null when none is configured. */
  provider: AIProviderId | null;
  openAi: { apiKey: string | null; model: string };
  anthropic: { apiKey: string | null; model: string };
  /** Hard ceiling on request latency before we fall back to cache. */
  timeoutMs: number;
};

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-latest";
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

  const openAiKey = pick(
    process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    ai.openAiApiKey
  );
  const anthropicKey = pick(
    process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    ai.anthropicApiKey
  );

  const openAiModel =
    pick(process.env.EXPO_PUBLIC_OPENAI_MODEL, ai.openAiModel) ??
    DEFAULT_OPENAI_MODEL;
  const anthropicModel =
    pick(process.env.EXPO_PUBLIC_ANTHROPIC_MODEL, ai.anthropicModel) ??
    DEFAULT_ANTHROPIC_MODEL;

  const explicit = pick(
    process.env.EXPO_PUBLIC_AI_PROVIDER,
    ai.provider
  ) as AIProviderId | null;

  // Resolve provider: explicit choice wins (if its key exists), else first key found.
  let provider: AIProviderId | null = null;
  if (explicit === "openai" && openAiKey) provider = "openai";
  else if (explicit === "anthropic" && anthropicKey) provider = "anthropic";
  else if (openAiKey) provider = "openai";
  else if (anthropicKey) provider = "anthropic";

  return {
    provider,
    openAi: { apiKey: openAiKey, model: openAiModel },
    anthropic: { apiKey: anthropicKey, model: anthropicModel },
    timeoutMs: DEFAULT_TIMEOUT_MS
  };
}
