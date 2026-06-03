import "../global.css";
import React, { useCallback, useEffect, useState } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useFonts } from "expo-font";
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold
} from "@expo-google-fonts/sora";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold
} from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold
} from "@expo-google-fonts/space-grotesk";
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold
} from "@expo-google-fonts/manrope";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { queryClient } from "@/core/query/client";
import { NetworkProvider } from "@/core/network/NetworkProvider";
import { palette } from "@/design-system";
import { AmbientAudio } from "@/core/audio/AmbientAudioManager";
import * as Updates from "expo-updates";

// Keep splash visible while we prime fonts + audio.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
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
    Manrope_700Bold
  });

  const [, setUpdating] = useState<boolean>(false);

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
      await AmbientAudio.init();
      await SplashScreen.hideAsync();
      await checkAndForceUpdates();
    })();
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
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: palette.abyss[600] },
                  animation: "fade",
                  animationDuration: 360
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen
                  name="dive"
                  options={{
                    animation: "fade_from_bottom",
                    animationDuration: 720,
                    gestureEnabled: false
                  }}
                />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </BottomSheetModalProvider>
          </NetworkProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
