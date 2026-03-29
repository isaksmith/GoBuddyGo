import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

const { width, height } = Dimensions.get("window");
const native = Platform.OS !== "web";

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const PARTICLE_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.accentBlue,
  "#FF9EFF",
  "#FFFFFF",
];

function createParticle(startX: number, startY: number): Particle {
  return {
    x: new Animated.Value(startX),
    y: new Animated.Value(startY),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  };
}

function animateParticle(
  particle: Particle,
  startX: number,
  startY: number,
  onEnd: () => void
) {
  const toX = startX + (Math.random() - 0.5) * 220;
  const toY = startY - Math.random() * 320 - 60;

  Animated.sequence([
    Animated.parallel([
      Animated.timing(particle.opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: native,
      }),
      Animated.timing(particle.scale, {
        toValue: Math.random() * 0.9 + 0.5,
        duration: 180,
        useNativeDriver: native,
      }),
    ]),
    Animated.parallel([
      Animated.timing(particle.x, {
        toValue: toX,
        duration: 1100,
        useNativeDriver: native,
      }),
      Animated.timing(particle.y, {
        toValue: toY,
        duration: 1100,
        useNativeDriver: native,
      }),
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: 1100,
        useNativeDriver: native,
      }),
    ]),
  ]).start(onEnd);
}

interface SparkleProps {
  active: boolean;
  centerX?: number;
  centerY?: number;
}

export function SparkleEffect({
  active,
  centerX = width / 2,
  centerY = height / 2,
}: SparkleProps) {
  const particles = useRef<Particle[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!active) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      particles.current = [];
      return;
    }

    function launchBurst() {
      for (let i = 0; i < 10; i++) {
        const p = createParticle(centerX, centerY);
        particles.current.push(p);
        const timer = setTimeout(() => {
          animateParticle(p, centerX, centerY, () => {
            particles.current = particles.current.filter((x) => x !== p);
          });
        }, i * 70);
        timersRef.current.push(timer);
      }
    }

    launchBurst();
    const interval = setInterval(launchBurst, 2000);
    return () => {
      clearInterval(interval);
      timersRef.current.forEach(clearTimeout);
    };
  }, [active, centerX, centerY]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

interface MissionShieldProps {
  visible: boolean;
  label: string;
}

export function MissionShield({ visible, label }: MissionShieldProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: native,
      tension: 120,
      friction: 8,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.shield,
        {
          opacity: anim,
          transform: [{ scale: anim }],
        },
      ]}
    >
      <View style={styles.shieldInner}>
        <Animated.Text style={styles.shieldLabel}>⭐ MISSION ⭐</Animated.Text>
        <Animated.Text style={styles.shieldText}>{label}</Animated.Text>
      </View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  shield: {
    position: "absolute",
    top: 90,
    left: 16,
    right: 16,
    borderRadius: 22,
    backgroundColor: "rgba(244, 99, 58, 0.92)",
    borderWidth: 3,
    borderColor: Colors.secondary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  shieldInner: {
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  shieldLabel: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: "Quicksand_700Bold",
    letterSpacing: 2,
  },
  shieldText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Quicksand_700Bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
