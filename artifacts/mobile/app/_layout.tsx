import {
  BalsamiqSans_400Regular,
  BalsamiqSans_700Bold,
  useFonts,
} from "@expo-google-fonts/balsamiq-sans";
import * as Font from "expo-font";
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
import { AppProvider } from "@/context/AppContext";
import { Colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
