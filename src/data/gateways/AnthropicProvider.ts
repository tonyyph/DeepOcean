import type { AIConfig } from "@/core/config/aiConfig";
import type { AIContext, Language } from "@/domain/entities";
import {
  buildMotivationPrompt,
  buildReflectionPrompt,
  buildRecommendationPrompt,
  type PromptPair
} from "@/features/ai/prompts";
import type { AIProvider, ReflectionInput } from "@/features/ai/AIProvider";
import { fetchWithTimeout, normaliseReply } from "./aiHttp";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

type ContentBlock = { type?: string; text?: string };
type MessagesResponse = { content?: ContentBlock[] };

/**
 * AnthropicProvider — real Messages API integration. Constructed only when an
 * API key is present (see {@link createAIProvider}).
 */
export class AnthropicProvider implements AIProvider {
  readonly id = "anthropic" as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly timeoutMs: number
  ) {}

  generateRecommendation(ctx: AIContext): Promise<string> {
    return this.complete(buildRecommendationPrompt(ctx));
  }

  generateMotivation(ctx: AIContext): Promise<string> {
    return this.complete(buildMotivationPrompt(ctx));
  }

  generateReflection(
    input: ReflectionInput,
    language: Language
  ): Promise<string> {
    return this.complete(buildReflectionPrompt(input, language));
  }

  private async complete(prompt: PromptPair): Promise<string> {
    const res = await fetchWithTimeout(
      ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_VERSION
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 200,
          temperature: 0.8,
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }]
        })
      },
      this.timeoutMs
    );

    if (!res.ok) {
      throw new Error(`Anthropic request failed: ${res.status}`);
    }
    const data = (await res.json()) as MessagesResponse;
    const text =
      data.content?.find((b) => b.type === "text")?.text ??
      data.content?.[0]?.text ??
      "";
    const reply = normaliseReply(text);
    if (!reply) throw new Error("Anthropic returned empty content");
    return reply;
  }
}

export function makeAnthropicProvider(
  config: AIConfig
): AnthropicProvider | null {
  if (!config.anthropic.apiKey) return null;
  return new AnthropicProvider(
    config.anthropic.apiKey,
    config.anthropic.model,
    config.timeoutMs
  );
}
