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

/** Collapses LLM output to a single trimmed paragraph (no markdown/newlines). */
export function normaliseReply(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}
