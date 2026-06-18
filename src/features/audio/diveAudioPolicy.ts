import type { DiveSession } from "@/domain/entities";

export function isNaturalDiveCompletion(
  session: DiveSession | null,
  endReason: "natural" | "manual" | null
): boolean {
  return Boolean(
    session &&
      endReason === "natural" &&
      session.status === "surfaced" &&
      session.targetSeconds !== null &&
      session.elapsedSeconds >= session.targetSeconds
  );
}

export function isDirectAudioUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      /\.(mp3|m4a|aac|wav|ogg)(?:$|\?)/i.test(parsed.pathname + parsed.search)
    );
  } catch {
    return false;
  }
}
