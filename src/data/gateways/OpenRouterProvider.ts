import type { AIConfig } from "@/core/config/aiConfig";
import type { AIContext, Language } from "@/domain/entities";
import {
  buildMotivationPrompt,
  buildReflectionPrompt,
  buildRecommendationPrompt,
  type PromptPair
} from "@/features/ai/prompts";
import type { AIProvider, ReflectionInput } from "@/features/ai/AIProvider";
import {
  AIProviderHttpError,
  fetchWithTimeout,
  normaliseReply
} from "./aiHttp";

type OpenAIStyleResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string; code?: string };
};

export class OpenRouterProvider implements AIProvider {
  readonly id = "openrouter" as const;

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string,
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
    const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://deepocean.app",
          "X-Title": "DeepOcean"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user }
          ],
          temperature: 0.55,
          max_tokens: 160
        })
      },
      this.timeoutMs
    );

    if (!res.ok) {
      const details = await readErrorDetail(res);
      throw new AIProviderHttpError(
        `OpenRouter request failed: ${res.status}${details ? ` (${details})` : ""}`,
        this.id,
        res.status,
        details
      );
    }

    const data = (await res.json()) as OpenAIStyleResponse;
    const reply = normaliseReply(data.choices?.[0]?.message?.content ?? "");
    if (!reply) throw new Error("OpenRouter returned empty content");
    return reply;
  }
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as OpenAIStyleResponse;
    const message = payload.error?.message?.trim();
    if (message) return message;
    const code = payload.error?.code?.trim();
    return code ?? "";
  } catch {
    return "";
  }
}

export function makeOpenRouterProvider(
  config: AIConfig
): OpenRouterProvider | null {
  if (!config.openrouter.apiKey) return null;
  return new OpenRouterProvider(
    config.openrouter.apiKey,
    config.openrouter.model,
    config.openrouter.baseUrl,
    config.timeoutMs
  );
}
