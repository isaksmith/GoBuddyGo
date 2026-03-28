import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeCard } from "@/components/BadgeCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const { sessionMissions, currentBadges, settings, endSession, sessionActive } = useApp();
  const heroScale = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const [sharing, setSharing] = useState(false);

  const completed = sessionMissions.filter((m) => m.completed).length;
  const total = sessionMissions.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const native = Platform.OS !== "web";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(heroScale, { toValue: 1, tension: 100, friction: 7, useNativeDriver: native }),
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, useNativeDriver: native }),
    ]).start();
  }, []);

  const handleDone = async () => {
    if (sessionActive) {
      await endSession();
    }
    router.replace("/");
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const driverLine = settings.childName ? `Driver: ${settings.childName}` : "";
      const badgeLines = currentBadges.length > 0
        ? `Badges earned: ${currentBadges.map((b) => b.title).join(", ")}`
        : "Keep going — badges await next time!";
      const missionLines = sessionMissions
        .map((m) => `${m.completed ? "✅" : "⬜"} ${m.title}`)
        .join("\n");

      const text = [
        "🚗 GoBabyGo Buddy-Link Co-Pilot Report 🚗",
        driverLine,
        "",
        `Missions: ${completed}/${total} complete (${pct}%)`,
        "",
        missionLines,
        "",
        badgeLines,
      ]
        .filter(Boolean)
        .join("\n");

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(
          `data:text/plain;base64,${btoa(unescape(encodeURIComponent(text)))}`,
          { mimeType: "text/plain", dialogTitle: "Share your Co-Pilot recap!" }
        );
      } else {
        console.log("Sharing not available on this platform");
      }
    } catch (_e) {
    } finally {
      setSharing(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.background, "#0A2233", Colors.backgroundMid]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: heroOpacity, transform: [{ scale: heroScale }] },
          ]}
        >
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={64} color={Colors.secondary} />
          </View>
          <Text style={styles.heroTitle}>Mission Complete!</Text>
          {settings.childName ? (
            <Text style={styles.heroSubtitle}>
              Great co-pilot session with {settings.childName}!
            </Text>
          ) : (
            <Text style={styles.heroSubtitle}>Amazing co-pilot work!</Text>
          )}
        </Animated.View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreMain}>
            <Text style={styles.scoreValue}>{completed}</Text>
            <Text style={styles.scoreLabel}>of {total} missions</Text>
          </View>
          <View style={styles.scoreDivider} />
          <View style={styles.scoreSecondary}>
            <Ionicons name="checkmark-circle" size={36} color={Colors.accent} />
            <Text style={styles.scorePct}>{pct}%</Text>
          </View>
        </View>

        {sessionMissions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You Did</Text>
            {sessionMissions.map((m) => (
              <View key={m.id} style={styles.missionRow}>
                <Ionicons
                  name={m.completed ? "checkmark-circle" : "close-circle"}
                  size={22}
                  color={m.completed ? Colors.accent : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.missionRowText,
                    !m.completed && styles.missionRowMuted,
                  ]}
                >
                  {m.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {currentBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges Earned</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesScroll}
            >
              {currentBadges.map((badge, i) => (
                <BadgeCard key={badge.id} badge={badge} index={i} />
              ))}
            </ScrollView>
          </View>
        )}

        {currentBadges.length === 0 && (
          <View style={styles.encourageCard}>
            <Ionicons name="heart" size={28} color={Colors.primary} />
            <Text style={styles.encourageText}>
              Keep going! More badges await next session
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
          disabled={sharing}
          testID="share-recap-btn"
        >
          <Ionicons name="share-social" size={20} color={Colors.secondary} />
          <Text style={styles.shareBtnText}>
            {sharing ? "Sharing..." : "Share Recap"}
          </Text>
        </Pressable>

        <Pressable onPress={handleDone} style={styles.doneBtn} testID="done-btn">
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneBtnGradient}
          >
            <Ionicons name="home" size={22} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 209, 102, 0.1)",
    borderWidth: 3,
    borderColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
  },
  scoreCard: {
    width: "100%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreMain: {
    flex: 1,
    alignItems: "center",
  },
  scoreValue: {
    color: Colors.primary,
    fontSize: 56,
    fontFamily: "Nunito_700Bold",
    lineHeight: 60,
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  scoreDivider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.border,
  },
  scoreSecondary: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  scorePct: {
    color: Colors.accent,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 14,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  missionRowText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  missionRowMuted: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  badgesScroll: {
    paddingBottom: 4,
  },
  encourageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  encourageText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    lineHeight: 22,
  },
  shareBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.secondary,
    backgroundColor: "rgba(255, 209, 102, 0.08)",
  },
  shareBtnDisabled: {
    opacity: 0.5,
  },
  shareBtnText: {
    color: Colors.secondary,
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
  },
  doneBtn: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  doneBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
  },
});
