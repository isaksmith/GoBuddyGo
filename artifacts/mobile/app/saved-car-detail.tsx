import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import CarAngleCaptureView from "@/components/CarAngleCaptureView";
import DefaultCarSvg from "@/components/DefaultCarSvg";
import ModelViewer from "@/components/ModelViewer";
import { Colors } from "@/constants/colors";
import { CarAngle, CarPhotos, useApp } from "@/context/AppContext";

// ── Angle config ───────────────────────────────────────────────────────────────

const ANGLE_ORDER: CarAngle[] = [
  "frontThreeQuarter",
  "front",
  "driverSide",
  "rear",
  "passengerSide",
];


// ── Layout ─────────────────────────────────────────────────────────────────────

const H_PADDING = 20;
const PHOTO_WIDTH = Dimensions.get("window").width - H_PADDING * 2;
const PHOTO_HEIGHT = Math.round(PHOTO_WIDTH * (3 / 4));

// ── Zoomable image ─────────────────────────────────────────────────────────────

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(e.scale, 4));
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pinch}>
      <Animated.Image
        source={{ uri }}
        style={[styles.carouselImage, animatedStyle]}
        resizeMode="cover"
      />
    </GestureDetector>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function SavedCarDetailScreen() {
  const insets = useSafeAreaInsets();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { savedCars, updateSavedCar } = useApp();
  const [show3D, setShow3D] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureAttempted, setCaptureAttempted] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const car = savedCars.find((c) => c.id === carId);

  const allAnglesGenerated = ANGLE_ORDER.every((a) => !!car?.photos?.[a]);
  const shouldCapture = !!car && car.model3dStatus === "succeeded" && !!car.model3dUrl && !allAnglesGenerated && !captureAttempted;

  useEffect(() => {
    if (shouldCapture) setIsCapturing(true);
  }, [shouldCapture]);

  const handleCaptureComplete = useCallback(
    async (photos: Partial<CarPhotos>) => {
      setIsCapturing(false);
      setCaptureAttempted(true);
      if (!car) return;
      const merged: CarPhotos = { ...car.photos, ...photos };
      await updateSavedCar(car.id, { photos: merged });
    },
    [car, updateSavedCar]
  );

  const handleCaptureError = useCallback(() => {
    setIsCapturing(false);
    setCaptureAttempted(true);
  }, []);

  // ── Car not found guard ──────────────────────────────────────────────────────
  if (!car) {
    return (
      <AppBackground>
        <View style={[styles.notFound, { paddingTop: insets.top + 16 }]}>
          <Ionicons name="car-sport" size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Car not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  const has3D = car.model3dStatus === "succeeded" && !!car.model3dUrl;
  const isPending = car.model3dStatus === "pending";

  // Build the ordered list of photos that actually exist
  const anglePhotos = ANGLE_ORDER
    .map((angle) => ({ angle, uri: car.photos?.[angle] }))
    .filter((item): item is { angle: CarAngle; uri: string } => !!item.uri);

  const hasPhotos = anglePhotos.length > 0;
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / PHOTO_WIDTH);
    setCurrentIndex(Math.max(0, Math.min(index, anglePhotos.length - 1)));
  };

  // ── 3D full-screen overlay ───────────────────────────────────────────────────
  if (show3D && has3D) {
    return (
      <AppBackground>
        <View style={StyleSheet.absoluteFill}>
          <ModelViewer
            cacheKey={car.model3dUrl ?? undefined}
            html={`<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script><script nomodule src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${car.model3dUrl}" camera-controls auto-rotate shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="3D car view"></model-viewer></body></html>`}
            style={StyleSheet.absoluteFill}
            scrollEnabled={false}
          />
          <Pressable
            onPress={() => setShow3D(false)}
            style={[styles.overlayBack, { top: insets.top + 12 }]}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
            <Text style={styles.overlayBackText}>Back</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  // ── Main detail view ─────────────────────────────────────────────────────────
  return (
    <AppBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{car.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Photo area */}
        <View style={styles.photoCard}>
          {hasPhotos ? (
            <FlatList
              ref={flatListRef}
              data={anglePhotos}
              keyExtractor={(item) => item.angle}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleScroll}
              renderItem={({ item }) => (
                <ZoomableImage uri={item.uri} />
              )}
            />
          ) : (
            <View style={styles.svgWrap}>
              <DefaultCarSvg width={220} height={140} bodyColor="#4F8EF7" accentColor="#FFD93D" />
            </View>
          )}

          {isPending && (
            <View style={styles.pendingOverlay}>
              <ActivityIndicator size="small" color={Colors.secondary} />
            </View>
          )}
        </View>

        {/* Dots below photo — centered */}
        {hasPhotos && anglePhotos.length > 1 && (
          <View style={styles.dotsRow}>
            {anglePhotos.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Generating indicator */}
        {isCapturing && (
          <View style={styles.capturingRow}>
            <ActivityIndicator size={11} color={Colors.accentBlue} />
            <Text style={styles.capturingText}>Generating photos...</Text>
          </View>
        )}

        {/* Status badge */}
        {has3D && (
          <View style={[styles.badge, styles.badgeReady]}>
            <Ionicons name="cube-outline" size={13} color={Colors.accent} />
            <Text style={[styles.badgeText, { color: Colors.accent }]}>3D MODEL READY</Text>
          </View>
        )}
        {isPending && (
          <View style={[styles.badge, styles.badgePending]}>
            <ActivityIndicator size={11} color={Colors.secondary} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color: Colors.secondary }]}>BUILDING 3D...</Text>
          </View>
        )}

        {/* View in 3D button */}
        {has3D && (
          <Pressable onPress={() => setShow3D(true)} style={styles.view3dBtn}>
            <LinearGradient
              colors={["#4F8EF7", "#2563EB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.view3dGrad}
            >
              <Ionicons name="cube" size={18} color="#FFFFFF" />
              <Text style={styles.view3dText}>VIEW IN 3D</Text>
            </LinearGradient>
          </Pressable>
        )}

        {/* Car name */}
        <Text style={styles.carName} numberOfLines={2}>{car.name}</Text>

        {/* Sticker placeholder */}
        <View style={styles.stickerPlaceholder}>
          <Text style={styles.stickerPlaceholderEmoji}>🎨</Text>
          <Text style={styles.stickerPlaceholderTitle}>Sticker Studio</Text>
          <Text style={styles.stickerPlaceholderSub}>Coming Soon...</Text>
        </View>

      </ScrollView>

      {/* Hidden off-screen WebView that captures 5 angle screenshots from the 3D model */}
      {isCapturing && car?.model3dUrl && (
        <CarAngleCaptureView
          modelUrl={car.model3dUrl}
          onComplete={handleCaptureComplete}
          onError={handleCaptureError}
        />
      )}
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: H_PADDING,
  },

  // ── Not found ────────────────────────────────────────────────────────────────
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundTitle: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 18,
    color: Colors.textMuted,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontFamily: "BalsamiqSans_400Regular",
    fontSize: 15,
    color: Colors.text,
  },

  // ── 3D overlay back button ───────────────────────────────────────────────────
  overlayBack: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(9,25,42,0.75)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  overlayBackText: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 15,
    color: Colors.text,
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  headerBack: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  headerSpacer: {
    width: 32,
  },

  // ── Dots row (below photo, centered) ────────────────────────────────────────
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ── Generating indicator ─────────────────────────────────────────────────────
  capturingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  capturingText: {
    fontFamily: "BalsamiqSans_400Regular",
    fontSize: 12,
    color: Colors.accentBlue,
  },

  // ── Photo card ───────────────────────────────────────────────────────────────
  photoCard: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  carouselImage: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
  },
  svgWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: 12,
  },

  // ── Status badge ─────────────────────────────────────────────────────────────
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeReady: {
    backgroundColor: "rgba(62,207,142,0.15)",
    borderWidth: 1,
    borderColor: "rgba(62,207,142,0.35)",
  },
  badgePending: {
    backgroundColor: "rgba(245,197,24,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,197,24,0.35)",
  },
  badgeText: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 11,
    letterSpacing: 0.5,
  },

  // ── View in 3D button ────────────────────────────────────────────────────────
  view3dBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 20,
    ...(Platform.OS !== "android"
      ? { shadowColor: "#4F8EF7", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10 }
      : { elevation: 6 }),
  },
  view3dGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  view3dText: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // ── Car name ─────────────────────────────────────────────────────────────────
  carName: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 26,
    color: Colors.text,
    marginBottom: 20,
  },

  // ── Sticker placeholder ──────────────────────────────────────────────────────
  stickerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  stickerPlaceholderEmoji: {
    fontSize: 32,
  },
  stickerPlaceholderTitle: {
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  stickerPlaceholderSub: {
    fontFamily: "BalsamiqSans_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
});
