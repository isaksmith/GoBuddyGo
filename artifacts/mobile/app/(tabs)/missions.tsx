import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import MissionCard from "@/components/MissionCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function MissionsScreen() {
  const insets = useSafeAreaInsets();
  const { sessionMissions, completeMission, sessionActive, endSession, startSession } = useApp();
  const [celebratingMission, setCelebratingMission] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const handleComplete = (id: string) => {
    if (!sessionActive) return;
    completeMission(id);
    const mission = sessionMissions.find((m) => m.id === id);
    if (mission) {
      setCelebratingMission(mission.title);
      setCelebrationVisible(true);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEndSession = async () => {
    await endSession();
    router.push("/summary");
  };

  const completed = sessionMissions.filter((m) => m.completed).length;
  const total = sessionMissions.length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  if (!sessionActive) {
    return (
      <LinearGradient
        colors={[Colors.background, Colors.backgroundMid]}
        style={styles.container}
      >
        <View style={[styles.emptyState, { paddingTop: topPad + 40 }]}>
          <Ionicons name="list" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No Active Session</Text>
          <Text style={styles.emptySubtitle}>
            Start a session from the Home tab to see your missions here
          </Text>
          <Pressable onPress={() => router.push("/")} style={styles.goHomeBtn}>
            <Text style={styles.goHomeBtnText}>Go to Home</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View>
          <Text style={styles.headerTitle}>Missions</Text>
          <Text style={styles.headerSub}>{completed}/{total} Complete</Text>
        </View>
        <Pressable onPress={() => router.push("/ar")} style={styles.arBtn} testID="open-ar-btn">
          <Ionicons name="camera" size={20} color={Colors.primary} />
          <Text style={styles.arBtnText}>AR View</Text>
        </Pressable>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${total > 0 ? (completed / total) * 100 : 0}%` as any },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {sessionMissions.map((mission, i) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onComplete={handleComplete}
            index={i}
          />
        ))}

        <Pressable onPress={handleEndSession} style={styles.endButton} testID="end-session-btn">
          <Ionicons name="flag" size={20} color={Colors.danger} />
          <Text style={styles.endButtonText}>End Session</Text>
        </Pressable>
      </ScrollView>

      <CelebrationOverlay
        visible={celebrationVisible}
        missionTitle={celebratingMission ?? ""}
        onHide={() => setCelebrationVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  goHomeBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  goHomeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
  },
  headerSub: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  arBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  arBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  list: {
    paddingHorizontal: 20,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.danger,
    backgroundColor: "rgba(239, 71, 111, 0.08)",
  },
  endButtonText: {
    color: Colors.danger,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
