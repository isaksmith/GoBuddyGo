import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MissionCard from "@/components/MissionCard";
import { Colors } from "@/constants/colors";
import { useApp, SessionMission } from "@/context/AppContext";

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { missions, settings } = useApp();

  const availableMissions: SessionMission[] = missions
    .filter((m) => m.enabled && settings.enabledMissionIds.includes(m.id))
    .filter((m) =>
      settings.difficulty === "all"
        ? true
        : m.difficulty === settings.difficulty || m.difficulty === "easy"
    )
    .map((m) => ({ ...m, completed: false }));

  const handlePlay = useCallback((missionId: string) => {
    router.push({ pathname: "/ar", params: { missionId } });
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

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
        <Text style={styles.headerSub}>Choose a game to play in AR</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {availableMissions.map((mission, i) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            index={i}
            onPlay={handlePlay}
          />
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
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
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});
