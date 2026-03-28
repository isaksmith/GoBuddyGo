import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
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

  React.useEffect(() => {
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

function PitStopBar({ filling }: { filling: boolean }) {
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (filling) {
      setDone(false);
      opacity.value = withTiming(1, { duration: 200 });
      width.value = 0;
      width.value = withTiming(100, { duration: 2000, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          setDone(true);
        }
      });
    } else {
      opacity.value = withDelay(1500, withTiming(0, { duration: 400 }));
    }
  }, [filling]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pitStopContainer, containerStyle]}>
      <Text style={styles.pitStopLabel}>
        {done ? "⛽ TANK FULL! 🎉" : "⛽ FILLING UP..."}
      </Text>
      <View style={styles.pitStopTrack}>
        <Animated.View style={[styles.pitStopFill, barStyle]} />
      </View>
    </Animated.View>
  );
}

export default function RaceScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [lightState, setLightState] = useState<LightState>("off");
  const [gameState, setGameState] = useState<GameState>("idle");
  const [showGo, setShowGo] = useState(false);
  const [pitstopFilling, setPitstopFilling] = useState(false);
  const [pitstopVisible, setPitstopVisible] = useState(false);
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

  const handlePitStop = useCallback(() => {
    if (pitstopFilling) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPitstopVisible(true);
    setPitstopFilling(true);

    setTimeout(() => {
      setPitstopFilling(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setPitstopVisible(false);
      }, 2000);
    }, 2000);
  }, [pitstopFilling]);

  const resetRace = useCallback(() => {
    clearTimers();
    setLightState("off");
    setGameState("idle");
    setShowGo(false);
    setPitstopFilling(false);
    setPitstopVisible(false);
  }, [clearTimers]);

  return (
    <LinearGradient
      colors={["#0D0D1A", "#1A0A2E", "#0D1F35"]}
      style={styles.container}
    >
      {/* Top bar */}
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

      {/* Race Track decoration */}
      <View style={styles.trackLines}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <View key={i} style={styles.trackDash} />
        ))}
      </View>

      {/* Stoplight */}
      <View style={styles.lightArea}>
        <StopLight state={lightState} />
      </View>

      {/* GO Burst */}
      <View style={styles.burstArea} pointerEvents="none">
        <GoBurst visible={showGo} />
      </View>

      {/* Pit stop bar */}
      {pitstopVisible && (
        <View style={styles.pitArea}>
          <PitStopBar filling={pitstopFilling} />
        </View>
      )}

      {/* Controls */}
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
          onPress={handlePitStop}
          disabled={pitstopFilling}
          style={({ pressed }) => [
            styles.pitBtn,
            pressed && styles.btnPressed,
            pitstopFilling && styles.pitBtnDisabled,
          ]}
          testID="race-pitstop-btn"
        >
          <LinearGradient
            colors={pitstopFilling ? ["#555", "#444"] : ["#F4633A", "#C13E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pitBtnGrad}
          >
            <Text style={styles.pitBtnEmoji}>⛽</Text>
            <Text style={styles.pitBtnText}>PIT STOP</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
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
  pitArea: {
    paddingHorizontal: 32,
    marginBottom: 16,
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
  pitStopContainer: {
    gap: 10,
    alignItems: "center",
  },
  pitStopLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  pitStopTrack: {
    width: "100%",
    height: 24,
    backgroundColor: "#222",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#444",
  },
  pitStopFill: {
    height: "100%",
    backgroundColor: "#F4633A",
    borderRadius: 12,
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
  pitBtnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
