import * as Haptics from "expo-haptics";
import { useAudioPlayer } from "expo-audio";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";
import { useTextScale } from "@/hooks/useTextScale";

function HomeButton({ bottomOffset, language }: { bottomOffset: number; language: "english" | "spanish" }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace("/");
      }}
      style={({ pressed }) => [
        homeBtnStyles.homeBtn,
        { bottom: bottomOffset },
        pressed && homeBtnStyles.homeBtnPressed,
      ]}
      testID="home-btn-sounds"
    >
      <LinearGradient
        colors={["#F4633A", "#C13E20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={homeBtnStyles.homeBtnGradient}
      >
        <Ionicons name="home" size={28} color="#FFFFFF" />
        <Text style={homeBtnStyles.homeBtnText}>{t("HOME", language)}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const homeBtnStyles = StyleSheet.create({
  homeBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 50,
    overflow: "hidden",
    zIndex: 100,
  },
  homeBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  homeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  homeBtnText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 3,
  },
});

const native = Platform.OS !== "web";

const SOUND_SOURCES = {
  vroom:   require("../../assets/sounds/vroom-engine.mp3"),
  beep:    require("../../assets/sounds/car-horn.mp3"),
  siren:   require("../../assets/sounds/siren.mp3"),
  zoom:    require("../../assets/sounds/zoom.mp3"),
  screech: require("../../assets/sounds/screech.mp3"),
  rev:     require("../../assets/sounds/rev-engine.mp3"),
  crash:   require("../../assets/sounds/key-beep.mp3"),
  thunk:   require("../../assets/sounds/whoosh.mp3"),
  win:     require("../../assets/sounds/win.wav"),
  rumble:  require("../../assets/sounds/thump.mp3"),
  honk:    require("../../assets/sounds/honk.mp3"),
  race:    require("../../assets/sounds/go.mp3"),
} as const;

type SoundId = keyof typeof SOUND_SOURCES;

type SoundButton = {
  id: SoundId;
  emoji: string;
  label: string;
  sublabel: string;
  gradient: [string, string];
};

const SOUNDS: SoundButton[] = [
  { id: "vroom",   emoji: "🚗",  label: "VROOM!",    sublabel: "Engine roar",   gradient: ["#F4633A", "#D94E28"] },
  { id: "beep",    emoji: "📯",  label: "BEEP BEEP", sublabel: "Car horn",      gradient: ["#FFD93D", "#F5A623"] },
  { id: "siren",   emoji: "🚨",  label: "WEEOO!",    sublabel: "Police siren",  gradient: ["#EF4444", "#B91C1C"] },
  { id: "zoom",    emoji: "💨",  label: "ZOOM!",     sublabel: "Speed burst",   gradient: ["#38BDF8", "#0284C7"] },
  { id: "screech", emoji: "🛑",  label: "SCREECH!",  sublabel: "Hard brakes",   gradient: ["#A855F7", "#7C3AED"] },
  { id: "rev",     emoji: "🏎️",  label: "REV IT!",   sublabel: "Engine rev",    gradient: ["#3ECF8E", "#15803D"] },
  { id: "crash",   emoji: "🔑",  label: "KEY BEEP",  sublabel: "Unlock chirp",  gradient: ["#FB923C", "#C2410C"] },
  { id: "thunk",   emoji: "🚙",  label: "WHOOSH",    sublabel: "Car pass by",   gradient: ["#4F8EF7", "#1D4ED8"] },
  { id: "rumble",  emoji: "🔧",  label: "THUMP",     sublabel: "Rough road",    gradient: ["#C084FC", "#9333EA"] },
  { id: "honk",    emoji: "🚛",  label: "HONK!",     sublabel: "Big truck",     gradient: ["#34D399", "#059669"] },
  { id: "race",    emoji: "🏁",  label: "GO",        sublabel: "Race start",    gradient: ["#F472B6", "#BE185D"] },
  { id: "win",     emoji: "🏆",  label: "WINNER!",   sublabel: "Victory cheer", gradient: ["#F59E0B", "#B45309"] },
];

const CAPPED_SOUNDS: Partial<Record<SoundId, number>> = {
  siren: 3000,
  vroom: 5000,
};

function SoundPad({ btn, soundsEnabled, cell }: { btn: SoundButton; soundsEnabled: boolean; cell: number }) {
  const textScale = useTextScale();
  const scale = useRef(new Animated.Value(1)).current;
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flash, setFlash] = useState(false);
  const player = useAudioPlayer(SOUND_SOURCES[btn.id]);

  useEffect(() => {
    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };
  }, []);

  const handlePress = () => {
    if (soundsEnabled) {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      player.seekTo(0);
      player.play();

      const capMs = CAPPED_SOUNDS[btn.id];
      if (capMs) {
        stopTimerRef.current = setTimeout(() => {
          player.pause();
          player.seekTo(0);
          stopTimerRef.current = null;
        }, capMs);
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 65, useNativeDriver: native }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 220, useNativeDriver: native }),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress} style={styles.padWrap}>
      <Animated.View style={{ transform: [{ scale }], borderRadius: cell / 2, overflow: "hidden" }}>
        <LinearGradient
          colors={flash ? ["#FFFFFF", "#F0F0F0"] : btn.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pad, { width: cell, height: cell, borderRadius: cell / 2 }]}
        >
          <Text style={[styles.padEmoji, { fontSize: cell * 0.32, lineHeight: cell * 0.38 }]}>{btn.emoji}</Text>
          <Text style={[styles.padLabel, { fontSize: 11 * textScale }, flash && { color: btn.gradient[0] }]}>{btn.label}</Text>
          <Text style={[styles.padSublabel, { fontSize: 9 * textScale }, flash && { color: btn.gradient[1] + "BB" }]}>{btn.sublabel}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

export default function SoundsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { settings } = useApp();
  const language = settings.language;
  const textScale = useTextScale();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const homeBtnBottom = insets.bottom + 24;
  const soundsEnabled = settings.soundsEnabled ?? true;

  const COLS = width > 600 ? 4 : 3;
  const H_PAD = width > 600 ? 20 : 16;
  const GAP = 10;
  const CELL = Math.min((width - H_PAD * 2 - GAP * (COLS - 1)) / COLS, 130);

  return (
    <AppBackground>
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: 20 }]}>
        <Ionicons name="volume-high" size={26} color="rgba(255,255,255,0.8)" />
        <Text style={[styles.headerTitle, { fontSize: 32 * textScale }]}>{t("SOUNDS", language)}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.grid, { paddingBottom: homeBtnBottom + 76, paddingHorizontal: H_PAD, gap: GAP }]}
        showsVerticalScrollIndicator={false}
      >
        {SOUNDS.map((btn) => (
          <SoundPad
            key={btn.id}
            btn={{ ...btn, label: t(btn.label, language), sublabel: t(btn.sublabel, language) }}
            soundsEnabled={soundsEnabled}
            cell={CELL}
          />
        ))}
      </ScrollView>

      <HomeButton bottomOffset={homeBtnBottom} language={language} />
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
    paddingBottom: 8,
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 3,
  },
  headerSub: {
    color: "#FFD93D",
    fontSize: 14,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  padWrap: {
  },
  pad: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
  },
  padEmoji: {
    fontSize: 28,
    lineHeight: 34,
  },
  padLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  padSublabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontFamily: "BalsamiqSans_400Regular",
    textAlign: "center",
  },
});
