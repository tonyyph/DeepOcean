/**
 * Performs a fetch with an enforced timeout. Rejects with a typed Error on
 * timeout or network failure so callers can fall back to cache cleanly.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export class AIProviderHttpError extends Error {
  constructor(
    message: string,
    readonly providerId: string,
    readonly status: number,
    readonly detail: string
  ) {
    super(message);
    this.name = "AIProviderHttpError";
  }
}

/**
 * Determines whether we should try the next provider in the chain.
 * We fail over on quota/rate-limit/temporary provider issues.
 */
export function shouldFallbackToNextProvider(error: unknown): boolean {
  if (error instanceof AIProviderHttpError) {
    if (error.status === 429) return true;
    if (error.status >= 500 && error.status <= 599) return true;

    const detail = error.detail.toLowerCase();
    if (
      /quota|insufficient|credit|billing|rate.?limit|resource.?exhausted/.test(
        detail
      )
    ) {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return /quota|rate.?limit|insufficient|resource.?exhausted/.test(message);
  }

  return false;
}

/** Collapses LLM output to a single trimmed paragraph (no markdown/newlines). */
export function normaliseReply(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}
