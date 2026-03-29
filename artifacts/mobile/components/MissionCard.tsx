import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { SessionMission } from "@/context/AppContext";

interface MissionCardProps {
  mission: SessionMission;
  index: number;
  onPlay?: (missionId: string) => void;
}

const ICON_COLORS = [
  Colors.primary,
  Colors.accent,
  Colors.accentBlue,
  Colors.secondary,
  Colors.glowTeal,
];

function AnimatedMissionCard({ mission, index, onPlay }: MissionCardProps) {
  const slideIn = useRef(new Animated.Value(80)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const iconColor = ICON_COLORS[index % ICON_COLORS.length];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 380,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 380,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconName = mission.icon as keyof typeof Ionicons.glyphMap;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeIn,
          transform: [{ translateY: slideIn }],
        },
      ]}
    >
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor + "22", borderColor: iconColor + "66" }]}>
          <Ionicons
            name={iconName}
            size={28}
            color={iconColor}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {mission.title.toUpperCase()}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {mission.description}
          </Text>
          {mission.difficulty && (
            <View
              style={[
                styles.difficultyPill,
                {
                  backgroundColor:
                    mission.difficulty === "easy"
                      ? Colors.accent + "22"
                      : mission.difficulty === "medium"
                      ? Colors.secondary + "22"
                      : Colors.primary + "22",
                  borderColor:
                    mission.difficulty === "easy"
                      ? Colors.accent
                      : mission.difficulty === "medium"
                      ? Colors.secondary
                      : Colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.difficultyText,
                  {
                    color:
                      mission.difficulty === "easy"
                        ? Colors.accent
                        : mission.difficulty === "medium"
                        ? Colors.secondary
                        : Colors.primary,
                  },
                ]}
              >
                {mission.difficulty.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {onPlay && (
          <Pressable
            onPress={() => onPlay(mission.id)}
            style={styles.playBtn}
          >
            <LinearGradient
              colors={[Colors.accent, "#2DB87A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playBtnGradient}
            >
              <Ionicons name="play" size={14} color="#FFFFFF" />
              <Text style={styles.playBtnText}>PLAY!</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

export default AnimatedMissionCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 22,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "BalsamiqSans_400Regular",
    lineHeight: 17,
  },
  difficultyPill: {
    alignSelf: "flex-start",
    borderRadius: 50,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 3,
  },
  difficultyText: {
    fontSize: 9,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
  playBtn: {
    borderRadius: 50,
    overflow: "hidden",
    flexShrink: 0,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  playBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 50,
  },
  playBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
});
