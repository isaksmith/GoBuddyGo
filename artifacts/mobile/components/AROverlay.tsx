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
  "#FF9EFF",
  "#61DAFB",
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

function animateParticle(particle: Particle, onEnd: () => void) {
  const toX = (particle.x as any)._value + (Math.random() - 0.5) * 200;
  const toY = (particle.y as any)._value - Math.random() * 300 - 50;

  Animated.sequence([
    Animated.parallel([
      Animated.timing(particle.opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: native,
      }),
      Animated.timing(particle.scale, {
        toValue: Math.random() * 0.8 + 0.4,
        duration: 200,
        useNativeDriver: native,
      }),
    ]),
    Animated.parallel([
      Animated.timing(particle.x, {
        toValue: toX,
        duration: 1200,
        useNativeDriver: native,
      }),
      Animated.timing(particle.y, {
        toValue: toY,
        duration: 1200,
        useNativeDriver: native,
      }),
      Animated.timing(particle.opacity, {
        toValue: 0,
        duration: 1200,
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

export function SparkleEffect({ active, centerX = width / 2, centerY = height / 2 }: SparkleProps) {
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
      for (let i = 0; i < 8; i++) {
        const p = createParticle(centerX, centerY);
        particles.current.push(p);
        const timer = setTimeout(() => {
          animateParticle(p, () => {
            particles.current = particles.current.filter((x) => x !== p);
          });
        }, i * 80);
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
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
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
        <Animated.Text style={styles.shieldText}>{label}</Animated.Text>
      </View>
    </Animated.View>
  );
}

interface SpeedStarProps {
  speed: number;
}

export function SpeedStar({ speed }: SpeedStarProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 600, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.speedStar, { transform: [{ scale: pulse }] }]}>
      <View style={styles.speedStarInner}>
        <Animated.Text style={styles.speedStarLabel}>CO-PILOT</Animated.Text>
        <Animated.Text style={styles.speedStarValue}>{speed}</Animated.Text>
        <Animated.Text style={styles.speedStarUnit}>MPH</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  shield: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 43, 0.9)",
    borderWidth: 2,
    borderColor: Colors.secondary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldInner: {
    padding: 16,
    alignItems: "center",
  },
  shieldText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  speedStar: {
    position: "absolute",
    bottom: 160,
    right: 20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 209, 102, 0.95)",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  speedStarInner: {
    alignItems: "center",
  },
  speedStarLabel: {
    color: Colors.primaryDark,
    fontSize: 8,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  speedStarValue: {
    color: Colors.primaryDark,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
  },
  speedStarUnit: {
    color: Colors.primaryDark,
    fontSize: 8,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
});
