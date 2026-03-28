import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp, STICKER_CATALOG } from "@/context/AppContext";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CAR_W = 160;
const CAR_H = 120;

type GyroSubscription = { remove: () => void };

function useGyroscope() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const tiltRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (Platform.OS === "web") return;

    let sub: GyroSubscription | null = null;

    (async () => {
      try {
        const sensors = await import("expo-sensors");
        const { Gyroscope } = sensors;
        Gyroscope.setUpdateInterval(16);

        sub = Gyroscope.addListener((data: { x: number; y: number; z: number }) => {
          const cur = tiltRef.current;
          const nextX = cur.x + data.y * 3.0;
          const nextY = cur.y - data.x * 2.5;
          const clampedX = Math.max(-SCREEN_W * 0.3, Math.min(SCREEN_W * 0.3, nextX));
          const clampedY = Math.max(-SCREEN_H * 0.15, Math.min(SCREEN_H * 0.15, nextY));
          tiltRef.current = { x: clampedX, y: clampedY };
          setTilt({ x: clampedX, y: clampedY });
        });
      } catch (e) {
        console.warn("[CoinDash] Gyroscope unavailable:", e);
      }
    })();

    return () => {
      if (sub) sub.remove();
    };
  }, []);

  return tilt;
}

interface DrivePath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

function generatePath(): DrivePath {
  const margin = CAR_W;
  const y = SCREEN_H * 0.5 + (Math.random() - 0.5) * SCREEN_H * 0.3;
  const goRight = Math.random() > 0.5;
  return {
    startX: goRight ? -margin : SCREEN_W + margin,
    startY: y,
    endX: goRight ? SCREEN_W + margin : -margin,
    endY: y + (Math.random() - 0.5) * 80,
    duration: 4000 + Math.random() * 3000,
  };
}

function VehicleOnTrack({
  photoUri,
  stickers,
  vehicleName,
  tilt,
  onLap,
}: {
  photoUri: string | null;
  stickers: { stickerId: string }[];
  vehicleName: string;
  tilt: { x: number; y: number };
  onLap: () => void;
}) {
  const posX = useSharedValue(0);
  const posY = useSharedValue(0);
  const flipX = useSharedValue(1);
  const bounce = useSharedValue(0);
  const pathRef = useRef<DrivePath>(generatePath());

  const startDrive = () => {
    const path = generatePath();
    pathRef.current = path;
    posX.value = path.startX;
    posY.value = path.startY;
    flipX.value = path.endX > path.startX ? 1 : -1;

    posX.value = withTiming(path.endX, {
      duration: path.duration,
      easing: Easing.inOut(Easing.quad),
    });
    posY.value = withTiming(path.endY, {
      duration: path.duration,
      easing: Easing.inOut(Easing.quad),
    });

    setTimeout(() => {
      onLap();
      startDrive();
    }, path.duration);
  };

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 150 }),
        withTiming(3, { duration: 150 })
      ),
      -1,
      true
    );
    startDrive();
  }, []);

  const carStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: posX.value + tilt.x },
      { translateY: posY.value + tilt.y + bounce.value },
      { scaleX: flipX.value },
    ],
  }));

  const stickerEmojis = stickers
    .map((s) => STICKER_CATALOG.find((sc) => sc.id === s.stickerId)?.emoji)
    .filter(Boolean);

  return (
    <Animated.View style={[styles.carContainer, carStyle]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.carImage} resizeMode="cover" />
      ) : (
        <View style={styles.carPlaceholder}>
          <Ionicons name="car-sport" size={60} color="#4FC3F7" />
        </View>
      )}
      {stickerEmojis.length > 0 && (
        <View style={styles.carStickers}>
          {stickerEmojis.slice(0, 4).map((emoji, i) => (
            <Text key={i} style={styles.carStickerEmoji}>{emoji}</Text>
          ))}
        </View>
      )}
      <View style={styles.carNameBadge}>
        <Text style={styles.carNameText} numberOfLines={1}>{vehicleName}</Text>
      </View>
    </Animated.View>
  );
}

