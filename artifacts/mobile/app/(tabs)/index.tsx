import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    tagline: "Let's play!",
    icon: "game-controller",
    route: "/(tabs)/games",
    colors: ["#4F8EF7", "#2B5FD9"],
    glowColor: "#4F8EF7",
    testID: "hub-games-btn",
    pulseDelay: 0,
  },
  {
    label: "Garage",
    tagline: "Build your ride!",
    icon: "car-sport",
    route: "/(tabs)/garage",
    colors: ["#3ECF8E", "#1EA06B"],
    glowColor: "#3ECF8E",
    testID: "hub-garage-btn",
    pulseDelay: 300,
  },
  {
    label: "Badges",
    tagline: "Earn 'em all!",
    icon: "star",
    route: "/(tabs)/badges",
    colors: ["#F5A623", "#D4820A"],
    glowColor: "#F5A623",
    testID: "hub-badges-btn",
    pulseDelay: 600,
  },
  {
    label: "Sounds",
    tagline: "Make some noise!",
    icon: "volume-high",
    route: "/(tabs)/sounds",
    colors: ["#A855F7", "#7C3AED"],
    glowColor: "#A855F7",
    testID: "hub-sounds-btn",
    pulseDelay: 900,
  },
];

function HubButtonContent({ btn, btnW, btnH }: { btn: HubButton; btnW: number; btnH: number }) {
  const textScale = useTextScale();
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(btn.pulseDelay),
        Animated.timing(pulse, { toValue: 1.12, duration: 700, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: native }),
        Animated.delay(1800),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Pressable
      testID={btn.testID}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push(btn.route);
      }}
      style={({ pressed }) => [
        styles.hubButtonWrap,
        { width: btnW, height: btnH, shadowColor: btn.glowColor },
        pressed && styles.hubButtonPressed,
      ]}
    >
      <LinearGradient
        colors={btn.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hubButton,
          { borderColor: btn.glowColor + "55", borderWidth: 1.5 },
        ]}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0.0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.glossOverlay}
          />
        </View>
        <Animated.View
          style={[
            styles.hubIconCircleWrap,
            { transform: [{ scale: pulse }] },
          ]}
        >
          <View
            style={[
              styles.hubIconGlowRing,
              { borderColor: btn.glowColor + "99" },
            ]}
          />
          <View style={styles.hubIconCircle}>
            <Ionicons name={btn.icon} size={52} color="#FFFFFF" />
          </View>
        </Animated.View>
        <Text style={[styles.hubButtonLabel, { fontSize: 16 * textScale }]}>{btn.label}</Text>
        <Text style={[styles.hubButtonTagline, { fontSize: 11 * textScale }]}>{btn.tagline}</Text>
      </LinearGradient>
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

  const GRID_GAP = 10;
  const H_PAD = isLandscape ? 20 : 14;
  const headerH = isLandscape ? 48 : 68;

  const cols = isLandscape ? 4 : 2;
  const btnW = (width - H_PAD * 2 - GRID_GAP * (cols - 1)) / cols;
  const availableH = height - topPad - bottomPad - headerH;
  const rows = HUB_BUTTONS.length / cols;
  const btnH = Math.min((availableH - GRID_GAP * (rows - 1)) / rows, isLandscape ? 180 : 999);

  return (
    <View style={styles.container}>
      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: H_PAD }]}>
        <View style={[styles.header, { height: headerH }]}>
          <Pressable onPress={handleHiddenTap} testID="settings-btn" style={styles.titleWrap}>
            <Text style={[styles.appTitle, { fontSize: (isLandscape ? 28 : 42) * textScale }]}>Go Buddy Go</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/parent-mode");
            }}
            style={styles.settingsCog}
            testID="settings-cog-btn"
            hitSlop={12}
          >
            <Ionicons name="settings-outline" size={26} color="rgba(255,255,255,0.5)" />
          </Pressable>
        </View>

        <View style={[styles.hubGrid, { gap: GRID_GAP }]}>
          {HUB_BUTTONS.map((btn) => (
            <HubButtonContent key={btn.label} btn={btn} btnW={btnW} btnH={btnH} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  inner: {
    flex: 1,
    zIndex: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  settingsCog: {
    padding: 4,
    marginLeft: 8,
  },
  appTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "#FF6B9D",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  hubGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  hubButtonWrap: {
    borderRadius: 28,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
  },
  hubButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  hubButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 28,
    overflow: "hidden",
  },
  glossOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    zIndex: 1,
  },
  hubIconCircleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  hubIconGlowRing: {
    position: "absolute",
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2.5,
    zIndex: 0,
  },
  hubIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  hubButtonLabel: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  hubButtonTagline: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    marginTop: -4,
  },
});
