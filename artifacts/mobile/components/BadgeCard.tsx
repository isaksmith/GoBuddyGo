import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Badge } from "@/context/AppContext";

const BADGE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  star: "star",
  flame: "flame",
  rocket: "rocket",
  timer: "timer",
};

const BADGE_COLORS: Record<string, string> = {
  star: Colors.secondary,
  flame: Colors.primary,
  rocket: Colors.accent,
  timer: Colors.accentBlue,
};

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
    outputRange: ["-10deg", "0deg"],
  });

  const iconName = BADGE_ICON_MAP[badge.icon] ?? "ribbon";
  const color = BADGE_COLORS[badge.icon] ?? Colors.primary;

  return (
    <Animated.View
      style={[styles.card, { transform: [{ scale }, { rotate: rotation }] }]}
    >
      <View style={[styles.iconCircle, { borderColor: color }]}>
        <Ionicons name={iconName} size={36} color={color} />
      </View>
      <Text style={styles.title}>{badge.title}</Text>
      <Text style={styles.description}>{badge.description}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: 150,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 15,
  },
});
