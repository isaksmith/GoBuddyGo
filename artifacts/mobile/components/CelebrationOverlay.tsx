import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { useCelebrationSound } from "./useCelebrationSound";

const native = Platform.OS !== "web";

interface CelebrationOverlayProps {
  visible: boolean;
  missionTitle: string;
  onHide: () => void;
}

export function CelebrationOverlay({ visible, missionTitle, onHide }: CelebrationOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const starRotate = useRef(new Animated.Value(0)).current;
  const playSound = useCelebrationSound();

  useEffect(() => {
    if (visible) {
      playSound();

      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, tension: 120, friction: 7, useNativeDriver: native }),
        Animated.spring(scale, { toValue: 1, tension: 120, friction: 7, useNativeDriver: native }),
        Animated.timing(starRotate, { toValue: 1, duration: 600, useNativeDriver: native }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: native }),
          Animated.timing(scale, { toValue: 0.5, duration: 400, useNativeDriver: native }),
        ]).start(onHide);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const rotation = starRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <View style={styles.card}>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="star" size={48} color={Colors.secondary} />
        </Animated.View>
        <Text style={styles.title}>Mission Complete!</Text>
        <Text style={styles.subtitle}>{missionTitle}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
