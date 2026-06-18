import { storage, StorageKeys } from "@/core/storage/mmkv";
import { Redirect } from "expo-router";

/**
 * Root index — pure router. Routes to onboarding on first launch,
 * otherwise into the tab navigator.
 */
export default function Index() {
  const done = storage.getBoolean(StorageKeys.onboardingComplete) ?? false;
  return <Redirect href={done ? "/(tabs)" : "/onboarding"} />;
}
