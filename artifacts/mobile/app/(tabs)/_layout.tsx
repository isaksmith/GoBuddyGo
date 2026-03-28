import { Tabs } from "expo-router";
import React from "react";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="games" options={{ title: "Games" }} />
      <Tabs.Screen name="garage" options={{ title: "Garage" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="badges" options={{ title: "Badges" }} />
      <Tabs.Screen name="sounds" options={{ title: "Sounds" }} />
    </Tabs>
  );
}
