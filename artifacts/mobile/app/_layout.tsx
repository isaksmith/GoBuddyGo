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
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DefaultModelsWarmup } from "@/components/DefaultModelsWarmup";
import { AppProvider } from "@/context/AppContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function GlobalSoundtrackControl() {
  const insets = useSafeAreaInsets();
  const [muted, setMuted] = useState(false);
  const player = useAudioPlayer(require("../assets/sounds/ten-past-naptime.mp3"));

  useEffect(() => {
    if (muted) {
      player.pause();
      return;
    }
    player.play();
  }, [muted, player]);

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Pressable
        onPress={() => {
          setMuted((prev) => !prev);
        }}
        style={[
          styles.musicButton,
          {
            top: insets.top + 8,
          },
        ]}
        testID="global-music-toggle"
      >
        <Ionicons
          name={muted ? "volume-mute" : "volume-high"}
          size={20}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
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

const styles = StyleSheet.create({
  musicButton: {
    position: "absolute",
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,16,28,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 9999,
  },
});
