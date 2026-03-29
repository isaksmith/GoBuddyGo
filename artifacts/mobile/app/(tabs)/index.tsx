import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import { Colors } from "@/constants/colors";
import { useTextScale } from "@/hooks/useTextScale";

const native = Platform.OS !== "web";

type HubButton = {
  label: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
  colors: [string, string];
  glowColor: string;
  testID: string;
  pulseDelay: number;
};

const HUB_BUTTONS: HubButton[] = [
  {
    label: "Games",
    tagline: "🎮",
    icon: "game-controller",
    route: "/(tabs)/games",
    colors: ["#4F8EF7", "#2B5FD9"],
    glowColor: "#4F8EF7",
    testID: "hub-games-btn",
    pulseDelay: 0,
  },
  {
    label: "Garage",
    tagline: "🚗",
    icon: "car-sport",
    route: "/(tabs)/garage",
    colors: ["#3ECF8E", "#1EA06B"],
    glowColor: "#3ECF8E",
    testID: "hub-garage-btn",
    pulseDelay: 300,
  },
  {
    label: "Badges",
    tagline: "⭐",
    icon: "star",
    route: "/(tabs)/badges",
    colors: ["#F5A623", "#D4820A"],
    glowColor: "#F5A623",
    testID: "hub-badges-btn",
    pulseDelay: 600,
  },
  {
    label: "Sounds",
    tagline: "🔊",
    icon: "volume-high",
    route: "/(tabs)/sounds",
    colors: ["#A855F7", "#7C3AED"],
    glowColor: "#A855F7",
    testID: "hub-sounds-btn",
    pulseDelay: 900,
  },
];

function HubButtonContent({ btn }: { btn: HubButton }) {
  const textScale = useTextScale();

  return (
    <Pressable
      testID={btn.testID}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(btn.route);
      }}
      style={({ pressed }) => [
        styles.gameCard,
        { backgroundColor: btn.colors[0] },
        pressed && styles.gameCardPressed,
      ]}
    >
      <Text style={[styles.gameCardEmoji, { fontSize: 48 * textScale }]}>{btn.tagline}</Text>
      <Text style={[styles.gameCardLabel, { fontSize: 16 * textScale }]}>{btn.label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const textScale = useTextScale();
  const isLandscape = width > height;
  const hiddenTapCount = useRef(0);
  const hiddenTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHiddenTap = () => {
    hiddenTapCount.current += 1;
    if (hiddenTapTimer.current) clearTimeout(hiddenTapTimer.current);
    hiddenTapTimer.current = setTimeout(() => {
      hiddenTapCount.current = 0;
    }, 1500);
    if (hiddenTapCount.current >= 5) {
      hiddenTapCount.current = 0;
      if (hiddenTapTimer.current) clearTimeout(hiddenTapTimer.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push("/parent-mode");
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <AppBackground>
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/parent-mode");
          }}
          style={styles.settingsCog}
          testID="settings-cog-btn"
          hitSlop={12}
        >
          <Ionicons name="settings-outline" size={26} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>
      <View style={[styles.titleSection, { paddingHorizontal: 8, paddingBottom: 8 }]}>
        <Pressable onPress={handleHiddenTap} testID="settings-btn" style={styles.titleWrap}>
          <Text style={[styles.appTitle, { fontSize: (isLandscape ? 28 : 42) * textScale }]} numberOfLines={1} adjustsFontSizeToFit>🏎️ Go Buddy Go 🏎️</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hubGrid}>
          {HUB_BUTTONS.map((btn) => (
            <HubButtonContent key={btn.label} btn={btn} />
          ))}
        </View>
      </ScrollView>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    gap: 10,
  },
  titleSection: {
    alignItems: "center",
  },
  titleWrap: {
    width: "100%",
    alignItems: "center",
  },
  settingsCog: {
    padding: 4,
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  hubGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  gameCard: {
    width: "48%",
    borderRadius: 28,
    paddingVertical: 92,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  gameCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  gameCardEmoji: {
    fontSize: 56,
  },
  gameCardLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
