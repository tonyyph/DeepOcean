import { AmbientAudio } from "@/core/audio/AmbientAudioManager";
import { translations, type Language } from "@/core/i18n/translations";
import { ScreenTransitionLoadingProvider } from "@/core/navigation/screenTransitionLoading";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { NotificationService } from "@/core/notifications/NotificationService";
import { queryClient } from "@/core/query/client";
import { palette } from "@/design-system";
import {
  NotificationToastHost,
  reconcileDiveReminder,
} from "@/features/notifications";
import {
  dispatchWidgetCommand,
  installWidgetSnapshotSync,
  parseWidgetActionUrl,
  writeWidgetSnapshot,
  type WidgetNavigateTarget,
} from "@/features/widget";
import { usePremium, useSettings } from "@/stores";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

// Keep splash visible while we prime fonts + audio.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Reconcile the daily dive reminder with the user's persisted intent on every
 * cold start. Idempotent — only (re)schedules when the OS state has drifted.
 */
async function syncDiveReminders(): Promise<void> {
  try {
    await NotificationService.configure();
    const s = useSettings.getState();
    const lang = (s.language ?? "en") as Language;
    const copy = translations[lang].notifications;
    await reconcileDiveReminder(
      s.diveRemindersEnabled,
      s.reminderHour,
      s.reminderMinute,
      {
        title: copy.reminderTitle,
        body: copy.reminderBody,
        channelName: copy.reminderChannel,
      },
    );
  } catch (error) {
    console.log("syncDiveReminders error", error);
  }
}

export default function RootLayout() {
  const router = useRouter();
  const ambientVolume = useSettings((s) => s.ambientVolume);
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const [, setUpdating] = useState<boolean>(false);

  const navigateFromWidget = useCallback(
    (target: WidgetNavigateTarget) => {
      if (target === "ai") {
        router.replace("/(tabs)/ai");
        return;
      }
      router.replace("/(tabs)/stats");
    },
    [router],
  );

  const handleWidgetUrl = useCallback(
    (url: string) => {
      const command = parseWidgetActionUrl(url);
      if (!command) return;
      const result = dispatchWidgetCommand(command, {
        navigate: navigateFromWidget,
      });
      writeWidgetSnapshot();
      console.log("[WidgetCommand]", {
        action: command.action,
        status: result.status,
        reason: result.reason,
      });
    },
    [navigateFromWidget],
  );

  const checkAndForceUpdates = useCallback(async () => {
    if (__DEV__) {
      return;
    }
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.log("error", error);
    }
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    (async () => {
      await SystemUI.setBackgroundColorAsync(palette.abyss[600]);
      void AmbientAudio.init();
      await SplashScreen.hideAsync();
      await checkAndForceUpdates();
      await syncDiveReminders();
      // Resolve premium entitlements from the store (offline-safe; no-op when
      // RevenueCat is not configured).
      await usePremium.getState().hydrate();
      writeWidgetSnapshot();
    })();
  }, [fontsLoaded]);

  useEffect(() => {
    AmbientAudio.setAmbientVolume(ambientVolume);
  }, [ambientVolume]);

  useEffect(() => {
    if (!fontsLoaded) return;

    let isMounted = true;
    Linking.getInitialURL()
      .then((url) => {
        if (!isMounted || !url) return;
        handleWidgetUrl(url);
      })
      .catch(() => {
        // Ignore malformed startup URL and continue app boot.
      });

    const sub = Linking.addEventListener("url", ({ url }) => {
      handleWidgetUrl(url);
    });

    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [fontsLoaded, handleWidgetUrl]);

  useEffect(() => {
    if (!fontsLoaded) return;
    return installWidgetSnapshotSync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: palette.abyss[600] }}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NetworkProvider>
            <BottomSheetModalProvider>
              <StatusBar style="light" />
              <ScreenTransitionLoadingProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: palette.abyss[600] },
                    animation: "fade",
                    animationDuration: 360,
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen
                    name="dive"
                    options={{
                      animation: "fade_from_bottom",
                      animationDuration: 720,
                      gestureEnabled: false,
                    }}
                  />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="session/[id]"
                    options={{ animation: "slide_from_right" }}
                  />
                  <Stack.Screen
                    name="notifications"
                    options={{ animation: "slide_from_right" }}
                  />
                </Stack>
                <NotificationToastHost />
              </ScreenTransitionLoadingProvider>
            </BottomSheetModalProvider>
          </NetworkProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
