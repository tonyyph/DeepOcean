import { MMKV } from "react-native-mmkv";

/**
 * Storage — typed MMKV wrapper. Single shared instance keeps reads/writes
 * synchronous and ~30x faster than AsyncStorage. Use namespaces (`scope`) to
 * keep keys collision-free across features.
 */
export const storage = new MMKV({ id: "deep-ocean.v1" });

export class TypedStore<T> {
  constructor(private readonly key: string) {}

  get(fallback: T): T {
    const raw = storage.getString(this.key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  set(value: T): void {
    storage.set(this.key, JSON.stringify(value));
  }

  remove(): void {
    storage.delete(this.key);
  }
}

export const StorageKeys = {
  onboardingComplete: "onboarding.complete",
  diverProfile: "diver.profile",
  collection: "discovery.collection",
  sessions: "sessions.history",
  settings: "app.settings",
  personalization: "app.personalization",
  theme: "app.theme",
  premium: "app.premium",
  achievements: "app.achievements",
  notifications: "app.notifications.schedule",
  notificationMessages: "app.notifications.messages",
  mood: "app.mood",
  aiCache: "app.ai.cache",
  premiumSnapshot: "app.premium.snapshot",
  trialState: "app.premium.trial",
  usedPromoCodes: "app.premium.promo_codes",
  widgetSnapshot: "app.widget.snapshot",
  activeDiveSession: "dive.active_session",
  diveYoutubeMusicEnabled: "dive.youtubeMusicEnabled",
} as const;
