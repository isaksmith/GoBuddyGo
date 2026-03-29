import * as Haptics from "expo-haptics";
import { router, type Href } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RaceBackground } from "@/components/RaceBackground";
import { useTextScale } from "@/hooks/useTextScale";

type HubButton = {
  label: string;
  emoji: string;
  route: Href;
  bg: string;
  shadowColor: string;
  testID: string;
  animDelay: number;
};

const HUB_BUTTONS: HubButton[] = [
  {
    label: "GAMES",
    emoji: "🎮",
    route: "/(tabs)/games",
    bg: "#3a86ff",
    shadowColor: "#1c4e9e",
    testID: "hub-games-btn",
    animDelay: 100,
  },
  {
    label: "GARAGE",
    emoji: "🚗",
    route: "/(tabs)/garage",
    bg: "#06d6a0",
    shadowColor: "#038c6a",
    testID: "hub-garage-btn",
    animDelay: 180,
  },
  {
    label: "BADGES",
    emoji: "🏆",
    route: "/(tabs)/badges",
    bg: "#ff9f1c",
    shadowColor: "#b86200",
    testID: "hub-badges-btn",
    animDelay: 260,
  },
  {
    label: "SOUNDS",
    emoji: "🔊",
    route: "/(tabs)/sounds",
    bg: "#c77dff",
    shadowColor: "#7a3db5",
    testID: "hub-sounds-btn",
    animDelay: 340,
  },
];

function CardEntrance({ delay, children, isTablet }: { delay: number; children: React.ReactNode; isTablet: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(anim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const isWeb = Platform.OS === "web";
  const flexBasis = isTablet || isWeb ? "46%" : "47%";
  const maxWidth = isTablet || isWeb ? "46%" : "48%";
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY }, { scale }], flexBasis, maxWidth, flexGrow: 1 }}>
      {children}
    </Animated.View>
  );
}

function HubCard({ btn, isTablet }: { btn: HubButton; isTablet: boolean }) {
  const textScale = useTextScale();

  return (
    <CardEntrance delay={btn.animDelay} isTablet={isTablet}>
      <Pressable
        testID={btn.testID}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push(btn.route);
        }}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: btn.bg,
            shadowColor: btn.shadowColor,
          },
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardShine} />
        <View style={styles.cardInner}>
          <View style={styles.iconWrap}>
            <Text style={[styles.iconEmoji, { fontSize: 56 * textScale }]}>{btn.emoji}</Text>
          </View>
          <Text style={[styles.cardLabel, { fontSize: 20 * textScale }]}>{btn.label}</Text>
        </View>
        <View style={styles.cardChecker} />
      </Pressable>
    </CardEntrance>
  );
}

function FlagWave() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () =>
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(); });
    run();
  }, []);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["-2deg", "2deg"] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  return (
    <Animated.View style={{ transform: [{ rotate }, { translateY }] }}>
      <Text style={styles.decoRow}>🏁 🏆 🏁</Text>
    </Animated.View>
  );
}

function LapDot({ active }: { active: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const run = () =>
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) run(); });
    run();
  }, [active]);
  const opacity = active
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] })
    : 0.5;
  const scale = active
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.2] })
    : 1;
  return (
    <Animated.View
      style={[
        styles.lapDot,
        { opacity, transform: [{ scale: scale as any }] },
      ]}
    />
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const textScale = useTextScale();
  const isLandscape = width > height;
  const isTablet = width >= 768;
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
    <RaceBackground>
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
            <Text style={{ fontSize: 22, opacity: 0.75 }}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.titleSection}>
          <FlagWave />
          <Pressable onPress={handleHiddenTap} testID="settings-btn" style={styles.titleWrap}>
            <Text
              style={[styles.appTitle, { fontSize: (isLandscape ? 28 : 36) * textScale }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              GO <Text style={styles.appTitleAccent}>BUDDY</Text> GO
            </Text>
          </Pressable>
          <Text style={[styles.titleSub, { fontSize: 13 * textScale }]}>START YOUR ENGINES!</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hubGrid}>
            {HUB_BUTTONS.map((btn) => (
              <HubCard key={btn.label} btn={btn} isTablet={isTablet} />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.lapBar, { paddingBottom: bottomPad + 8 }]}>
          <LapDot active />
          <LapDot active={false} />
          <LapDot active={false} />
          <Text style={styles.lapText}>🏎️ On Your Mark</Text>
          <LapDot active={false} />
          <LapDot active={false} />
          <LapDot active />
        </View>
      </View>
    </RaceBackground>
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
    paddingBottom: 0,
  },
  settingsCog: {
    padding: 4,
  },
  titleSection: {
    alignItems: "center",
    paddingBottom: 20,
  },
  titleWrap: {
    alignItems: "center",
  },
  decoRow: {
    fontSize: 26,
    letterSpacing: 4,
    marginBottom: 4,
    textAlign: "center",
  },
  appTitle: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 36,
    lineHeight: 42,
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
    textShadowColor: "#aa2200",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  appTitleAccent: {
    color: "#ffd166",
  },
  titleSub: {
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginTop: 6,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  hubGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    aspectRatio: 1 / 1.05,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  cardPressed: {
    transform: [{ translateY: 5 }, { scale: 0.97 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  cardInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 18,
    gap: 10,
  },
  iconWrap: {
    width: 90,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  iconEmoji: {
    fontSize: 42,
  },
  cardLabel: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 20,
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardChecker: {
    height: 10,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  lapBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 8,
  },
  lapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffd166",
  },
  lapText: {
    fontSize: 12,
    fontFamily: "BalsamiqSans_700Bold",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
