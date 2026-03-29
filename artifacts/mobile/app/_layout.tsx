import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CurbEdgeOverlay, RoadBackground } from "@/components/RacetrackBackground";
import { AppProvider } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "transparent" },
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
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
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
                <View style={{ flex: 1, backgroundColor: "#1A1A1A" }}>
                  <RoadBackground />
                  <RootLayoutNav />
                  <CurbEdgeOverlay />
                </View>
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
