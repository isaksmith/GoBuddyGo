import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";

const native = Platform.OS !== "web";

interface ProximityWarningProps {
  visible: boolean;
}

export function ProximityWarning({ visible }: ProximityWarningProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: native,
    }).start();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 400, useNativeDriver: native }),
        Animated.timing(pulse, { toValue: 1, duration: 400, useNativeDriver: native }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale: pulse }] }]}>
      <Ionicons name="warning" size={20} color="#FFFFFF" />
      <Text style={styles.text}>Give the driver some space!</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: "rgba(239, 71, 111, 0.92)",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },
});
