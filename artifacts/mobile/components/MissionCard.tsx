import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { SessionMission } from "@/context/AppContext";

interface MissionCardProps {
  mission: SessionMission;
  onComplete: (id: string) => void;
  index: number;
}

function AnimatedMissionCard({ mission, onComplete, index }: MissionCardProps) {
  const slideIn = useRef(new Animated.Value(60)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(mission.completed ? 1 : 0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
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
    Animated.sequence([
      Animated.timing(cardScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 120, useNativeDriver: true }),
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
      <Pressable
        onPress={handlePress}
        style={[styles.card, mission.completed && styles.cardCompleted]}
        testID={`mission-${mission.id}`}
      >
        <View style={[styles.iconContainer, mission.completed && styles.iconContainerCompleted]}>
          <Ionicons
            name={iconName}
            size={26}
            color={mission.completed ? Colors.success : Colors.primary}
          />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, mission.completed && styles.titleCompleted]}>
            {mission.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {mission.description}
          </Text>
        </View>
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}>
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default AnimatedMissionCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCompleted: {
    borderColor: Colors.success,
    backgroundColor: "rgba(6, 214, 160, 0.08)",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "rgba(255, 107, 43, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconContainerCompleted: {
    backgroundColor: "rgba(6, 214, 160, 0.15)",
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    marginBottom: 2,
  },
  titleCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    lineHeight: 18,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
});
