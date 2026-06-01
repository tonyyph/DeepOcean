import type {
  CollectionEntry,
  DiveSession,
  DiverProfile,
  Language
} from "@/domain/entities";

/**
 * Repository interfaces — domain owns the contracts; data layer implements.
 * Keeps screens/hooks ignorant of MMKV / REST / GraphQL details.
 */

export interface ISessionRepository {
  list(): Promise<DiveSession[]>;
  save(session: DiveSession): Promise<void>;
  byId(id: string): Promise<DiveSession | null>;
  clearAll(): Promise<void>;
}

export interface ICollectionRepository {
  all(): Promise<CollectionEntry[]>;
  recordSighting(entryId: string): Promise<CollectionEntry>;
}

export interface IDiverRepository {
  get(): Promise<DiverProfile>;
  update(patch: Partial<DiverProfile>): Promise<DiverProfile>;
}

export interface IAICompanionGateway {
  dailyRecommendation(
    profile: DiverProfile,
    language: Language
  ): Promise<string>;
  sessionSummary(session: DiveSession, language?: Language): Promise<string>;
}
