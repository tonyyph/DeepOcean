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

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

type ChatChoice = { message?: { content?: string } };
type ChatResponse = { choices?: ChatChoice[] };

/**
 * OpenAIProvider — real Chat Completions integration. Constructed only when an
 * API key is present (see {@link createAIProvider}).
 */
export class OpenAIProvider implements AIProvider {
  readonly id = "openai" as const;

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
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.8,
          max_tokens: 160,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user }
          ]
        })
      },
      this.timeoutMs
    );

    if (!res.ok) {
      throw new Error(`OpenAI request failed: ${res.status}`);
    }
    const data = (await res.json()) as ChatResponse;
    const text = data.choices?.[0]?.message?.content ?? "";
    const reply = normaliseReply(text);
    if (!reply) throw new Error("OpenAI returned empty content");
    return reply;
  }
}

export function makeOpenAIProvider(config: AIConfig): OpenAIProvider | null {
  if (!config.openAi.apiKey) return null;
  return new OpenAIProvider(
    config.openAi.apiKey,
    config.openAi.model,
    config.timeoutMs
  );
}
