import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Badge } from "@/context/AppContext";
import { getBadgeMeta } from "@/constants/badgeRegistry";

interface BadgeCardProps {
  badge: Badge;
  index: number;
}

export function BadgeCard({ badge, index }: BadgeCardProps) {
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 200),
      Animated.spring(scale, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(index * 200),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-12deg", "0deg"],
  });

  const meta = getBadgeMeta(badge.id);
  const gradientColors: [string, string] = meta
    ? meta.gradientColors
    : [Colors.primary, Colors.primaryDark];
  const SvgComponent = meta?.SvgComponent;

  return (
    <Animated.View
      style={[styles.card, { transform: [{ scale }, { rotate: rotation }] }]}
    >
      <LinearGradient
        colors={[gradientColors[0] + "33", gradientColors[1] + "11"]}
        style={styles.cardInner}
      >
        <View
          style={[
            styles.iconCircle,
            {
              shadowColor: gradientColors[0],
              borderColor: gradientColors[0] + "88",
            },
          ]}
        >
          {SvgComponent ? (
            <SvgComponent />
          ) : (
            <LinearGradient
              colors={gradientColors}
              style={styles.iconGradientFallback}
            >
              <Text style={styles.fallbackEmoji}>🏆</Text>
            </LinearGradient>
          )}
        </View>
        <Text style={styles.title}>{badge.title.toUpperCase()}</Text>
        <Text style={styles.description}>{badge.description}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginHorizontal: 6,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  cardInner: {
    padding: 18,
    alignItems: "center",
    borderRadius: 22,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
  },
  iconGradientFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackEmoji: {
    fontSize: 36,
  },
  title: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: "Quicksand_700Bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Quicksand_400Regular",
    textAlign: "center",
    lineHeight: 15,
  },
});
