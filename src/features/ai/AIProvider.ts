import type { AIContext, Language } from "@/domain/entities";
import type { AIProviderId } from "@/core/config/aiConfig";

/** Distilled, provider-agnostic input for a post-dive reflection. */
export type ReflectionInput = {
  minutes: number;
  zoneLabel: string;
  discoveries: number;
  /** A few notable creature/artifact names surfaced this dive. */
  notableNames: string[];
};

/**
 * AIProvider — the single seam between the app and an LLM backend. Concrete
 * providers (OpenAI) implement this; the rest of the app depends
 * only on this interface.
 */
export interface AIProvider {
  readonly id: AIProviderId;
  generateRecommendation(ctx: AIContext): Promise<string>;
  generateMotivation(ctx: AIContext): Promise<string>;
  generateReflection(
    input: ReflectionInput,
    language: Language
  ): Promise<string>;
}

export type { AIContext, Language };
