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

  // if (__DEV__) {
  //   if (providers.length === 0) {
  //     console.log(
  //       "[AICompanion] Providers disabled",
  //       JSON.stringify(
  //         {
  //           fallbackOrder: config.fallbackOrder,
  //           hasGeminiKey: Boolean(config.gemini.apiKey),
  //           hasGroqKey: Boolean(config.groq.apiKey),
  //           hasOpenRouterKey: Boolean(config.openrouter.apiKey)
  //         },
  //         null,
  //         2
  //       )
  //     );
  //   } else {
  //     console.log(
  //       "[AICompanion] Provider chain enabled",
  //       JSON.stringify(
  //         {
  //           order: providers.map((provider) => provider.id),
  //           models: {
  //             gemini: config.gemini.model,
  //             groq: config.groq.model,
  //             openrouter: config.openrouter.model
  //           }
  //         },
  //         null,
  //         2
  //       )
  //     );
  //   }
  // }

  return providers;
}
