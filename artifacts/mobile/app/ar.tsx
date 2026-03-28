import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { SparkleEffect } from "@/components/AROverlay";
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
  const {
    missions,
    sessionMissions,
    completeMission,
    sessionActive,
    startSession,
    endSession,
    settings,
    sessionStartTime,
    isLoaded,
  } = useApp();
  const [celebratingTitle, setCelebratingTitle] = useState<string | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
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
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

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
      <LinearGradient
        colors={[Colors.background, Colors.backgroundMid]}
        style={styles.center}
      >
        <View style={styles.permIconCircle}>
          <Ionicons name="camera" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.permTitle}>CAMERA NEEDED!</Text>
        <Text style={styles.permSubtitle}>
          The AR Co-Pilot view uses your camera to overlay mission graphics
        </Text>
        <Pressable onPress={requestPermission} style={styles.permBtn}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.permBtnGradient}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.permBtnText}>ENABLE CAMERA</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.backLinkBtn}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </LinearGradient>
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
        <View pointerEvents="box-none">
          <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
            <Pressable onPress={() => router.back()} style={styles.backCircle}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.hudCenter}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
              </View>
              <Text style={styles.hudProgressText}>
                {completed}/{total} MISSIONS
              </Text>
            </View>

            {timeLeft !== null && (
              <View style={[styles.timerPill, timeLeft <= 60 && styles.timerPillWarning]}>
                <Ionicons
                  name="time"
                  size={13}
                  color={timeLeft <= 60 ? Colors.secondary : "#FFFFFF"}
                />
                <Text style={[styles.timerText, timeLeft <= 60 && styles.timerTextWarning]}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </Text>
              </View>
            )}
          </View>

          {timeUp && !allDone && (
            <View style={styles.timeUpBanner}>
              <Ionicons name="alarm" size={20} color={Colors.secondary} />
              <Text style={styles.timeUpText}>⏰ TIME'S UP! FINISH UP!</Text>
            </View>
          )}

          {currentMission && (
            <Animated.View style={[styles.missionOverlay, pulseStyle]}>
              <View style={styles.missionBadge}>
                <Ionicons name="rocket" size={16} color={Colors.secondary} />
                <Text style={styles.missionBadgeTitle}>ACTIVE MISSION</Text>
              </View>
              <Text style={styles.missionTitle}>{currentMission.title.toUpperCase()}</Text>
              <Text style={styles.missionDesc}>{currentMission.description}</Text>
            </Animated.View>
          )}
        </View>

        <ProximityWarning visible={proximityWarning} />

        {currentMission && (
          <View style={[styles.completeArea, { paddingBottom: insets.bottom + 20 }]}>
            <Pressable
              onPress={handleCompleteMission}
              style={styles.completeBtn}
              testID="complete-mission-btn"
            >
              <LinearGradient
                colors={[Colors.accent, "#2DB87A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeBtnGradient}
              >
                <Ionicons name="checkmark-circle" size={30} color="#FFFFFF" />
                <Text style={styles.completeBtnText}>MISSION DONE! ✓</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {allDone && (
          <View style={[styles.completeArea, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.allDoneBadge}>
              <Ionicons name="trophy" size={26} color={Colors.secondary} />
              <Text style={styles.allDoneText}>ALL DONE! AMAZING! 🎉</Text>
            </View>
            <Pressable
              onPress={handleGoToSummary}
              style={styles.summaryBtn}
              testID="see-summary-btn"
            >
              <LinearGradient
                colors={[Colors.secondary, "#D4A800"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.summaryBtnGradient}
              >
                <Ionicons name="star" size={22} color="#FFFFFF" />
                <Text style={styles.summaryBtnText}>SEE RESULTS!</Text>
              </LinearGradient>
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
    gap: 16,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
  },
  permIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 6,
  },
  permTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 4,
  },
  permSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  permBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  permBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 50,
  },
  permBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  backLinkBtn: {
    paddingVertical: 8,
  },
  backLinkText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  webCameraFallback: {
    backgroundColor: "#081520",
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
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  hudCenter: {
    flex: 1,
    gap: 4,
    alignItems: "center",
  },
  progressBarTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 5,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  hudProgressText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  timerPill: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    flexShrink: 0,
  },
  timerPillWarning: {
    borderColor: Colors.secondary,
    backgroundColor: "rgba(244, 99, 58, 0.45)",
  },
  timerText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },
  timerTextWarning: {
    color: Colors.secondary,
  },
  timeUpBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(244, 99, 58, 0.92)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
    marginHorizontal: 20,
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  timeUpText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  missionOverlay: {
    marginHorizontal: 16,
    backgroundColor: "rgba(9, 25, 42, 0.90)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  missionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  missionBadgeTitle: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2.5,
  },
  missionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  missionDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    lineHeight: 21,
  },
  completeArea: {
    paddingHorizontal: 16,
    gap: 10,
  },
  completeBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 16,
    elevation: 12,
  },
  completeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  completeBtnText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  allDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(245, 197, 24, 0.18)",
    borderRadius: 50,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  allDoneText: {
    color: Colors.secondary,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  summaryBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
  },
  summaryBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 50,
  },
  summaryBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
});
