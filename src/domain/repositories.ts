import type {
  AIContext,
  CollectionEntry,
  DiveSession,
  DiverProfile,
  EntitlementSnapshot,
  Language,
  MoodRecord,
  NotificationSchedule,
  PromoCodeResult,
  PurchaseOffering,
  TrialState
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
  dailyRecommendation(context: AIContext): Promise<string>;
  motivation(context: AIContext): Promise<string>;
  sessionSummary(session: DiveSession, language?: Language): Promise<string>;
}

export interface INotificationRepository {
  getSchedule(): Promise<NotificationSchedule | null>;
  saveSchedule(schedule: NotificationSchedule): Promise<void>;
  clearSchedule(): Promise<void>;
}

export interface IMoodRepository {
  get(): Promise<MoodRecord>;
  set(record: MoodRecord): Promise<MoodRecord>;
  clear(): Promise<void>;
}

/**
 * Entitlement gateway — abstracts the store / IAP provider (RevenueCat).
 * Resolves and persists the user's premium state so it survives reinstall
 * (entitlements are restored from the store account on the next refresh).
 */
export interface IEntitlementGateway {
  /** True when a real billing provider is configured (API key present). */
  readonly isConfigured: boolean;
  /** Initialize the billing SDK. Safe to call multiple times. */
  configure(): Promise<void>;
  /** Last-known snapshot from the local cache (synchronous, offline-safe). */
  cached(): EntitlementSnapshot;
  /** Re-resolve entitlements from the store and update the cache. */
  refresh(): Promise<EntitlementSnapshot>;
  /** Fetch buyable options for the paywall. Null when unavailable. */
  offerings(): Promise<PurchaseOffering | null>;
  /** Purchase the lifetime all-access pass. */
  purchaseLifetime(): Promise<EntitlementSnapshot>;
  /** Purchase the annual subscription. */
  purchaseAnnual(): Promise<EntitlementSnapshot>;
  /** Purchase the monthly subscription. */
  purchaseMonthly(): Promise<EntitlementSnapshot>;
  /** Purchase a single premium theme. */
  purchaseTheme(themeId: string): Promise<EntitlementSnapshot>;
  /** Restore prior purchases from the store account. */
  restore(): Promise<EntitlementSnapshot>;
  /** Start a 7-day free trial for the given plan. */
  startTrial(planId: "annual" | "monthly"): Promise<TrialState>;
  /** Validate a promo/experience code. Returns a 3-day unlock on success. */
  validatePromoCode(code: string): Promise<PromoCodeResult>;
  /** Read the current active trial/promo state (null = none). */
  activeTrial(): TrialState | null;
}
