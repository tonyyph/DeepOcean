import { create, StoreApi, UseBoundStore } from "zustand";
import { storage, StorageKeys, TypedStore } from "@/core/storage/mmkv";
import type {
  AIRecommendation,
  GoalId,
  OnboardingPersonalization,
  RecommendedWorkflow
} from "@/domain/entities";

export const ONBOARDING_VERSION = 2;

const DEFAULT_PERSONALIZATION: OnboardingPersonalization = {
  onboardingCompleted: false,
  onboardingVersion: ONBOARDING_VERSION,
  selectedGoals: [],
  selectedRecommendedItems: [],
  selectedWorkflow: null,
  lastActiveWorkflow: null,
  lastAIRecommendation: null,
  premiumPreference: "unknown"
};

const store = new TypedStore<OnboardingPersonalization>(
  StorageKeys.personalization
);

function hydratePersonalization(): OnboardingPersonalization {
  const persisted = store.get(DEFAULT_PERSONALIZATION);
  const legacyComplete =
    storage.getBoolean(StorageKeys.onboardingComplete) ?? false;
  const onboardingCompleted = persisted.onboardingCompleted || legacyComplete;
  const selectedWorkflow =
    persisted.selectedWorkflow ?? persisted.lastActiveWorkflow ?? null;

  return {
    ...DEFAULT_PERSONALIZATION,
    ...persisted,
    onboardingCompleted,
    onboardingVersion: persisted.onboardingVersion || ONBOARDING_VERSION,
    selectedWorkflow,
    lastActiveWorkflow: persisted.lastActiveWorkflow ?? selectedWorkflow
  };
}

function persist(next: OnboardingPersonalization) {
  store.set(next);
  storage.set(StorageKeys.onboardingComplete, next.onboardingCompleted);
}

type PersonalizationState = OnboardingPersonalization & {
  setGoals: (selectedGoals: GoalId[]) => void;
  setRecommendation: (recommendation: AIRecommendation) => void;
  setSelectedRecommendedItems: (itemIds: string[]) => void;
  setWorkflow: (workflowId: RecommendedWorkflow["id"]) => void;
  setLastActiveWorkflow: (workflowId: RecommendedWorkflow["id"]) => void;
  setPremiumPreference: (
    premiumPreference: OnboardingPersonalization["premiumPreference"]
  ) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const usePersonalization: UseBoundStore<
  StoreApi<PersonalizationState>
> = create<PersonalizationState>((set, get) => ({
  ...hydratePersonalization(),

  setGoals: (selectedGoals) =>
    set((state) => {
      const next = { ...state, selectedGoals };
      persist(stripActions(next));
      return next;
    }),

  setRecommendation: (lastAIRecommendation) =>
    set((state) => {
      const next = { ...state, lastAIRecommendation };
      persist(stripActions(next));
      return next;
    }),

  setSelectedRecommendedItems: (selectedRecommendedItems) =>
    set((state) => {
      const next = { ...state, selectedRecommendedItems };
      persist(stripActions(next));
      return next;
    }),

  setWorkflow: (workflowId) =>
    set((state) => {
      const next = {
        ...state,
        selectedWorkflow: workflowId,
        lastActiveWorkflow: workflowId
      };
      persist(stripActions(next));
      return next;
    }),

  setLastActiveWorkflow: (workflowId) =>
    set((state) => {
      const next = { ...state, lastActiveWorkflow: workflowId };
      persist(stripActions(next));
      return next;
    }),

  setPremiumPreference: (premiumPreference) =>
    set((state) => {
      const next = { ...state, premiumPreference };
      persist(stripActions(next));
      return next;
    }),

  completeOnboarding: () =>
    set((state) => {
      const workflow =
        state.selectedWorkflow ??
        state.lastAIRecommendation?.recommendedWorkflow.id ??
        "daily_focus";
      const next = {
        ...state,
        onboardingCompleted: true,
        onboardingVersion: ONBOARDING_VERSION,
        selectedWorkflow: workflow,
        lastActiveWorkflow: workflow
      };
      persist(stripActions(next));
      return next;
    }),

  resetOnboarding: () =>
    set(() => {
      const next = {
        ...DEFAULT_PERSONALIZATION,
        onboardingCompleted: false,
        onboardingVersion: ONBOARDING_VERSION
      };
      persist(next);
      return {
        ...next,
        setGoals: get().setGoals,
        setRecommendation: get().setRecommendation,
        setSelectedRecommendedItems: get().setSelectedRecommendedItems,
        setWorkflow: get().setWorkflow,
        setLastActiveWorkflow: get().setLastActiveWorkflow,
        setPremiumPreference: get().setPremiumPreference,
        completeOnboarding: get().completeOnboarding,
        resetOnboarding: get().resetOnboarding
      };
    })
}));

function stripActions(state: PersonalizationState): OnboardingPersonalization {
  const {
    setGoals: _setGoals,
    setRecommendation: _setRecommendation,
    setSelectedRecommendedItems: _setSelectedRecommendedItems,
    setWorkflow: _setWorkflow,
    setLastActiveWorkflow: _setLastActiveWorkflow,
    setPremiumPreference: _setPremiumPreference,
    completeOnboarding: _completeOnboarding,
    resetOnboarding: _resetOnboarding,
    ...persisted
  } = state;
  return persisted;
}