function DustParticle({ delay }: { delay: number }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const startX = Math.random() * SCREEN_W;
      const startY = SCREEN_H * 0.6 + Math.random() * SCREEN_H * 0.3;
      x.value = startX;
      y.value = startY;
      opacity.value = withSequence(
        withTiming(0.4, { duration: 200 }),
        withTiming(0, { duration: 800 })
      );
      x.value = withTiming(startX + (Math.random() - 0.5) * 40, { duration: 1000 });
      y.value = withTiming(startY - 20 - Math.random() * 30, { duration: 1000 });
    }, 2000 + delay);

    return () => clearInterval(interval);
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dustParticle, style]} />;
}

export default function CoinDashScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const { garage } = useApp();
  const tilt = useGyroscope();
  const [laps, setLaps] = useState(0);

  const handleLap = () => {
    setLaps((prev) => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          Watch your car drive around in AR! Move your phone to follow it.
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

  const hasVehicle = !!garage.photoUri;

  return (
    <View style={styles.container}>
      {Platform.OS !== "web" ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webFallback]}>
          <Ionicons name="car-sport" size={80} color={Colors.border} />
          <Text style={styles.webFallbackText}>
            AR Drive requires a mobile device
          </Text>
        </View>
      )}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[0, 1, 2, 3, 4].map((i) => (
          <DustParticle key={i} delay={i * 400} />
        ))}
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <VehicleOnTrack
          photoUri={garage.photoUri}
          stickers={garage.stickers}
          vehicleName={garage.vehicleName}
          tilt={tilt}
          onLap={handleLap}
        />
      </View>

      <View style={[StyleSheet.absoluteFill, styles.hudOverlay]} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backCircle}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.titleContainer}>
            <Ionicons name="car-sport" size={18} color="#4FC3F7" />
            <Text style={styles.titleText}>AR DRIVE</Text>
          </View>

          <View style={styles.lapContainer}>
            <Ionicons name="flag" size={16} color="#F5C518" />
            <Text style={styles.lapText}>Laps: {laps}</Text>
          </View>
        </View>

        {!hasVehicle && (
          <View style={styles.noVehicleOverlay}>
            <View style={styles.noVehicleCard}>
              <Ionicons name="camera-outline" size={40} color="#4FC3F7" />
              <Text style={styles.noVehicleTitle}>NO VEHICLE YET</Text>
              <Text style={styles.noVehicleSub}>
                Head to the Garage tab to scan your ride first!
              </Text>
              <Pressable onPress={() => router.back()} style={styles.noVehicleBtn}>
                <Text style={styles.noVehicleBtnText}>GO TO GARAGE</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={[styles.bottomHint, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.hintBadge}>
            <Ionicons name="phone-portrait-outline" size={16} color="#4FC3F7" />
            <Text style={styles.hintText}>
              {hasVehicle ? "Move your phone to follow your car!" : "Scan a car in the Garage first"}
            </Text>
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
  webFallback: {
    backgroundColor: "#081520",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  webFallbackText: {
    color: Colors.textMuted ?? "#888",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  hudOverlay: {
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
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
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "rgba(79,195,247,0.4)",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  lapContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "rgba(245,197,24,0.4)",
  },
  lapText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  carContainer: {
    position: "absolute",
    width: CAR_W,
    height: CAR_H,
    alignItems: "center",
  },
  carImage: {
    width: CAR_W,
    height: CAR_H - 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(79,195,247,0.6)",
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  carPlaceholder: {
    width: CAR_W,
    height: CAR_H - 24,
    borderRadius: 16,
    backgroundColor: "rgba(10,30,50,0.8)",
    borderWidth: 2,
    borderColor: "rgba(79,195,247,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  carStickers: {
    position: "absolute",
    top: -8,
    right: -8,
    flexDirection: "row",
    gap: 2,
  },
  carStickerEmoji: {
    fontSize: 18,
  },
  carNameBadge: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.3)",
  },
  carNameText: {
    color: "#4FC3F7",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dustParticle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(200,180,140,0.5)",
  },
  bottomHint: {
    alignItems: "center",
  },
  hintBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.3)",
  },
  hintText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },
  noVehicleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  noVehicleCard: {
    backgroundColor: Colors.backgroundCard ?? "#1A2332",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(79,195,247,0.5)",
    shadowColor: "#4FC3F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    marginHorizontal: 32,
  },
  noVehicleTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  noVehicleSub: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  noVehicleBtn: {
    backgroundColor: "#4FC3F7",
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  noVehicleBtnText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
});
