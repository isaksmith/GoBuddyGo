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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

function StatBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statBadge, { borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, sessionHistory } = useApp();
  const [name, setName] = useState(settings.childName);
  const [editingName, setEditingName] = useState(false);
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === "web") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rocketAnim, { toValue: -12, duration: 1500, useNativeDriver: true }),
        Animated.timing(rocketAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handleSaveName = async () => {
    await updateSettings({ childName: name.trim() });
    setEditingName(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartSession = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const native = Platform.OS !== "web";
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.94, duration: 80, useNativeDriver: native }),
      Animated.timing(buttonScale, { toValue: 1, duration: 120, useNativeDriver: native }),
    ]).start(() => router.push("/ar"));
  };

  const totalSessions = sessionHistory.length;
  const totalBadges = sessionHistory.reduce((sum, s) => sum + s.badges.length, 0);
  const totalMissions = sessionHistory.reduce((sum, s) => sum + s.missionsCompleted, 0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, "#0A2233"]}
      style={[styles.container, { paddingTop: topPad }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.push("/parent-mode")}
            style={styles.settingsBtn}
            testID="settings-btn"
          >
            <Ionicons name="lock-closed" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        <Animated.View style={[styles.rocketContainer, { transform: [{ translateY: rocketAnim }] }]}>
          <Ionicons name="rocket" size={80} color={Colors.primary} />
        </Animated.View>

        <Text style={styles.appTitle}>Buddy-Link</Text>
        <Text style={styles.appSubtitle}>Co-Pilot Mode</Text>

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
              <Text style={styles.nameLabel}>
                {settings.childName ? `Driver: ${settings.childName}` : "Tap to set driver name"}
              </Text>
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </Pressable>
          )}
        </View>

        {totalSessions > 0 && (
          <View style={styles.statsRow}>
            <StatBadge label="Sessions" value={String(totalSessions)} color={Colors.accentBlue} />
            <StatBadge label="Missions" value={String(totalMissions)} color={Colors.accent} />
            <StatBadge label="Badges" value={String(totalBadges)} color={Colors.secondary} />
          </View>
        )}

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <Pressable onPress={handleStartSession} style={styles.startButton} testID="start-session-btn">
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Ionicons name="play" size={28} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Mission</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {sessionHistory.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {sessionHistory.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.sessionStats}>
                    {session.missionsCompleted}/{session.totalMissions} missions
                    {" · "}
                    {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
                  </Text>
                </View>
                <View style={styles.sessionBadges}>
                  {session.badges.map((b) => (
                    <Ionicons key={b.id} name="star" size={16} color={Colors.secondary} />
                  ))}
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
    paddingHorizontal: 24,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 12,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rocketContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  appTitle: {
    color: Colors.text,
    fontSize: 38,
    fontFamily: "Nunito_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSubtitle: {
    color: Colors.primary,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 32,
  },
  nameSection: {
    width: "100%",
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nameLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  nameInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  saveBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statBadge: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    marginBottom: 2,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
  startButton: {
    width: width - 48,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 32,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: -0.3,
  },
  recentSection: {
    width: "100%",
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    color: Colors.text,
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 2,
  },
  sessionStats: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
  sessionBadges: {
    flexDirection: "row",
    gap: 4,
  },
});
