import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

const { width, height } = Dimensions.get("window");
const native = Platform.OS !== "web";

const DOTS = [
  { rx: 0.06, ry: 0.05, s: 22, c: "#FF6B9D" },
  { rx: 0.88, ry: 0.08, s: 14, c: "#FFD93D" },
  { rx: 0.02, ry: 0.28, s: 18, c: "#6BCB77" },
  { rx: 0.91, ry: 0.24, s: 26, c: "#4D96FF" },
  { rx: 0.10, ry: 0.58, s: 20, c: "#F4633A" },
  { rx: 0.84, ry: 0.62, s: 16, c: "#C084FC" },
  { rx: 0.46, ry: 0.04, s: 12, c: "#34D399" },
  { rx: 0.60, ry: 0.88, s: 18, c: "#F59E0B" },
  { rx: 0.20, ry: 0.88, s: 22, c: "#60A5FA" },
  { rx: 0.78, ry: 0.50, s: 14, c: "#F472B6" },
  { rx: 0.30, ry: 0.15, s: 10, c: "#A78BFA" },
  { rx: 0.68, ry: 0.12, s: 24, c: "#FCD34D" },
  { rx: 0.95, ry: 0.44, s: 13, c: "#4ADE80" },
  { rx: 0.01, ry: 0.46, s: 19, c: "#FB923C" },
  { rx: 0.54, ry: 0.93, s: 15, c: "#38BDF8" },
  { rx: 0.38, ry: 0.40, s: 8, c: "#F472B6" },
  { rx: 0.74, ry: 0.33, s: 11, c: "#6EE7B7" },
  { rx: 0.18, ry: 0.42, s: 16, c: "#FDE68A" },
  { rx: 0.50, ry: 0.70, s: 10, c: "#C4B5FD" },
  { rx: 0.86, ry: 0.80, s: 20, c: "#86EFAC" },
];

const STARS = [
  { rx: 0.14, ry: 0.10, size: 18, delay: 0 },
  { rx: 0.78, ry: 0.18, size: 22, delay: 600 },
  { rx: 0.06, ry: 0.72, size: 16, delay: 300 },
  { rx: 0.90, ry: 0.68, size: 20, delay: 900 },
  { rx: 0.50, ry: 0.82, size: 14, delay: 450 },
  { rx: 0.36, ry: 0.05, size: 12, delay: 1200 },
  { rx: 0.62, ry: 0.55, size: 10, delay: 750 },
];

function TwinklingStar({ rx, ry, size, delay }: { rx: number; ry: number; size: number; delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: native }),
          Animated.timing(scale, { toValue: 1.3, duration: 800, useNativeDriver: native }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: native }),
          Animated.timing(scale, { toValue: 0.8, duration: 800, useNativeDriver: native }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: width * rx - size / 2,
        top: height * ry - size / 2,
        opacity,
        transform: [{ scale }],
        zIndex: 0,
      }}
    >
      <Text style={{ fontSize: size, lineHeight: size + 4 }}>⭐</Text>
    </Animated.View>
  );
}

const BLOBS = [
  { rx: 0.0,  ry: 0.0,  w: 220, h: 220, colors: ["#7C3AED88", "#3B82F688"] as [string,string], delay: 0 },
  { rx: 0.55, ry: 0.0,  w: 180, h: 200, colors: ["#EC489988", "#F9731688"] as [string,string], delay: 400 },
  { rx: 0.0,  ry: 0.55, w: 200, h: 220, colors: ["#059669AA", "#3B82F688"] as [string,string], delay: 800 },
  { rx: 0.5,  ry: 0.6,  w: 240, h: 200, colors: ["#D9770688", "#A21CAFAA"] as [string,string], delay: 1200 },
];

function AnimatedBlob({ rx, ry, w, h, colors, delay }: typeof BLOBS[0]) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, { toValue: -18, duration: 3000, useNativeDriver: native }),
        Animated.timing(translateY, { toValue: 0, duration: 3000, useNativeDriver: native }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: width * rx - w * 0.3,
        top: height * ry - h * 0.3,
        width: w,
        height: h,
        borderRadius: w * 0.5,
        overflow: "hidden",
        zIndex: 0,
        transform: [{ translateY }],
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

type HubButton = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: Href;
  colors: [string, string];
  testID: string;
};

const HUB_BUTTONS: HubButton[] = [
  {
    label: "Games",
    icon: "game-controller",
    route: "/(tabs)/games",
    colors: ["#4F8EF7", "#2B5FD9"],
    testID: "hub-games-btn",
  },
  {
    label: "Garage",
    icon: "car-sport",
    route: "/(tabs)/garage",
    colors: ["#3ECF8E", "#1EA06B"],
    testID: "hub-garage-btn",
  },
  {
    label: "Badges",
    icon: "star",
    route: "/(tabs)/badges",
    colors: ["#F5A623", "#D4820A"],
    testID: "hub-badges-btn",
  },
  {
    label: "Sounds",
    icon: "volume-high",
    route: "/(tabs)/sounds",
    colors: ["#A855F7", "#7C3AED"],
    testID: "hub-sounds-btn",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

  const GRID_GAP = 12;
  const H_PAD = 16;
  const btnW = (width - H_PAD * 2 - GRID_GAP) / 2;
  const availableH = height - topPad - bottomPad - 72;
  const btnH = (availableH - GRID_GAP) / 2;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1B0B54", "#1A3399", "#0A5FA0"]}
        style={StyleSheet.absoluteFill}
      />

      {BLOBS.map((b, i) => <AnimatedBlob key={i} {...b} />)}

      {DOTS.map((d, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: width * d.rx - d.s / 2,
            top: height * d.ry - d.s / 2,
            width: d.s,
            height: d.s,
            borderRadius: d.s / 2,
            backgroundColor: d.c + "66",
            zIndex: 0,
          }}
        />
      ))}

      {STARS.map((s, i) => <TwinklingStar key={i} {...s} />)}

      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: H_PAD }]}>
        <View style={styles.header}>
          <Pressable onPress={handleHiddenTap} testID="settings-btn" style={styles.titleWrap}>
            <Text style={styles.appTitle}>Go Buddy Go</Text>
            <Text style={styles.appSubtitle}>⭐ CO-PILOT MODE ⭐</Text>
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
            <Pressable
              key={btn.label}
              testID={btn.testID}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(btn.route);
              }}
              style={({ pressed }) => [
                styles.hubButtonWrap,
                { width: btnW, height: btnH },
                pressed && styles.hubButtonPressed,
              ]}
            >
              <LinearGradient
                colors={btn.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hubButton}
              >
                <View style={styles.hubIconCircle}>
                  <Ionicons name={btn.icon} size={52} color="#FFFFFF" />
                </View>
                <Text style={styles.hubButtonLabel}>{btn.label}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B0B54",
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
  appSubtitle: {
    color: "#FFD93D",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 2,
  },
  hubGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  hubButtonWrap: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 12,
  },
  hubButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  hubButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    borderRadius: 28,
  },
  hubIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  hubButtonLabel: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
});
