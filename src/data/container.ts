// Composition root — wire concrete data implementations to domain interfaces.
// Anywhere else in the app, depend on these instances (or the *interfaces*),
// never on the concrete classes.

import { SessionRepository } from "./repositories/SessionRepository";
import { CollectionRepository } from "./repositories/CollectionRepository";
import { DiverRepository } from "./repositories/DiverRepository";
import { NotificationRepository } from "./repositories/NotificationRepository";
import { MoodRepository } from "./repositories/MoodRepository";
import { AICompanionRepository } from "./repositories/AICompanionRepository";
import { createAIProvider } from "./gateways/aiProviderFactory";
import { PremiumRepository } from "./repositories/PremiumRepository";

export const container = {
  sessions: new SessionRepository(),
  collection: new CollectionRepository(),
  diver: new DiverRepository(),
  notifications: new NotificationRepository(),
  mood: new MoodRepository(),
  ai: new AICompanionRepository(createAIProvider()),
  premium: new PremiumRepository()
} as const;

export type Container = typeof container;
