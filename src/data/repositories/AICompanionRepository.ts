import { StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type { AIProvider } from "@/features/ai/AIProvider";
import type { AIContext, DiveSession, Language } from "@/domain/entities";
import type {
  AIRequestOptions,
  IAICompanionGateway
} from "@/domain/repositories";
import { shouldFallbackToNextProvider } from "../gateways/aiHttp";
import { composeOfflineCompanion } from "./offlineCompanion";
import {
  composeOfflineReflection,
  ensureMotivationQuality,
  ensureRecommendationQuality,
  isTelemetryEnabled,
  polishEmotionalReply,
  shouldServeCachedFirst,
  toReflectionInput
} from "./AICompanionRepository.helpers";

type CacheEntry = { text: string; at: number };
type AIRequestKind = "recommendation" | "motivation" | "reflection";
type AIResponseSource =
  | "provider:gemini"
  | "provider:groq"
  | "provider:openrouter"
  | "cache"
  | "offline";

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

const TELEMETRY_COUNTS: Record<AIResponseSource, number> = {
  "provider:gemini": 0,
  "provider:groq": 0,
  "provider:openrouter": 0,
  cache: 0,
  offline: 0
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

  constructor(private readonly providers: readonly AIProvider[]) {}

  async dailyRecommendation(
    context: AIContext,
    options?: AIRequestOptions
  ): Promise<string> {
    const text = await this.run(
      "recommendation",
      (provider) => provider.generateRecommendation(context),
      () => this.readCache().recommendation[context.language],
      (entry) => this.writeRecommendation(context.language, entry),
      () => composeOfflineCompanion("recommendation", context),
      options
    );
    return polishEmotionalReply(
      ensureRecommendationQuality(text, context),
      context.language
    );
  }

  async motivation(
    context: AIContext,
    options?: AIRequestOptions
  ): Promise<string> {
    const text = await this.run(
      "motivation",
      (provider) => provider.generateMotivation(context),
      () => this.readCache().motivation[context.language],
      (entry) => this.writeMotivation(context.language, entry),
      () => composeOfflineCompanion("motivation", context),
      options
    );
    return polishEmotionalReply(
      ensureMotivationQuality(text, context),
      context.language
    );
  }

  async sessionSummary(
    session: DiveSession,
    language: Language = "en"
  ): Promise<string> {
    const input = toReflectionInput(session);
    const key = `${session.id}:${language}`;
    const text = await this.run(
      "reflection",
      (provider) => provider.generateReflection(input, language),
      () => this.readCache().reflections[key],
      (entry) => this.writeReflection(key, entry),
      () => composeOfflineReflection(input, language),
      undefined
    );
    return polishEmotionalReply(text, language);
  }

  /** Shared orchestration: provider → cache write, else stale cache, else offline. */
  private async run(
    kind: AIRequestKind,
    call: (provider: AIProvider) => Promise<string>,
    readCached: () => CacheEntry | undefined,
    writeCached: (entry: CacheEntry) => void,
    offline: () => string,
    options?: AIRequestOptions
  ): Promise<string> {
    const startedAt = Date.now();
    const attemptedProviders: string[] = [];
    const cached = readCached();

    if (cached?.text && shouldServeCachedFirst(kind, cached, options)) {
      this.logTelemetry(kind, {
        source: "cache",
        attemptedProviders,
        durationMs: Date.now() - startedAt
      });
      return cached.text;
    }

    if (this.providers.length > 0) {
      try {
        for (const [i, provider] of this.providers.entries()) {
          attemptedProviders.push(provider.id);
          try {
            const text = await call(provider);
            writeCached({ text, at: Date.now() });
            this.logTelemetry(kind, {
              source: `provider:${provider.id}`,
              attemptedProviders,
              durationMs: Date.now() - startedAt
            });
            return text;
          } catch (error) {
            const canFallback =
              i < this.providers.length - 1 &&
              shouldFallbackToNextProvider(error);

            if (!canFallback) break;
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.log("[AICompanion] Provider loop crashed", error);
        }
      }
    }

    if (__DEV__ && this.providers.length === 0) {
      console.log(
        "[AICompanion] No AI provider configured; using cache/offline only"
      );
    }

    if (cached?.text) {
      this.logTelemetry(kind, {
        source: "cache",
        attemptedProviders,
        durationMs: Date.now() - startedAt
      });
      return cached.text;
    }

    const offlineText = offline();
    this.logTelemetry(kind, {
      source: "offline",
      attemptedProviders,
      durationMs: Date.now() - startedAt
    });
    return offlineText;
  }

  private logTelemetry(
    kind: AIRequestKind,
    event: {
      source: AIResponseSource;
      attemptedProviders: string[];
      durationMs: number;
    }
  ): void {
    if (!isTelemetryEnabled()) return;

    TELEMETRY_COUNTS[event.source] += 1;
    console.info(
      "[AICompanion][telemetry]",
      JSON.stringify(
        {
          kind,
          source: event.source,
          attemptedProviders: event.attemptedProviders,
          durationMs: event.durationMs,
          totals: TELEMETRY_COUNTS
        },
        null,
        2
      )
    );
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
