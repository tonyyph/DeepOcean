// Composition root — wire concrete data implementations to domain interfaces.
// Anywhere else in the app, depend on these instances (or the *interfaces*),
// never on the concrete classes.

import { SessionRepository } from "./repositories/SessionRepository";
import { CollectionRepository } from "./repositories/CollectionRepository";
import { DiverRepository } from "./repositories/DiverRepository";
import { MockAICompanionGateway } from "./gateways/MockAICompanionGateway";

export const container = {
  sessions: new SessionRepository(),
  collection: new CollectionRepository(),
  diver: new DiverRepository(),
  ai: new MockAICompanionGateway()
} as const;

export type Container = typeof container;
