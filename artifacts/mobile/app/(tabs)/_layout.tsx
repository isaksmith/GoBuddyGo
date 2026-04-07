import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

export default function TabLayout() {
  const { settings } = useApp();
  const language = settings.language;

  return (
    <Tabs
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("HOME", language) }} />
      <Tabs.Screen name="games" options={{ title: t("GAMES", language) }} />
      <Tabs.Screen name="garage" options={{ title: t("GARAGE", language) }} />
      <Tabs.Screen name="history" options={{ title: t("HISTORY", language) }} />
      <Tabs.Screen name="badges" options={{ title: t("BADGES", language) }} />
      <Tabs.Screen name="sounds" options={{ title: t("SOUNDS", language) }} />
    </Tabs>
  );
}
