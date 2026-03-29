import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";

type LightState = "off" | "red" | "yellow" | "green";
type GameState = "idle" | "countdown" | "go" | "done";

function StopLight({ state }: { state: LightState }) {
  const redOn = state === "red" || state === "yellow" || state === "green";
  const yellowOn = state === "yellow" || state === "green";
  const greenOn = state === "green";

  return (
    <View style={styles.stoplightPole}>
      <View style={styles.stoplightBox}>
        <View style={[styles.light, styles.lightRed, redOn && styles.lightRedOn]} />
        <View style={[styles.light, styles.lightYellow, yellowOn && styles.lightYellowOn]} />
        <View style={[styles.light, styles.lightGreen, greenOn && styles.lightGreenOn]} />
      </View>
    </View>
  );
}

function GoBurst({ visible }: { visible: boolean }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 0;
      opacity.value = 1;
      scale.value = withSpring(1.2, { damping: 8, stiffness: 200 });
      opacity.value = withDelay(1200, withTiming(0, { duration: 600 }));
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.goBurst, animStyle]}>
      <Text style={styles.goBurstText}>GO! 🏁</Text>
    </Animated.View>
  );
}

type GasCanProps = {
  fillPct: number;
};

function GasCan({ fillPct }: GasCanProps) {
  const clamp = Math.max(0, Math.min(1, fillPct));
  const fuelColor = clamp > 0.5 ? "#F4633A" : clamp > 0.2 ? "#FFD93D" : "#FF2200";

  return (
    <View style={gasStyles.wrap}>
      <View style={gasStyles.can}>
        <View style={gasStyles.canNozzle} />
        <View style={gasStyles.canBody}>
          <View style={gasStyles.canInner}>
            <View style={[gasStyles.fuelFill, { height: `${Math.round(clamp * 100)}%`, backgroundColor: fuelColor }]} />
          </View>
          <View style={gasStyles.fuelPct}>
            <Text style={gasStyles.fuelPctText}>{Math.round(clamp * 100)}%</Text>
          </View>
        </View>
        <View style={gasStyles.canHandle} />
      </View>
      <Text style={gasStyles.hint}>
        {clamp <= 0 ? "⛽ TANK FULL! 🎉" : "Tilt phone to pour fuel!"}
      </Text>
    </View>
  );
}

const gasStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 24,
  },
  can: {
    alignItems: "center",
    position: "relative",
  },
  canNozzle: {
    width: 18,
    height: 30,
    backgroundColor: "#888",
    borderRadius: 4,
    marginRight: -70,
    alignSelf: "flex-end",
    marginBottom: -4,
    transform: [{ rotate: "30deg" }],
  },
  canBody: {
    width: 120,
    height: 160,
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#F4633A",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  canInner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    justifyContent: "flex-end",
  },
  fuelFill: {
    width: "100%",
    borderRadius: 0,
    minHeight: 2,
  },
  fuelPct: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  fuelPctText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  canHandle: {
    width: 50,
    height: 18,
    backgroundColor: "transparent",
    borderTopWidth: 5,
    borderColor: "#888",
    borderRadius: 12,
    marginTop: 4,
  },
  hint: {
    color: "#CCCCCC",
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    letterSpacing: 1,
  },
});

type AccelSubscription = { remove: () => void };

function useTiltDrain(active: boolean, onDrain: (amount: number) => void) {
  const subscriptionRef = useRef<AccelSubscription | null>(null);

  useEffect(() => {
    if (!active || Platform.OS === "web") return;

    let mounted = true;

    (async () => {
      try {
        const sensors = await import("expo-sensors");
        const { Accelerometer } = sensors;
        Accelerometer.setUpdateInterval(80);

        subscriptionRef.current = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
          if (!mounted) return;
          const tilt = Math.abs(x) + Math.abs(y - (-1));
          if (tilt > 0.35) {
            onDrain(tilt * 0.012);
          }
        });
      } catch (e) {
        console.warn("[Race] Accelerometer unavailable:", e);
      }
    })();

    return () => {
      mounted = false;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [active, onDrain]);
}

function PitStopModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [fillPct, setFillPct] = useState(1);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (visible) {
      setFillPct(1);
      setDone(false);
      doneRef.current = false;
    }
  }, [visible]);

  const handleDrain = useCallback((amount: number) => {
    if (doneRef.current) return;
    setFillPct((prev) => {
      const next = prev - amount;
      if (next <= 0) {
        doneRef.current = true;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setDone(true);
        setTimeout(onClose, 1800);
        return 0;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return next;
    });
  }, [onClose]);

  useTiltDrain(visible && !done, handleDrain);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pitStyles.overlay}>
        <View style={pitStyles.card}>
          <Text style={pitStyles.title}>⛽ PIT STOP</Text>
          <GasCan fillPct={fillPct} />
          {done && (
            <Text style={pitStyles.doneText}>FUELED UP! 🎉</Text>
          )}
          <Pressable onPress={onClose} style={pitStyles.closeBtn} hitSlop={12}>
            <Text style={pitStyles.closeBtnText}>SKIP</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const pitStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#0D1F35",
    borderRadius: 28,
    padding: 36,
    alignItems: "center",
    gap: 20,
    borderWidth: 2,
    borderColor: "#F4633A44",
    width: 300,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
  doneText: {
    color: "#00CC44",
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeBtnText: {
    color: "#888",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    letterSpacing: 2,
  },
});

