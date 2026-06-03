import { getAIConfig, type AIConfig } from "@/core/config/aiConfig";
import type { AIProvider } from "@/features/ai/AIProvider";
import { makeOpenAIProvider } from "./OpenAIProvider";
import { makeAnthropicProvider } from "./AnthropicProvider";

/**
 * Resolves the configured {@link AIProvider}, or null when no API key is
 * available (the companion then runs purely from cache + offline composer).
 */
export function createAIProvider(
  config: AIConfig = getAIConfig()
): AIProvider | null {
  switch (config.provider) {
    case "openai":
      return makeOpenAIProvider(config);
    case "anthropic":
      return makeAnthropicProvider(config);
    default:
      return null;
  }
}
