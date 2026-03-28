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

const { width } = Dimensions.get("window");

function StatTile({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View style={[styles.statTile, { borderColor: color + "55" }]}>
      <View style={[styles.statIconCircle, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, sessionHistory, missions } = useApp();
  const [name, setName] = useState(settings.childName);
  const [editingName, setEditingName] = useState(false);
  const [missionWarning, setMissionWarning] = useState(false);
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const rocketGlow = useRef(new Animated.Value(0.6)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const hiddenTapCount = useRef(0);
  const hiddenTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableMissionCount = countAvailableSessionMissions(missions, settings);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, { toValue: -14, duration: 1400, useNativeDriver: true }),
        Animated.timing(rocketAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(rocketGlow, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ])
    );
    glowLoop.start();

    return () => {
      loop.stop();
      glowLoop.stop();
    };
  }, []);

  const handleSaveName = async () => {
    await updateSettings({ childName: name.trim() });
    setEditingName(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    const native = Platform.OS !== "web";
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.92, duration: 80, useNativeDriver: native }),
      Animated.timing(buttonScale, { toValue: 1, duration: 140, useNativeDriver: native }),
    ]).start(() => router.push("/ar"));
  };

  const totalSessions = sessionHistory.length;
  const totalBadges = sessionHistory.reduce((sum, s) => sum + s.badges.length, 0);
  const totalMissions = sessionHistory.reduce((sum, s) => sum + s.missionsCompleted, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={[styles.container, { paddingTop: topPad }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[styles.rocketContainer, { transform: [{ translateY: rocketAnim }] }]}
        >
          <Animated.View
            style={[styles.rocketGlowRing, { opacity: rocketGlow }]}
          />
          <View style={styles.rocketCircle}>
            <Ionicons name="rocket" size={56} color={Colors.primary} />
          </View>
        </Animated.View>

        <Text style={styles.appTitle}>BUDDY-LINK</Text>
        <Pressable onPress={handleHiddenTap} testID="settings-btn">
          <Text style={styles.appSubtitle}>⭐ CO-PILOT MODE ⭐</Text>
        </Pressable>

        <View style={styles.nameSection}>
          {editingName ? (
            <View style={styles.nameInputRow}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Driver's name..."
                placeholderTextColor={Colors.textMuted}
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
                testID="name-input"
              />
              <Pressable onPress={handleSaveName} style={styles.saveBtn}>
                <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={styles.nameRow}>
              <Ionicons name="person-circle" size={24} color={Colors.accentBlue} />
              <Text style={styles.nameLabel}>
                {settings.childName
                  ? `DRIVER: ${settings.childName.toUpperCase()}`
                  : "TAP TO SET DRIVER NAME"}
              </Text>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </Pressable>
          )}
        </View>

        {totalSessions > 0 && (
          <View style={styles.statsRow}>
            <StatTile
              label="Rides"
              value={String(totalSessions)}
              icon="car-sport"
              color={Colors.accentBlue}
            />
            <StatTile
              label="Missions"
              value={String(totalMissions)}
              icon="checkmark-circle"
              color={Colors.accent}
            />
            <StatTile
              label="Badges"
              value={String(totalBadges)}
              icon="star"
              color={Colors.secondary}
            />
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
  scroll: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  rocketContainer: {
    marginTop: 32,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rocketGlowRing: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.primary + "33",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 0,
  },
  rocketCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 12,
  },
  appTitle: {
    color: Colors.text,
    fontSize: 40,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 4,
    marginBottom: 4,
    textShadowColor: Colors.primary + "88",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  appSubtitle: {
    color: Colors.secondary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginBottom: 28,
  },
  nameSection: {
    width: "100%",
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  nameLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },
  nameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 22,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  saveBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
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
    marginBottom: 32,
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
