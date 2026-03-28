import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { SessionMission } from "@/context/AppContext";

interface MissionCardProps {
  mission: SessionMission;
  onComplete: (id: string) => void;
  index: number;
}

const ICON_COLORS = [
  Colors.primary,
  Colors.accent,
  Colors.accentBlue,
  Colors.secondary,
  Colors.glowTeal,
];

function AnimatedMissionCard({ mission, onComplete, index }: MissionCardProps) {
  const slideIn = useRef(new Animated.Value(80)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(mission.completed ? 1 : 0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (mission.completed) {
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 200,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [mission.completed]);

  const handlePress = () => {
    if (mission.completed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const native = Platform.OS !== "web";
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.95, duration: 80, useNativeDriver: native }),
      Animated.timing(cardScale, { toValue: 1, duration: 130, useNativeDriver: native }),
    ]).start();
    onComplete(mission.id);
  };

  const iconName = mission.icon as keyof typeof Ionicons.glyphMap;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity: fadeIn,
          transform: [{ translateY: slideIn }, { scale: cardScale }],
        },
      ]}
    >
      <View
        style={[
          styles.card,
          mission.completed && styles.cardCompleted,
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconColor + "22", borderColor: iconColor + "66" }]}>
          <Ionicons
            name={iconName}
            size={28}
            color={mission.completed ? Colors.success : iconColor}
          />
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.title, mission.completed && styles.titleCompleted]}
            numberOfLines={1}
          >
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

        {!mission.completed ? (
          <Pressable onPress={handlePress} style={styles.doneBtn} testID={`mission-${mission.id}`}>
            <LinearGradient
              colors={[Colors.accent, "#2DB87A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.doneBtnGradient}
            >
              <Text style={styles.doneBtnText}>DONE!</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
          </Animated.View>
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
  cardCompleted: {
    borderColor: Colors.success + "66",
    backgroundColor: Colors.success + "0F",
    opacity: 0.8,
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  titleCompleted: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  doneBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    flexShrink: 0,
  },
  doneBtnGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
    flexShrink: 0,
  },
});
