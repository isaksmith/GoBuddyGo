import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
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

import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import ModelViewer from "@/components/ModelViewer";
import { getApiBaseUrl } from "@/utils/apiUrl";

const buddyCarRender = require("@/assets/images/buddy-car-render.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CAR_W = 200;
const CAR_H = 140;
const COIN_R = 20;
const MOVE_STEP = 28;
const PLAYFIELD_TOP = 100;
const PLAYFIELD_BOTTOM_MARGIN = 280;

function randomCoinPos() {
  const margin = COIN_R + 16;
  return {
    x: margin + Math.random() * (SCREEN_W - margin * 2 - COIN_R * 2),
    y: PLAYFIELD_TOP + margin + Math.random() * (SCREEN_H - PLAYFIELD_TOP - PLAYFIELD_BOTTOM_MARGIN - margin * 2),
  };
}

function makeCoin(id: number) {
  const pos = randomCoinPos();
  return { id, x: pos.x, y: pos.y };
}

function GoldCoin({ size = 40 }: { size?: number }) {
  return (
    <View
      style={[
        styles.goldCoinOuter,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View
        style={[
          styles.goldCoinInner,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
          },
        ]}
      >
        <Text style={[styles.goldCoinSymbol, { fontSize: size * 0.38 }]}>$</Text>
      </View>
    </View>
  );
}

function CoinView({ coin, onCollect }: { coin: { id: number; x: number; y: number }; onCollect: (id: number) => void }) {
  const spin = useSharedValue(1);
  const bounce = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withSequence(withTiming(0.6, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      false
    );
    bounce.value = withRepeat(
      withSequence(withTiming(-4, { duration: 500 }), withTiming(4, { duration: 500 })),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleX: spin.value }, { translateY: bounce.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.coin,
        {
          left: coin.x - COIN_R,
          top: coin.y - COIN_R,
          width: COIN_R * 2,
          height: COIN_R * 2,
        },
        style,
      ]}
    >
      <GoldCoin size={COIN_R * 2} />
    </Animated.View>
  );
}

function DPadButton({
  direction,
  onPress,
}: {
  direction: "up" | "down" | "left" | "right";
  onPress: (dir: "up" | "down" | "left" | "right") => void;
}) {
  const iconMap: Record<string, string> = {
    up: "chevron-up",
    down: "chevron-down",
    left: "chevron-back",
    right: "chevron-forward",
  };

  return (
    <Pressable
      onPress={() => onPress(direction)}
      style={({ pressed }) => [styles.dpadBtn, pressed && styles.dpadBtnPressed]}
      testID={`dpad-${direction}`}
    >
      <Ionicons name={iconMap[direction] as any} size={32} color="#FFFFFF" />
    </Pressable>
  );
}

export default function CoinDashScreen() {
  const insets = useSafeAreaInsets();
  const { savedCars } = useApp();
  const activeCar = savedCars[0] ?? null;
  const [permission, requestPermission] = useCameraPermissions();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(() =>
    Array.from({ length: 6 }, (_, i) => makeCoin(i))
  );
  const nextCoinId = useRef(6);

  const carX = useSharedValue(SCREEN_W / 2 - CAR_W / 2);
  const carY = useSharedValue(
    PLAYFIELD_TOP + (SCREEN_H - PLAYFIELD_TOP - PLAYFIELD_BOTTOM_MARGIN) / 2 - CAR_H / 2
  );
  const carFlip = useSharedValue(1);
  const carBounce = useSharedValue(0);

  const carPosRef = useRef({
    x: SCREEN_W / 2 - CAR_W / 2,
    y: PLAYFIELD_TOP + (SCREEN_H - PLAYFIELD_TOP - PLAYFIELD_BOTTOM_MARGIN) / 2 - CAR_H / 2,
  });

  useEffect(() => {
    carBounce.value = withRepeat(
      withSequence(withTiming(-2, { duration: 200 }), withTiming(2, { duration: 200 })),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (permission === null || permission === undefined) return;
    if (!permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const carStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: carX.value },
      { translateY: carY.value + carBounce.value },
      { scaleX: carFlip.value },
    ],
  }));

  const checkCollisions = useCallback(
    (cx: number, cy: number) => {
      const carCenterX = cx + CAR_W / 2;
      const carCenterY = cy + CAR_H / 2;

      setCoins((prev) => {
        let collectedAny = false;
        const next = prev.filter((coin) => {
          const dx = carCenterX - coin.x;
          const dy = carCenterY - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CAR_W / 2 + COIN_R - 6) {
            collectedAny = true;
            return false;
          }
          return true;
        });

        if (collectedAny) {
          const toAdd = prev.length - next.length;
          const newCoins = Array.from({ length: toAdd }, () => {
            const id = nextCoinId.current++;
            return makeCoin(id);
          });
          setScore((s) => s + toAdd);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return [...next, ...newCoins];
        }
        return prev;
      });
    },
    []
  );

  const moveCarRef = useRef(checkCollisions);
  moveCarRef.current = checkCollisions;

  const playfield = {
    minX: 0,
    maxX: SCREEN_W - CAR_W,
    minY: PLAYFIELD_TOP,
    maxY: SCREEN_H - PLAYFIELD_BOTTOM_MARGIN - CAR_H,
  };

  const handleDpad = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      const cur = carPosRef.current;
      let nx = cur.x;
      let ny = cur.y;

      if (dir === "up") ny -= MOVE_STEP;
      if (dir === "down") ny += MOVE_STEP;
      if (dir === "left") {
        nx -= MOVE_STEP;
        carFlip.value = 1;
      }
      if (dir === "right") {
        nx += MOVE_STEP;
        carFlip.value = -1;
      }

      nx = Math.max(playfield.minX, Math.min(playfield.maxX, nx));
      ny = Math.max(playfield.minY, Math.min(playfield.maxY, ny));

      carPosRef.current = { x: nx, y: ny };
      carX.value = withSpring(nx, { damping: 14, stiffness: 200 });
      carY.value = withSpring(ny, { damping: 14, stiffness: 200 });

      setTimeout(() => {
        moveCarRef.current(nx, ny);
      }, 80);
    },
    []
  );

  const cameraGranted = permission?.granted ?? false;

  return (
    <View style={styles.container}>
      {cameraGranted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallbackBg]} />
      )}

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
          <GoldCoin size={28} />
          <Text style={styles.titleText}>COIN DASH</Text>
        </View>

        <View style={styles.scoreBadge}>
          <GoldCoin size={22} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Playfield */}
      <View style={styles.playfield} pointerEvents="none">
        {/* Coins */}
        {coins.map((coin) => (
          <CoinView key={coin.id} coin={coin} onCollect={() => {}} />
        ))}

        {/* Car */}
        <Animated.View style={[styles.car, carStyle]}>
          {activeCar && !activeCar.isDefault && activeCar.photoUri ? (
            <Image
              source={{ uri: activeCar.photoUri }}
              style={styles.carImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.carModel}>
              <Image
                source={buddyCarRender}
                style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
                resizeMode="contain"
              />
              <ModelViewer
                html={`<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"><\/script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:transparent;overflow:hidden}model-viewer{width:100%;height:100%;background-color:transparent;--poster-color:transparent;}</style></head><body><model-viewer src="${getApiBaseUrl()}/assets/buddy-car-game.glb" camera-orbit="225deg 65deg auto" camera-controls="false" interaction-prompt="none" auto-rotate="false" shadow-intensity="0" environment-image="neutral" exposure="1.2" alt="Buddy Car"></model-viewer></body></html>`}
                style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
                scrollEnabled={false}
              />
            </View>
          )}
        </Animated.View>
      </View>

      {/* D-Pad Controls */}
      <View style={[styles.dpadWrapper, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dpadGrid}>
          <View style={styles.dpadRow}>
            <View style={styles.dpadSpacer} />
            <DPadButton direction="up" onPress={handleDpad} />
            <View style={styles.dpadSpacer} />
          </View>
          <View style={styles.dpadRow}>
            <DPadButton direction="left" onPress={handleDpad} />
            <View style={styles.dpadCenter} />
            <DPadButton direction="right" onPress={handleDpad} />
          </View>
          <View style={styles.dpadRow}>
            <View style={styles.dpadSpacer} />
            <DPadButton direction="down" onPress={handleDpad} />
            <View style={styles.dpadSpacer} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  fallbackBg: {
    backgroundColor: "#0A1A10",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: "#F5C51888",
  },
  scoreText: {
    color: "#F5C518",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  playfield: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  coin: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  goldCoinOuter: {
    backgroundColor: "#D4A017",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFE066",
    shadowColor: "#F5C518",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 8,
  },
  goldCoinInner: {
    backgroundColor: "#F5C518",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFE566",
  },
  goldCoinSymbol: {
    color: "#7A5000",
    fontFamily: "Nunito_700Bold",
    lineHeight: undefined,
  },
  car: {
    position: "absolute",
    width: CAR_W,
    height: CAR_H,
  },
  carImage: {
    width: CAR_W,
    height: CAR_H,
    borderRadius: 8,
  },
  carModel: {
    width: CAR_W,
    height: CAR_H,
    backgroundColor: "transparent",
  },
  dpadWrapper: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dpadGrid: {
    gap: 6,
  },
  dpadRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  dpadSpacer: {
    width: 72,
    height: 72,
  },
  dpadCenter: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dpadBtn: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  dpadBtnPressed: {
    backgroundColor: "rgba(245,197,24,0.45)",
    borderColor: "#F5C518",
    transform: [{ scale: 0.92 }],
  },
});
