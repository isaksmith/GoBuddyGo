import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="missions">
        <Icon sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }} />
        <Label>Missions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <Label>History</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: "home", inactive: "home-outline" },
  missions: { active: "checkmark-circle", inactive: "checkmark-circle-outline" },
  history: { active: "trophy", inactive: "trophy-outline" },
};

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.tabBarBg,
          borderTopWidth: 0,
          elevation: 0,
          height: isWeb ? 84 : 72,
          paddingBottom: isWeb ? 16 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Nunito_700Bold",
          letterSpacing: 1,
          textTransform: "uppercase",
          marginTop: 2,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={95}
              tint="dark"
              style={[StyleSheet.absoluteFill, styles.tabBarBlur]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBg]} />
          ),
        tabBarIcon: ({ color, focused }) => {
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS["index"];
          const iconName = focused ? icons.active : icons.inactive;
          const iosName =
            route.name === "index"
              ? focused
                ? "house.fill"
                : "house"
              : route.name === "missions"
              ? focused
                ? "checkmark.circle.fill"
                : "checkmark.circle"
              : focused
              ? "trophy.fill"
              : "trophy";
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              {isIOS ? (
                <SymbolView name={iosName} tintColor={color} size={26} />
              ) : (
                <Ionicons name={iconName} size={26} color={color} />
              )}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="missions" options={{ title: "Missions" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabBarBg: {
    backgroundColor: Colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: Colors.primary + "33",
  },
  tabBarBlur: {
    borderTopWidth: 1,
    borderTopColor: Colors.primary + "33",
  },
  iconWrap: {
    width: 42,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
  },
  iconWrapActive: {
    backgroundColor: Colors.primary + "25",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
});
