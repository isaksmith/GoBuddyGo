import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");
const COLS = 3;
const H_PAD = 16;
const GAP = 12;
const CELL = (width - H_PAD * 2 - GAP * (COLS - 1)) / COLS;

type SoundButton = {
  id: string;
  emoji: string;
  label: string;
  sublabel: string;
  gradient: [string, string];
  haptic: () => void;
};

function doVroom() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 90);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 180);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 280);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 380);
}

function doBeepBeep() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning), 350);
}

function doSiren() {
  for (let i = 0; i < 6; i++) {
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), i * 130);
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), i * 130 + 65);
  }
}

function doZoom() {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), i * 60);
  }
}

function doScreech() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 60);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 130);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 220);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 320);
}

function doRev() {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), i * 100);
  }
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 500);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 580);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 660);
}

function doCrash() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 50);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 220);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 350);
  setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 500);
}

function doWin() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 300);
  setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 600);
}

function doTrunk() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

function doRumble() {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => Haptics.impactAsync(
      i % 2 === 0 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium
    ), i * 80);
  }
}

const SOUNDS: SoundButton[] = [
  { id: "vroom",   emoji: "🚗",  label: "VROOM!",    sublabel: "Engine roar",   gradient: ["#F4633A", "#D94E28"], haptic: doVroom },
  { id: "beep",    emoji: "📯",  label: "BEEP BEEP", sublabel: "Car horn",      gradient: ["#FFD93D", "#F5A623"], haptic: doBeepBeep },
  { id: "siren",   emoji: "🚨",  label: "WEEOO!",    sublabel: "Police siren",  gradient: ["#EF4444", "#B91C1C"], haptic: doSiren },
  { id: "zoom",    emoji: "💨",  label: "ZOOM!",     sublabel: "Speed burst",   gradient: ["#38BDF8", "#0284C7"], haptic: doZoom },
  { id: "screech", emoji: "🛑",  label: "SCREECH!",  sublabel: "Hard brakes",   gradient: ["#A855F7", "#7C3AED"], haptic: doScreech },
  { id: "rev",     emoji: "🏎️",  label: "REV IT!",   sublabel: "Engine rev",    gradient: ["#3ECF8E", "#15803D"], haptic: doRev },
  { id: "crash",   emoji: "💥",  label: "CRASH!",    sublabel: "Bumper bang",   gradient: ["#FB923C", "#C2410C"], haptic: doCrash },
  { id: "trunk",   emoji: "🚙",  label: "THUNK!",    sublabel: "Car door",      gradient: ["#4F8EF7", "#1D4ED8"], haptic: doTrunk },
  { id: "win",     emoji: "🏆",  label: "WINNER!",   sublabel: "Victory cheer", gradient: ["#F59E0B", "#B45309"], haptic: doWin },
  { id: "rumble",  emoji: "🔧",  label: "RUMBLE!",   sublabel: "Rough road",    gradient: ["#C084FC", "#9333EA"], haptic: doRumble },
  { id: "truck",   emoji: "🚛",  label: "HONK!",     sublabel: "Big truck",     gradient: ["#34D399", "#059669"], haptic: doBeepBeep },
  { id: "race",    emoji: "🏁",  label: "GO GO GO!", sublabel: "Race start",    gradient: ["#F472B6", "#BE185D"], haptic: doVroom },
];

function SoundPad({ btn }: { btn: SoundButton }) {
  const scale = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== "web";
  const [flash, setFlash] = useState(false);

  const handlePress = () => {
    btn.haptic();
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: native }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: native }),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress} style={styles.padWrap}>
      <Animated.View style={{ transform: [{ scale }], borderRadius: CELL / 2, overflow: "hidden" }}>
        <LinearGradient
          colors={flash ? ["#FFFFFF", "#FFFFFF"] : btn.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pad, { width: CELL, height: CELL, borderRadius: CELL / 2 }]}
        >
          <Text style={styles.padEmoji}>{btn.emoji}</Text>
          <Text style={styles.padLabel}>{btn.label}</Text>
          <Text style={styles.padSublabel}>{btn.sublabel}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function SoundsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#1B0B54", "#1A3399", "#0A5FA0"]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>🚗 CAR SOUNDS 🚗</Text>
        <Text style={styles.headerSub}>Tap a button to make noise!</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: bottomPad + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {SOUNDS.map((btn) => (
          <SoundPad key={btn.id} btn={btn} />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "#FF6B9D",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  headerSub: {
    color: "#FFD93D",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: H_PAD,
    gap: GAP,
  },
  padWrap: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  pad: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  padEmoji: {
    fontSize: CELL * 0.32,
    lineHeight: CELL * 0.38,
  },
  padLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  padSublabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
});
