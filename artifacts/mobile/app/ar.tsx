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
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { MissionShield, SparkleEffect, SpeedStar } from "@/components/AROverlay";
import { ProximityWarning } from "@/components/ProximityWarning";
import { Colors } from "@/constants/colors";
import { useApp, countAvailableSessionMissions } from "@/context/AppContext";

type AccelerometerData = { x: number; y: number; z: number };
type AccelerometerSubscription = { remove: () => void };

function useAccelerometerProxy() {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let sub: AccelerometerSubscription | null = null;

    (async () => {
      try {
        const sensors = await import("expo-sensors");
        const { Accelerometer } = sensors;
        Accelerometer.setUpdateInterval(200);
        let lastMag = 0;

        sub = Accelerometer.addListener((data: AccelerometerData) => {
          const mag = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
          const delta = Math.abs(mag - lastMag);
          lastMag = mag;
          if (delta > 2.5) {
            setShaking(true);
            setTimeout(() => setShaking(false), 2000);
          }
        });
      } catch (e) {
        console.warn("[AR] Accelerometer unavailable:", e);
      }
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
  const { missions, sessionMissions, completeMission, sessionActive, startSession, endSession, settings, sessionStartTime, isLoaded } = useApp();
  const [celebratingTitle, setCelebratingTitle] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);
  const proximityWarning = useAccelerometerProxy();
  const isNavigating = useRef(false);
  const hasAutoStarted = useRef(false);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!isLoaded) return;
    if (!permission?.granted) return;
    const available = countAvailableSessionMissions(missions, settings);
    if (available < 3) {
      router.replace("/");
      return;
    }
    if (!sessionActive && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startSession().catch((e) => console.warn("[AR] startSession failed:", e));
    }
  }, [isLoaded, permission?.granted, sessionActive, missions, settings, startSession]);

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
    const interval = setInterval(() => {
      setSpeed(Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sessionStartTime || !settings.sessionDurationMinutes) return;
    const totalSeconds = settings.sessionDurationMinutes * 60;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
      const remaining = totalSeconds - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        setTimeUp(true);
      } else {
        setTimeLeft(remaining);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionStartTime, settings.sessionDurationMinutes]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const currentMission = sessionMissions.find((m) => !m.completed);
  const completed = sessionMissions.filter((m) => m.completed).length;
  const total = sessionMissions.length;
  const allDone = !currentMission && total > 0;

  const handleCompleteMission = () => {
    if (!currentMission) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeMission(currentMission.id);
    setCelebratingTitle(currentMission.title);
    setCelebrationVisible(true);
  };

  const handleGoToSummary = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    await endSession();
    router.push("/summary");
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
          {timeLeft !== null && (
            <View style={[styles.timerPill, timeLeft <= 60 && styles.timerPillWarning]}>
              <Ionicons name="time-outline" size={13} color={timeLeft <= 60 ? Colors.secondary : "#FFFFFF"} />
              <Text style={[styles.timerText, timeLeft <= 60 && styles.timerTextWarning]}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </Text>
            </View>
          )}
        </View>

        {timeUp && !allDone && (
          <View style={styles.timeUpBanner}>
            <Ionicons name="alarm-outline" size={20} color={Colors.secondary} />
            <Text style={styles.timeUpText}>Time's Up! Wrap up your mission</Text>
          </View>
        )}

        <MissionShield
          visible={!!currentMission}
          label={currentMission ? currentMission.title : ""}
        />

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

        {allDone && (
          <View style={[styles.completeArea, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.allDoneBadge}>
              <Ionicons name="trophy" size={24} color={Colors.secondary} />
              <Text style={styles.allDoneText}>All Missions Complete!</Text>
            </View>
            <Pressable
              onPress={handleGoToSummary}
              style={styles.summaryBtn}
              testID="see-summary-btn"
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
  timerPill: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  timerPillWarning: {
    borderColor: Colors.secondary,
    backgroundColor: "rgba(255,107,43,0.3)",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },
  timerTextWarning: {
    color: Colors.secondary,
  },
  timeUpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,107,43,0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    justifyContent: "center",
  },
  timeUpText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
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
