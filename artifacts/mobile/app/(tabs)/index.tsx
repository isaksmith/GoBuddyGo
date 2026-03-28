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

function FloatingOrb({
  icon,
  color,
  size,
  startX,
  startY,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  startX: number;
  startY: number;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== "web";

  useEffect(() => {
    const driftX = (Math.random() - 0.5) * 30;
    const driftY = 18 + Math.random() * 14;
    const dur = 2200 + Math.random() * 1200;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, { toValue: -driftY, duration: dur, useNativeDriver: native }),
            Animated.timing(translateY, { toValue: 0, duration: dur, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, { toValue: driftX, duration: dur, useNativeDriver: native }),
            Animated.timing(translateX, { toValue: 0, duration: dur, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: dur * 0.5, useNativeDriver: native }),
            Animated.timing(opacity, { toValue: 0.5, duration: dur * 0.5, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.12, duration: dur, useNativeDriver: native }),
            Animated.timing(scale, { toValue: 1, duration: dur, useNativeDriver: native }),
          ]),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.orbCircle, { width: size, height: size, borderRadius: size / 2, borderColor: color + "60", backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={size * 0.46} color={color} />
      </View>
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

  const orbConfigs = [
    { icon: "star" as const, color: Colors.secondary, size: 56, startX: width * 0.04, startY: height * 0.04, delay: 0 },
    { icon: "shield-checkmark" as const, color: Colors.primary, size: 50, startX: width * 0.74, startY: height * 0.04, delay: 400 },
    { icon: "rocket" as const, color: Colors.accentBlue, size: 40, startX: width * 0.04, startY: height * 0.55, delay: 700 },
    { icon: "star" as const, color: Colors.accent, size: 38, startX: width * 0.80, startY: height * 0.48, delay: 200 },
    { icon: "flash" as const, color: Colors.secondary, size: 34, startX: width * 0.50, startY: height * 0.72, delay: 900 },
  ];

  const GRID_GAP = 12;
  const H_PAD = 16;
  const btnW = (width - H_PAD * 2 - GRID_GAP) / 2;
  const availableH = height - topPad - bottomPad - 72;
  const btnH = (availableH - GRID_GAP) / 2;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      {orbConfigs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}

      <View style={[styles.inner, { paddingTop: topPad, paddingBottom: bottomPad, paddingHorizontal: H_PAD }]}>
        <View style={styles.header}>
          <Pressable onPress={handleHiddenTap} testID="settings-btn" style={styles.titleWrap}>
            <Text style={styles.appTitle}>Go Buddy Go</Text>
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
            <Ionicons name="settings-outline" size={26} color={Colors.textMuted} />
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbContainer: {
    position: "absolute",
    zIndex: 0,
  },
  orbCircle: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  inner: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  titleWrap: {
    flex: 1,
  },
  settingsCog: {
    padding: 4,
    marginLeft: 8,
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
  appTitle: {
    color: Colors.text,
    fontSize: 44,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    textShadowColor: Colors.primary + "AA",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
});
