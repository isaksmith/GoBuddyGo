import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

type SoundOption = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "mission_alerts",
    label: "Mission Alerts",
    description: "Sounds when a new mission starts",
    icon: "notifications",
    color: "#4F8EF7",
  },
  {
    id: "badge_fanfare",
    label: "Badge Fanfare",
    description: "Celebration when a badge is earned",
    icon: "star",
    color: "#F5A623",
  },
  {
    id: "button_taps",
    label: "Button Taps",
    description: "Click sounds for button presses",
    icon: "hand-left",
    color: "#3ECF8E",
  },
  {
    id: "session_complete",
    label: "Session Complete",
    description: "Sound when a ride session ends",
    icon: "checkmark-circle",
    color: "#A855F7",
  },
  {
    id: "countdown",
    label: "Countdown",
    description: "Countdown timer beeps",
    icon: "timer",
    color: "#F4633A",
  },
];

export default function SoundsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(SOUND_OPTIONS.map((s) => [s.id, true]))
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.replace("/")} style={styles.backBtn} hitSlop={12} testID="sounds-home-btn">
          <Ionicons name="arrow-back" size={26} color={Colors.text} />
        </Pressable>
        <Ionicons name="volume-high" size={24} color="#A855F7" />
        <Text style={styles.headerTitle}>Sounds</Text>
      </View>

      <View style={styles.list}>
        {SOUND_OPTIONS.map((opt) => (
          <View key={opt.id} style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: opt.color + "22", borderColor: opt.color + "55" }]}>
              <Ionicons name={opt.icon} size={22} color={opt.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{opt.label}</Text>
              <Text style={styles.rowDesc}>{opt.description}</Text>
            </View>
            <Switch
              value={enabled[opt.id]}
              onValueChange={(val) => setEnabled((prev) => ({ ...prev, [opt.id]: val }))}
              trackColor={{ false: Colors.border, true: opt.color + "99" }}
              thumbColor={enabled[opt.id] ? opt.color : Colors.textMuted}
            />
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: {
    marginRight: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowLabel: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },
  rowDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
});
