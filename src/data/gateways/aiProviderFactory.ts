import { getAIConfig, type AIConfig } from "@/core/config/aiConfig";
import type { AIProvider } from "@/features/ai/AIProvider";
import { makeGeminiProvider } from "./OpenAIProvider";
import { makeGroqProvider } from "./GroqProvider";
import { makeOpenRouterProvider } from "./OpenRouterProvider";

/**
 * Resolves providers in fallback order. Empty list means no API key is
 * configured and the companion runs on cache + offline composer.
 */
export function createAIProviders(
  config: AIConfig = getAIConfig()
): AIProvider[] {
  const providers: AIProvider[] = [];
  for (const id of config.fallbackOrder) {
    const candidate =
      id === "gemini"
        ? makeGeminiProvider(config)
        : id === "groq"
          ? makeGroqProvider(config)
          : makeOpenRouterProvider(config);
    if (candidate) providers.push(candidate);
  }

  return providers;
}
