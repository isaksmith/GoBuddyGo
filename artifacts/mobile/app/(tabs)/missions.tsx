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
  const { sessionMissions, completeMission, sessionActive, endSession } = useApp();
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
  const pct = total > 0 ? (completed / total) * 100 : 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  if (!sessionActive) {
    return (
      <LinearGradient
        colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
        style={styles.container}
      >
        <View style={[styles.emptyState, { paddingTop: topPad + 40 }]}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="rocket-outline" size={52} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>NO ACTIVE MISSION</Text>
          <Text style={styles.emptySubtitle}>
            Head to Home and tap START MISSION to begin your adventure!
          </Text>
          <Pressable onPress={() => router.push("/")} style={styles.goHomeBtn}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.goHomeBtnGradient}
            >
              <Ionicons name="home" size={20} color="#FFFFFF" />
              <Text style={styles.goHomeBtnText}>GO TO HOME</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>MISSIONS</Text>
            <Text style={styles.headerSub}>
              {completed}/{total} COMPLETE
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/ar")}
            style={styles.arBtn}
            testID="open-ar-btn"
          >
            <LinearGradient
              colors={[Colors.accentBlue, "#2196F3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.arBtnGradient}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.arBtnText}>AR VIEW</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
          <Text style={styles.progressLabel}>{Math.round(pct)}%</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 110 }]}
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

        <Pressable
          onPress={handleEndSession}
          style={styles.endButton}
          testID="end-session-btn"
        >
          <LinearGradient
            colors={[Colors.danger, "#C03060"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.endButtonGradient}
          >
            <Ionicons name="flag" size={20} color="#FFFFFF" />
            <Text style={styles.endButtonText}>END SESSION</Text>
          </LinearGradient>
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
    gap: 14,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginTop: 4,
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
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  goHomeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  goHomeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    marginTop: 2,
  },
  arBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  arBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 50,
  },
  arBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  progressTrack: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    marginBottom: 18,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 7,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  progressLabel: {
    position: "absolute",
    right: 8,
    color: Colors.text,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  endButton: {
    marginTop: 16,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  endButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  endButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
});
