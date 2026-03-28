import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

const BADGE_GRADIENT_MAP: Record<string, [string, string]> = {
  star: [Colors.secondary, "#E8A800"],
  flame: [Colors.primary, Colors.primaryDark],
  rocket: [Colors.accent, "#26A36A"],
  timer: [Colors.accentBlue, "#2196F3"],
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
    outputRange: ["-12deg", "0deg"],
  });

  const iconName = BADGE_ICON_MAP[badge.icon] ?? "ribbon";
  const gradientColors = BADGE_GRADIENT_MAP[badge.icon] ?? [Colors.primary, Colors.primaryDark];

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
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.iconGradient}
          >
            <Ionicons name={iconName} size={38} color="#FFFFFF" />
          </LinearGradient>
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 15,
  },
});
