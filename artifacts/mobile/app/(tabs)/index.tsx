import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, GlowShadows } from "@/constants/colors";
import { useApp, countAvailableSessionMissions } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");

function FloatingOrb({
  icon,
  color,
  size,
  startX,
  startY,
  delay,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  startX: number;
  startY: number;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const native = Platform.OS !== "web";

  useEffect(() => {
    const driftX = (Math.random() - 0.5) * 30;
    const driftY = 18 + Math.random() * 14;
    const dur = 2200 + Math.random() * 1200;

    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, { toValue: -driftY, duration: dur, useNativeDriver: native }),
            Animated.timing(translateY, { toValue: 0, duration: dur, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(translateX, { toValue: driftX, duration: dur, useNativeDriver: native }),
            Animated.timing(translateX, { toValue: 0, duration: dur, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: dur * 0.5, useNativeDriver: native }),
            Animated.timing(opacity, { toValue: 0.5, duration: dur * 0.5, useNativeDriver: native }),
          ]),
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.12, duration: dur, useNativeDriver: native }),
            Animated.timing(scale, { toValue: 1, duration: dur, useNativeDriver: native }),
          ]),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          left: startX,
          top: startY,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.orbCircle, { width: size, height: size, borderRadius: size / 2, borderColor: color + "60", backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={size * 0.46} color={color} />
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, sessionHistory, missions } = useApp();
  const [name, setName] = useState(settings.childName);
  const [missionWarning, setMissionWarning] = useState(false);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const hiddenTapCount = useRef(0);
  const hiddenTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableMissionCount = countAvailableSessionMissions(missions, settings);
  const native = Platform.OS !== "web";

  useEffect(() => {
    setName(settings.childName);
  }, [settings.childName]);

  const handleSaveName = async (newName: string) => {
    if (newName.trim()) {
      await updateSettings({ childName: newName.trim() });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleHiddenTap = () => {
    hiddenTapCount.current += 1;
    if (hiddenTapTimer.current) clearTimeout(hiddenTapTimer.current);
    hiddenTapTimer.current = setTimeout(() => {
      hiddenTapCount.current = 0;
    }, 1500);
    if (hiddenTapCount.current >= 5) {
      hiddenTapCount.current = 0;
      if (hiddenTapTimer.current) clearTimeout(hiddenTapTimer.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push("/parent-mode");
    }
  };

  const handleStartSession = () => {
    if (availableMissionCount < 3) {
      setMissionWarning(true);
      setTimeout(() => setMissionWarning(false), 3500);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.92, duration: 80, useNativeDriver: native }),
      Animated.timing(buttonScale, { toValue: 1, duration: 140, useNativeDriver: native }),
    ]).start(() => router.push("/ar"));
  };

  const totalSessions = sessionHistory.length;
  const totalBadges = sessionHistory.reduce((sum, s) => sum + s.badges.length, 0);
  const totalMissions = sessionHistory.reduce((sum, s) => sum + s.missionsCompleted, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const orbConfigs = [
    { icon: "star" as const, color: Colors.secondary, size: 56, startX: width * 0.04, startY: height * 0.04, delay: 0 },
    { icon: "shield-checkmark" as const, color: Colors.primary, size: 50, startX: width * 0.74, startY: height * 0.04, delay: 400 },
    { icon: "rocket" as const, color: Colors.accentBlue, size: 40, startX: width * 0.04, startY: height * 0.55, delay: 700 },
    { icon: "star" as const, color: Colors.accent, size: 38, startX: width * 0.80, startY: height * 0.48, delay: 200 },
    { icon: "flash" as const, color: Colors.secondary, size: 34, startX: width * 0.50, startY: height * 0.72, delay: 900 },
  ];

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      {orbConfigs.map((orb, i) => (
        <FloatingOrb key={i} {...orb} />
      ))}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 20, paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={handleHiddenTap} testID="settings-btn">
          <Text style={styles.appTitle}>GoBuddyGo</Text>
          <Text style={styles.appSubtitle}>⭐ CO-PILOT MODE ⭐</Text>
        </Pressable>

        <View style={styles.nameCard}>
          <Text style={styles.namePrompt}>ENTER YOUR NAME, BUDDY!</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Type your name here..."
            placeholderTextColor={Colors.textMuted}
            onSubmitEditing={() => handleSaveName(name)}
            onBlur={() => handleSaveName(name)}
            returnKeyType="done"
            testID="name-input"
            autoCorrect={false}
          />
        </View>

        {totalSessions > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statTile, { borderColor: Colors.accentBlue + "55" }]}>
              <View style={[styles.statIconCircle, { backgroundColor: Colors.accentBlue + "22" }]}>
                <Ionicons name="car-sport" size={22} color={Colors.accentBlue} />
              </View>
              <Text style={[styles.statValue, { color: Colors.accentBlue }]}>{totalSessions}</Text>
              <Text style={styles.statLabel}>RIDES</Text>
            </View>
            <View style={[styles.statTile, { borderColor: Colors.accent + "55" }]}>
              <View style={[styles.statIconCircle, { backgroundColor: Colors.accent + "22" }]}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
              </View>
              <Text style={[styles.statValue, { color: Colors.accent }]}>{totalMissions}</Text>
              <Text style={styles.statLabel}>MISSIONS</Text>
            </View>
            <View style={[styles.statTile, { borderColor: Colors.secondary + "55" }]}>
              <View style={[styles.statIconCircle, { backgroundColor: Colors.secondary + "22" }]}>
                <Ionicons name="star" size={22} color={Colors.secondary} />
              </View>
              <Text style={[styles.statValue, { color: Colors.secondary }]}>{totalBadges}</Text>
              <Text style={styles.statLabel}>BADGES</Text>
            </View>
          </View>
        )}

        {missionWarning && (
          <View style={styles.missionWarningBanner}>
            <Ionicons name="warning" size={20} color={Colors.secondary} />
            <Text style={styles.missionWarningText}>
              Enable at least 3 missions in Parent Mode first!
            </Text>
          </View>
        )}

        <Animated.View style={[styles.startButtonWrap, { transform: [{ scale: buttonScale }] }]}>
          <Pressable onPress={handleStartSession} testID="start-session-btn">
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <Ionicons name="play-circle" size={32} color="#FFFFFF" />
              <Text style={styles.startButtonText}>START MISSION!</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Pressable onPress={() => router.push("/parent-mode")} style={styles.parentModeBtn} testID="parent-mode-btn">
          <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
          <Text style={styles.parentModeBtnText}>PARENT MODE</Text>
        </Pressable>

        {sessionHistory.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>⏱ RECENT RIDES</Text>
            {sessionHistory.slice(0, 3).map((session, idx) => (
              <View
                key={session.id}
                style={[
                  styles.sessionCard,
                  idx === 0 && styles.sessionCardFirst,
                ]}
              >
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.sessionStats}>
                    {session.missionsCompleted}/{session.totalMissions} MISSIONS ·{" "}
                    {Math.floor(session.durationSeconds / 60)}m
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <View style={styles.pctCircle}>
                    <Text style={styles.pctText}>
                      {session.totalMissions > 0
                        ? Math.round(
                            (session.missionsCompleted / session.totalMissions) * 100
                          )
                        : 0}%
                    </Text>
                  </View>
                  <View style={styles.sessionBadges}>
                    {session.badges.slice(0, 3).map((b) => (
                      <Ionicons key={b.id} name="star" size={14} color={Colors.secondary} />
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbContainer: {
    position: "absolute",
    zIndex: 0,
  },
  orbCircle: {
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  scroll: {
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 1,
  },
  appTitle: {
    color: Colors.text,
    fontSize: 42,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 4,
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: Colors.primary + "88",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  appSubtitle: {
    color: Colors.secondary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginBottom: 32,
    textAlign: "center",
  },
  nameCard: {
    width: "100%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  namePrompt: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: "center",
  },
  nameInput: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 22,
    color: Colors.text,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    borderWidth: 2,
    borderColor: Colors.primary,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
    width: "100%",
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 2,
    gap: 6,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    lineHeight: 30,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  missionWarningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.secondary + "22",
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
    width: "100%",
  },
  missionWarningText: {
    flex: 1,
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  startButtonWrap: {
    width: width - 40,
    borderRadius: 50,
    overflow: "hidden",
    ...GlowShadows.strong,
    marginBottom: 14,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 22,
    borderRadius: 50,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  parentModeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  parentModeBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  recentSection: {
    width: "100%",
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  sessionCardFirst: {
    borderColor: Colors.primary + "88",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionInfo: {
    flex: 1,
    gap: 3,
  },
  sessionDate: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  sessionStats: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  sessionRight: {
    alignItems: "center",
    gap: 4,
  },
  pctCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  pctText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },
  sessionBadges: {
    flexDirection: "row",
    gap: 2,
  },
});
