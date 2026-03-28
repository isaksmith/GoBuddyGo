import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { useCelebrationSound } from "./useCelebrationSound";

const native = Platform.OS !== "web";
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CONFETTI_COLORS = [
  Colors.primary,
  Colors.secondary,
  "#FF3B8B",
  "#3BFFD4",
  "#FFD166",
  "#A66CFF",
  "#FF8C00",
  "#00C9FF",
];

interface ConfettiPieceProps {
  x: number;
  delay: number;
  color: string;
  size: number;
  shape: "rect" | "circle";
}

function ConfettiPiece({ x, delay, color, size, shape }: ConfettiPieceProps) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 120;
    const duration = 900 + Math.random() * 500;
    const rotations = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);

    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_H * 0.6,
          duration,
          useNativeDriver: native,
        }),
        Animated.timing(translateX, {
          toValue: drift,
          duration,
          useNativeDriver: native,
        }),
        Animated.timing(rotate, {
          toValue: rotations,
          duration,
          useNativeDriver: native,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.5),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.5,
            useNativeDriver: native,
          }),
        ]),
      ]),
    ]);
    anim.start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [-4, 4],
    outputRange: ["-720deg", "720deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: shape === "circle" ? size : size * 0.6,
        height: size,
        borderRadius: shape === "circle" ? size / 2 : 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: rotation }],
      }}
    />
  );
}

interface CelebrationOverlayProps {
  visible: boolean;
  missionTitle: string;
  onHide: () => void;
}

const CONFETTI_COUNT = 40;

function buildConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_W,
    delay: Math.random() * 350,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 10,
    shape: (Math.random() > 0.5 ? "rect" : "circle") as "rect" | "circle",
  }));
}

export function CelebrationOverlay({ visible, missionTitle, onHide }: CelebrationOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const confettiRef = useRef(buildConfetti());
  const playSound = useCelebrationSound();

  useEffect(() => {
    if (visible) {
      confettiRef.current = buildConfetti();
      playSound();

      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, tension: 120, friction: 7, useNativeDriver: native }),
        Animated.spring(scale, { toValue: 1, tension: 120, friction: 7, useNativeDriver: native }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: native }),
          Animated.timing(scale, { toValue: 0.5, duration: 400, useNativeDriver: native }),
        ]).start(onHide);
      }, 2200);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiRef.current.map((c) => (
        <ConfettiPiece
          key={c.id}
          x={c.x}
          delay={c.delay}
          color={c.color}
          size={c.size}
          shape={c.shape}
        />
      ))}

      <Animated.View
        style={[
          styles.cardWrapper,
          { opacity, transform: [{ scale }] },
        ]}
      >
        <View style={styles.card}>
          <Ionicons name="star" size={48} color={Colors.secondary} />
          <Text style={styles.title}>Mission Complete!</Text>
          <Text style={styles.subtitle}>{missionTitle}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  cardWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    minWidth: 250,
  },
  title: {
    color: Colors.secondary,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    marginTop: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 6,
    textAlign: "center",
  },
});
