import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { MissionShield, SparkleEffect, SpeedStar } from "@/components/AROverlay";
import { ProximityWarning } from "@/components/ProximityWarning";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

function useAccelerometerProxy() {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let Accelerometer: any;
    let sub: any;

    (async () => {
      try {
        const sensors = await import("expo-sensors");
        Accelerometer = sensors.Accelerometer;
        Accelerometer.setUpdateInterval(200);
        let lastMag = 0;

        sub = Accelerometer.addListener((data: { x: number; y: number; z: number }) => {
          const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
          const delta = Math.abs(mag - lastMag);
          lastMag = mag;
          if (delta > 2.5) {
            setShaking(true);
            setTimeout(() => setShaking(false), 2000);
          }
        });
      } catch (_e) {}
    })();

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  return shaking;
}

export default function ARScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { sessionMissions, completeMission, sessionActive, startSession } = useApp();
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [celebratingTitle, setCelebratingTitle] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [speed, setSpeed] = useState(0);
  const proximityWarning = useAccelerometerProxy();

  const pulseScale = useSharedValue(1);
  const shieldOpacity = useSharedValue(0);

  useEffect(() => {
    if (!sessionActive) {
      startSession();
    }
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    shieldOpacity.value = withSpring(
      sessionMissions.length > 0 ? 1 : 0,
      { mass: 0.5, stiffness: 120 }
    );
  }, [sessionMissions.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const currentMission = sessionMissions.find((m) => !m.completed);

  const handleCompleteMission = () => {
    if (!currentMission) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeMission(currentMission.id);
    setCelebratingTitle(currentMission.title);
    setCelebrationVisible(true);
  };

  if (!permission) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.background }]}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.background }]}>
        <Ionicons name="camera-reverse-outline" size={60} color={Colors.textMuted} />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permSubtitle}>
          The AR Co-Pilot view uses your camera to overlay mission graphics
        </Text>
        <Pressable onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Enable Camera</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const completed = sessionMissions.filter((m) => m.completed).length;
  const total = sessionMissions.length;

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webCameraFallback]}>
          <Ionicons name="camera" size={80} color={Colors.border} />
          <Text style={styles.webFallbackText}>Camera view on device</Text>
        </View>
      )}

      <View
        style={[StyleSheet.absoluteFill, styles.overlay]}
        pointerEvents="box-none"
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backCircle}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>{completed}/{total} Missions</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        {currentMission && (
          <Animated.View style={[styles.missionOverlay, pulseStyle]}>
            <View style={styles.missionBadge}>
              <Ionicons name="rocket" size={20} color={Colors.secondary} />
              <Text style={styles.missionBadgeTitle}>ACTIVE MISSION</Text>
            </View>
            <Text style={styles.missionTitle}>{currentMission.title}</Text>
            <Text style={styles.missionDesc}>{currentMission.description}</Text>
          </Animated.View>
        )}

        <SpeedStar speed={speed} />

        <ProximityWarning visible={proximityWarning} />

        {currentMission && (
          <View style={[styles.completeArea, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              onPress={handleCompleteMission}
              style={styles.completeBtn}
              testID="complete-mission-btn"
            >
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
              <Text style={styles.completeBtnText}>Mission Done!</Text>
            </Pressable>
          </View>
        )}

        {!currentMission && total > 0 && (
          <View style={[styles.completeArea, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.allDoneBadge}>
              <Ionicons name="trophy" size={24} color={Colors.secondary} />
              <Text style={styles.allDoneText}>All Missions Complete!</Text>
            </View>
            <Pressable
              onPress={() => router.push("/summary")}
              style={styles.summaryBtn}
            >
              <Text style={styles.summaryBtnText}>See Summary</Text>
            </Pressable>
          </View>
        )}

        <SparkleEffect active={!!currentMission} />

        <CelebrationOverlay
          visible={celebrationVisible}
          missionTitle={celebratingTitle ?? ""}
          onHide={() => setCelebrationVisible(false)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  permTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginTop: 8,
  },
  permSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  permBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
  },
  backBtn: {
    paddingVertical: 8,
  },
  backBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  webCameraFallback: {
    backgroundColor: "#0A1520",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  webFallbackText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  overlay: {
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPill: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  missionOverlay: {
    marginHorizontal: 20,
    backgroundColor: "rgba(13, 27, 42, 0.88)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  missionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  missionBadgeTitle: {
    color: Colors.secondary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  missionTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    marginBottom: 6,
  },
  missionDesc: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    lineHeight: 22,
  },
  completeArea: {
    paddingHorizontal: 20,
    gap: 12,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
  },
  allDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 209, 102, 0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  allDoneText: {
    color: Colors.secondary,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
  },
  summaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  summaryBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
  },
});
