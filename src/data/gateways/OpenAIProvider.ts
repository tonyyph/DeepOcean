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

const ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const FALLBACK_MODEL = "gemini-flash-latest";

type GeminiPart = { text?: string };
type GeminiCandidate = { content?: { parts?: GeminiPart[] } };
type GeminiResponse = { candidates?: GeminiCandidate[] };

/**
 * GeminiProvider — real Gemini generateContent integration. Constructed only when an
 * API key is present (see {@link createAIProvider}).
 */
export class GeminiProvider implements AIProvider {
  readonly id = "gemini" as const;

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
    try {
      return await this.request(prompt, this.model);
    } catch (error) {
      // If a custom model is not available for this account/endpoint,
      // retry once on the known-safe default to keep AI online.
      if (this.model !== FALLBACK_MODEL && isModelSelectionError(error)) {
        return this.request(prompt, FALLBACK_MODEL);
      }
      throw error;
    }
  }

  private async request(prompt: PromptPair, model: string): Promise<string> {
    const endpoint = `${ENDPOINT_BASE}/${encodeURIComponent(model)}:generateContent`;
    const res = await fetchWithTimeout(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": this.apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: prompt.system }]
          },
          contents: [
            {
              parts: [{ text: prompt.user }]
            }
          ],
          generationConfig: {
            temperature: 0.55,
            maxOutputTokens: 160
          }
        })
      },
      this.timeoutMs
    );

    if (!res.ok) {
      const details = await readErrorDetail(res);
      throw new AIProviderHttpError(
        `Gemini request failed: ${res.status}${details ? ` (${details})` : ""}`,
        this.id,
        res.status,
        details
      );
    }
    const data = (await res.json()) as GeminiResponse;
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("\n") ?? "";
    const reply = normaliseReply(text);
    if (!reply) throw new Error("Gemini returned empty content");
    return reply;
  }
}

function isModelSelectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /Gemini request failed: (400|404)/.test(error.message);
}

async function readErrorDetail(res: Response): Promise<string> {
  try {
    const payload = (await res.json()) as {
      error?: { message?: string; status?: string; code?: number | string };
    };
    const message = payload.error?.message?.trim();
    if (message) return message;
    const status = payload.error?.status?.trim();
    if (status) return status;
    const code = payload.error?.code;
    return code == null ? "" : String(code);
  } catch {
    return "";
  }
}

export function makeGeminiProvider(config: AIConfig): GeminiProvider | null {
  if (!config.gemini.apiKey) return null;
  return new GeminiProvider(
    config.gemini.apiKey,
    config.gemini.model,
    config.timeoutMs
  );
}
