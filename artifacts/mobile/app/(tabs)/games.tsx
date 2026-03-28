import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MissionCard from "@/components/MissionCard";
import { Colors } from "@/constants/colors";
import { useApp, SessionMission } from "@/context/AppContext";

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: {
  level: Difficulty;
  label: string;
  tagline: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  glowColor: string;
}[] = [
  {
    level: "easy",
    label: "EASY",
    tagline: "Fun for everyone!",
    icon: "star",
    gradientColors: ["#3ECF8E", "#2DB87A"],
    glowColor: "#3ECF8E",
  },
  {
    level: "medium",
    label: "MEDIUM",
    tagline: "A bit more challenging",
    icon: "flash",
    gradientColors: ["#F5C518", "#D4A800"],
    glowColor: "#F5C518",
  },
  {
    level: "hard",
    label: "HARD",
    tagline: "For the bravest co-pilots!",
    icon: "flame",
    gradientColors: ["#F4633A", "#D94E28"],
    glowColor: "#F4633A",
  },
];

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { missions, settings } = useApp();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handleSelectDifficulty = (level: Difficulty) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDifficulty(level);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDifficulty(null);
  };

  const handlePlay = useCallback((missionId: string) => {
    router.push({ pathname: "/ar", params: { missionId } });
  }, []);

  if (selectedDifficulty === null) {
    return (
      <LinearGradient
        colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
        style={styles.container}
      >
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <View style={styles.headerRow}>
            <Ionicons name="game-controller" size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>GAME MODES</Text>
          </View>
          <Text style={styles.headerSub}>Choose your difficulty level</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.pickerList, { paddingBottom: bottomPad + 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {DIFFICULTY_CONFIG.map((config) => (
            <Pressable
              key={config.level}
              onPress={() => handleSelectDifficulty(config.level)}
              style={({ pressed }) => [
                styles.difficultyCard,
                pressed && styles.difficultyCardPressed,
              ]}
            >
              <LinearGradient
                colors={config.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.difficultyCardGradient}
              >
                <View style={styles.difficultyIconCircle}>
                  <Ionicons name={config.icon} size={38} color="#FFFFFF" />
                </View>
                <View style={styles.difficultyCardContent}>
                  <Text style={styles.difficultyLabel}>{config.label}</Text>
                  <Text style={styles.difficultyTagline}>{config.tagline}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  }

  const config = DIFFICULTY_CONFIG.find((c) => c.level === selectedDifficulty)!;

  const filteredMissions: SessionMission[] = missions
    .filter((m) => m.enabled && settings.enabledMissionIds.includes(m.id))
    .filter((m) => m.difficulty === selectedDifficulty)
    .map((m) => ({ ...m, completed: false }));

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={Colors.text} />
          </Pressable>
          <Ionicons name={config.icon} size={22} color={config.gradientColors[0]} />
          <Text style={[styles.headerTitle, { color: config.gradientColors[0] }]}>
            {config.label}
          </Text>
        </View>
        <Text style={styles.headerSub}>{config.tagline}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredMissions.length > 0 ? (
          filteredMissions.map((mission, i) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              index={i}
              onPlay={handlePlay}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconCircle, { borderColor: config.gradientColors[0] + "44", backgroundColor: config.gradientColors[0] + "11" }]}>
              <Ionicons name="time-outline" size={48} color={config.gradientColors[0]} />
            </View>
            <Text style={styles.emptyTitle}>COMING SOON</Text>
            <Text style={styles.emptySubtitle}>
              {config.label} games are on their way! Check back for new adventures.
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  backBtn: {
    marginRight: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
    marginLeft: 36,
  },
  pickerList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 16,
  },
  difficultyCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  difficultyCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  difficultyCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 16,
    borderRadius: 24,
  },
  difficultyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  difficultyCardContent: {
    flex: 1,
    gap: 4,
  },
  difficultyLabel: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
  difficultyTagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
