import {
  BalsamiqSans_400Regular,
  BalsamiqSans_700Bold,
  useFonts,
} from "@expo-google-fonts/balsamiq-sans";
import * as Font from "expo-font";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DefaultModelsWarmup } from "@/components/DefaultModelsWarmup";
import { AppProvider, useApp } from "@/context/AppContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const CAPPED_TRACK_DURATION_MS = 0;

function GlobalSoundtrackControl() {
  const { settings } = useApp();
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCappedTrack = false;
  const source =
    settings.language === "spanish"
      ? require("../assets/sounds/coastal-playroom.mp3")
      : settings.language === "vietnamese"
        ? require("../assets/sounds/clockwork-afternoon.mp3")
        : settings.language === "chinese"
          ? require("../assets/sounds/sunlight-on-bamboo.mp3")
      : require("../assets/sounds/ten-past-naptime.mp3");
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const muted = settings.soundtrackMuted ?? false;
  const volume = Math.max(0, Math.min(1, settings.soundtrackVolume ?? 0.5));

  const clearSegmentTimer = () => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!status.isLoaded) {
      return;
    }

    try {
      player.loop = true;
    } catch {
      // Ignore loop assignment failures on unsupported runtimes.
    }

    try {
      player.volume = muted ? 0 : volume;
    } catch {
      // Ignore volume assignment failures on unsupported runtimes.
    }

    try {
      if (muted) {
        if (status.playing) {
          player.pause();
        }
        clearSegmentTimer();
      } else if (!status.playing) {
        player.play();
      }

      if (!muted && isCappedTrack) {
        clearSegmentTimer();
        segmentTimerRef.current = setTimeout(() => {
          void player
            .seekTo(0)
            .then(() => {
              if (!muted) {
                player.play();
              }
            })
            .catch(() => {});
        }, CAPPED_TRACK_DURATION_MS);
      } else {
        clearSegmentTimer();
      }
    } catch {
      // Ignore playback control failures to avoid blocking app startup.
    }
  }, [isCappedTrack, muted, player, status.isLoaded, status.playing, volume]);

  useEffect(() => {
    return () => {
      clearSegmentTimer();
    };
  }, []);

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
      <Stack.Screen name="saved-car-detail" options={{ headerShown: false, animation: "slide_from_right" }} />
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