export default function RaceScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraGranted = permission?.granted ?? false;

  useEffect(() => {
    if (permission === null || permission === undefined) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const [lightState, setLightState] = useState<LightState>("off");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [showGo, setShowGo] = useState(false);
  const [pitStopOpen, setPitStopOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRace = useCallback(() => {
    clearTimers();
    setShowGo(false);
    setGameState("countdown");
    setLightState("red");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    timerRef.current = setTimeout(() => {
      setLightState("yellow");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      timerRef.current = setTimeout(() => {
        setLightState("green");
        setGameState("go");
        setShowGo(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        timerRef.current = setTimeout(() => {
          setShowGo(false);
          setGameState("done");
        }, 2200);
      }, 1200);
    }, 1200);
  }, [clearTimers]);

  const resetRace = useCallback(() => {
    clearTimers();
    setLightState("off");
    setGameState("idle");
    setShowGo(false);
  }, [clearTimers]);

  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
      )}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.titleEmoji}>🏎️</Text>
          <Text style={styles.titleText}>RACE</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.trackLines}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View key={i} style={styles.trackDash} />
        ))}
      </View>

      <View style={styles.lightArea}>
        <StopLight state={lightState} />
      </View>

      <View style={styles.burstArea} pointerEvents="none">
        <GoBurst visible={showGo} />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 32 }]}>
        {gameState === "idle" || gameState === "done" ? (
          <Pressable
            onPress={startRace}
            style={({ pressed }) => [styles.startBtn, pressed && styles.btnPressed]}
            testID="race-start-btn"
          >
            <LinearGradient
              colors={["#F5C518", "#D4A800"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtnGrad}
            >
              <Ionicons name="play" size={28} color="#000" />
              <Text style={styles.startBtnText}>
                {gameState === "done" ? "RACE AGAIN!" : "START"}
              </Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <View style={[styles.startBtn, { opacity: 0.45 }]}>
            <View style={[styles.startBtnGrad, { backgroundColor: "#888", borderRadius: 50 }]}>
              <Ionicons name="play" size={28} color="#000" />
              <Text style={styles.startBtnText}>
                {gameState === "countdown" ? "GET READY..." : "GO GO GO!"}
              </Text>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => setPitStopOpen(true)}
          style={({ pressed }) => [styles.pitBtn, pressed && styles.btnPressed]}
          testID="race-pitstop-btn"
        >
          <LinearGradient
            colors={["#F4633A", "#C13E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pitBtnGrad}
          >
            <Text style={styles.pitBtnEmoji}>⛽</Text>
            <Text style={styles.pitBtnText}>PIT STOP</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <PitStopModal visible={pitStopOpen} onClose={() => setPitStopOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D1A",
  },
  fallbackBg: {
    backgroundColor: "#0D0D1A",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleEmoji: {
    fontSize: 24,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 4,
  },
  trackLines: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 8,
    marginHorizontal: 24,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#FFFFFF20",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  trackDash: {
    width: 28,
    height: 8,
    backgroundColor: "#FFFFFF30",
    borderRadius: 4,
  },
  lightArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  burstArea: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  stoplightPole: {
    alignItems: "center",
    gap: 0,
  },
  stoplightBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 18,
    gap: 18,
    borderWidth: 3,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  light: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#000",
  },
  lightRed: {
    backgroundColor: "#3A0A0A",
  },
  lightRedOn: {
    backgroundColor: "#FF2200",
    shadowColor: "#FF2200",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 18,
  },
  lightYellow: {
    backgroundColor: "#2A2200",
  },
  lightYellowOn: {
    backgroundColor: "#FFE000",
    shadowColor: "#FFE000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 18,
  },
  lightGreen: {
    backgroundColor: "#002A0A",
  },
  lightGreenOn: {
    backgroundColor: "#00CC44",
    shadowColor: "#00CC44",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 18,
  },
  goBurst: {
    position: "absolute",
    backgroundColor: "#00CC44EE",
    borderRadius: 32,
    paddingHorizontal: 40,
    paddingVertical: 20,
    shadowColor: "#00CC44",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  goBurstText: {
    color: "#FFFFFF",
    fontSize: 52,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 4,
    textAlign: "center",
  },
  controls: {
    paddingHorizontal: 24,
    gap: 14,
  },
  startBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#F5C518",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 14,
  },
  startBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingVertical: 22,
    borderRadius: 50,
  },
  startBtnText: {
    color: "#000000",
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
  pitBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#F4633A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  pitBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  pitBtnEmoji: {
    fontSize: 22,
  },
  pitBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
