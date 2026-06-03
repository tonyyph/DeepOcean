import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import { ZONE_TABLE } from "@/features/ocean/zones";
import type { Rarity } from "@/features/ocean/bestiary";
import type { AIProvider, ReflectionInput } from "@/features/ai/AIProvider";
import type { AIContext, DiveSession, Language } from "@/domain/entities";
import type { IAICompanionGateway } from "@/domain/repositories";
import { composeOfflineCompanion } from "./offlineCompanion";

type CacheEntry = { text: string; at: number };

type AICachePayload = {
  recommendation: Partial<Record<Language, CacheEntry>>;
  motivation: Partial<Record<Language, CacheEntry>>;
  /** key = `${sessionId}:${language}` */
  reflections: Record<string, CacheEntry>;
};

const EMPTY_CACHE: AICachePayload = {
  recommendation: {},
  motivation: {},
  reflections: {}
};

const RARITY_RANK: Record<Rarity, number> = {
  mythic: 0,
  legendary: 1,
  rare: 2,
  uncommon: 3,
  common: 4
};

/**
 * AICompanionRepository — orchestrates a real {@link AIProvider} with a durable
 * MMKV cache. Strategy:
 *   1. If a provider is configured, call it; on success cache + return.
 *   2. On any failure (offline, timeout, API error), return the last cached
 *      real response for that key.
 *   3. With no provider and no cache, fall back to a context-derived offline
 *      composer (built from live data, never a canned advice pool).
 *
 * "Once-per-day" cadence is enforced at the query layer (24h staleTime); this
 * repository always attempts a fresh generation when asked.
 */
export class AICompanionRepository implements IAICompanionGateway {
  private readonly store = new TypedStore<AICachePayload>(StorageKeys.aiCache);

  constructor(private readonly provider: AIProvider | null) {}

  async dailyRecommendation(context: AIContext): Promise<string> {
    return this.run(
      () => this.provider?.generateRecommendation(context),
      () => this.readCache().recommendation[context.language],
      (entry) => this.writeRecommendation(context.language, entry),
      () => composeOfflineCompanion("recommendation", context)
    );
  }

  async motivation(context: AIContext): Promise<string> {
    return this.run(
      () => this.provider?.generateMotivation(context),
      () => this.readCache().motivation[context.language],
      (entry) => this.writeMotivation(context.language, entry),
      () => composeOfflineCompanion("motivation", context)
    );
  }

  async sessionSummary(
    session: DiveSession,
    language: Language = "en"
  ): Promise<string> {
    const input = toReflectionInput(session);
    const key = `${session.id}:${language}`;
    return this.run(
      () => this.provider?.generateReflection(input, language),
      () => this.readCache().reflections[key],
      (entry) => this.writeReflection(key, entry),
      () => composeOfflineReflection(input, language)
    );
  }

  /** Shared orchestration: provider → cache write, else stale cache, else offline. */
  private async run(
    call: () => Promise<string> | undefined,
    readCached: () => CacheEntry | undefined,
    writeCached: (entry: CacheEntry) => void,
    offline: () => string
  ): Promise<string> {
    const pending = call();
    if (pending) {
      try {
        const text = await pending;
        writeCached({ text, at: Date.now() });
        return text;
      } catch {
        // fall through to cache / offline
      }
    }
    return readCached()?.text ?? offline();
  }

  private readCache(): AICachePayload {
    return this.store.get(EMPTY_CACHE);
  }

  private writeRecommendation(language: Language, entry: CacheEntry): void {
    const cache = this.readCache();
    this.store.set({
      ...cache,
      recommendation: { ...cache.recommendation, [language]: entry }
    });
  }

  private writeMotivation(language: Language, entry: CacheEntry): void {
    const cache = this.readCache();
    this.store.set({
      ...cache,
      motivation: { ...cache.motivation, [language]: entry }
    });
  }

  private writeReflection(key: string, entry: CacheEntry): void {
    const cache = this.readCache();
    this.store.set({
      ...cache,
      reflections: { ...cache.reflections, [key]: entry }
    });
  }
}

function toReflectionInput(session: DiveSession): ReflectionInput {
  const notableNames = [...session.discoveries]
    .sort((a, b) => RARITY_RANK[a.entry.rarity] - RARITY_RANK[b.entry.rarity])
    .slice(0, 3)
    .map((d) => d.entry.name);
  return {
    minutes: Math.round(session.elapsedSeconds / 60),
    zoneLabel: ZONE_TABLE[session.zone].label,
    discoveries: session.discoveries.length,
    notableNames
  };
}

// Reflection has a distinct offline composer because its inputs differ.
function composeOfflineReflection(
  input: ReflectionInput,
  language: Language
): string {
  if (language === "vi") {
    const base = `Bạn đã tập trung ${input.minutes} phút và xuống tới ${input.zoneLabel}.`;
    return input.discoveries > 0
      ? `${base} Gặp ${input.discoveries} điều kỳ diệu trên đường đi — biển sâu nhớ bạn đấy.`
      : `${base} Sự tĩnh lặng cũng là một khám phá.`;
  }
  const base = `You stayed with ${input.minutes} minutes of focus and reached the ${input.zoneLabel}.`;
  return input.discoveries > 0
    ? `${base} You met ${input.discoveries} wonder${input.discoveries === 1 ? "" : "s"} along the way — the deep remembers you.`
    : `${base} Stillness is its own discovery.`;
}
