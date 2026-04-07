import {
  BalsamiqSans_400Regular,
  BalsamiqSans_700Bold,
  useFonts,
} from "@expo-google-fonts/balsamiq-sans";
import * as Font from "expo-font";
import { useAudioPlayer } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DefaultModelsWarmup } from "@/components/DefaultModelsWarmup";
import { AppProvider, useApp } from "@/context/AppContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function GlobalSoundtrackControl() {
  const { settings } = useApp();
  const player = useAudioPlayer(require("../assets/sounds/ten-past-naptime.mp3"));
  const muted = settings.soundtrackMuted ?? false;
  const volume = Math.max(0, Math.min(1, settings.soundtrackVolume ?? 0.5));

  useEffect(() => {
    const audioPlayer = player as unknown as {
      setVolume?: (next: number) => void;
      volume?: number;
    };

    if (typeof audioPlayer.setVolume === "function") {
      audioPlayer.setVolume(volume);
      return;
    }

    if (typeof audioPlayer.volume === "number") {
      audioPlayer.volume = volume;
    }
  }, [player, volume]);

  useEffect(() => {
    if (muted) {
      player.pause();
      return;
    }
    player.play();
  }, [muted, player, volume]);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ar" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="coin-dash" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="race" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="summary" options={{ headerShown: false, animation: "slide_from_bottom" }} />
      <Stack.Screen name="parent-mode" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="car-detail" options={{ headerShown: false, animation: "slide_from_right" }} />
      <Stack.Screen name="design-builder" options={{ headerShown: false, animation: "slide_from_bottom" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BalsamiqSans_400Regular,
    BalsamiqSans_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <DefaultModelsWarmup />
                <RootLayoutNav />
                <GlobalSoundtrackControl />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
