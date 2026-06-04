import { getAIConfig, type AIConfig } from "@/core/config/aiConfig";
import type { AIProvider } from "@/features/ai/AIProvider";
import { makeGeminiProvider } from "./OpenAIProvider";

/**
 * Resolves the configured {@link AIProvider}, or null when no API key is
 * available (the companion then runs purely from cache + offline composer).
 */
export function createAIProvider(
  config: AIConfig = getAIConfig()
): AIProvider | null {
  switch (config.provider) {
    case "gemini":
      if (__DEV__) {
        console.log("[AICompanion] Gemini provider enabled", {
          model: config.gemini.model,
          hasKey: Boolean(config.gemini.apiKey)
        });
      }
      return makeGeminiProvider(config);
    default:
      if (__DEV__) {
        console.warn("[AICompanion] Provider disabled", {
          provider: config.provider,
          hasGeminiKey: Boolean(config.gemini.apiKey),
          geminiModel: config.gemini.model
        });
      }
      return null;
  }
}
