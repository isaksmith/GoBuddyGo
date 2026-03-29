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
  useWindowDimensions,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeCard } from "@/components/BadgeCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTextScale } from "@/hooks/useTextScale";

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const textScale = useTextScale();
  const { lastSessionResult, sessionHistory, settings } = useApp();
  const heroScale = useRef(new Animated.Value(0)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const recapRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const latestHistory = sessionHistory.length > 0 ? sessionHistory[0] : null;
  const result = lastSessionResult ?? (latestHistory
    ? {
        completed: latestHistory.missionsCompleted,
        total: latestHistory.totalMissions,
        missions: [],
        badges: latestHistory.badges,
        childName: latestHistory.childName,
        driverName: latestHistory.driverName ?? "",
        durationSeconds: latestHistory.durationSeconds,
      }
    : null);
  const completed = result?.completed ?? 0;
  const total = result?.total ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const missions = result?.missions ?? [];
  const badges = result?.badges ?? [];
  const siblingName = result?.childName ?? settings.childName ?? "";
  const driverName = result?.driverName ?? settings.driverName ?? "";

  const native = Platform.OS !== "web";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const contentMaxWidth = Math.min(width, 700);
  const hPad = width > 600 ? 32 : 20;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        tension: 100,
        friction: 7,
        useNativeDriver: native,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: native,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    router.replace("/");
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const canShare = await Sharing.isAvailableAsync();

      if (Platform.OS !== "web" && canShare && recapRef.current) {
        const uri = await (
          recapRef.current as ViewShot & { capture: () => Promise<string> }
        ).capture();
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your Co-Pilot recap!",
        });
      } else {
        const driverLine = driverName ? `Driver: ${driverName}` : (siblingName ? `Co-Pilot: ${siblingName}` : "");
        const badgeLines =
          badges.length > 0
            ? `Badges: ${badges.map((b) => b.title).join(", ")}`
            : "More badges await next session!";
        const text = [
          "🚗 GoBabyGo Buddy-Link Co-Pilot Recap 🚗",
          driverLine,
          `Missions: ${completed}/${total} complete (${pct}%)`,
          badgeLines,
        ]
          .filter(Boolean)
          .join("\n");

        if (canShare) {
          let base64 = "";
          try {
            const bytes = new TextEncoder().encode(text);
            let binary = "";
            bytes.forEach((b) => (binary += String.fromCharCode(b)));
            base64 = btoa(binary);
          } catch (_e) {
            base64 = btoa(text.replace(/[^\x00-\x7F]/g, "?"));
          }
          await Sharing.shareAsync(`data:text/plain;base64,${base64}`, {
            mimeType: "text/plain",
            dialogTitle: "Share your Co-Pilot recap!",
          });
        }
      }
    } catch (_e) {
      setShareError("Sharing failed. Please try again.");
      setTimeout(() => setShareError(null), 3000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 50, paddingHorizontal: hPad, alignSelf: "center", width: contentMaxWidth },
        ]}
        showsVerticalScrollIndicator={false}
        style={{ width: "100%" }}
      >
        <ViewShot
          ref={recapRef}
          options={{ format: "png", quality: 0.95 }}
          style={styles.recapCard}
        >
          <LinearGradient
            colors={[Colors.backgroundCard, Colors.backgroundDeep]}
            style={styles.recapInner}
          >
            <Animated.View
              style={[
                styles.heroSection,
                { opacity: heroOpacity, transform: [{ scale: heroScale }] },
              ]}
            >
              <View style={styles.trophyGlowRing}>
                <LinearGradient
                  colors={[Colors.secondary + "55", Colors.secondary + "11"]}
                  style={styles.trophyGlowInner}
                />
              </View>
              <View style={styles.trophyCircle}>
                <Ionicons name="trophy" size={62} color={Colors.secondary} />
              </View>
              <Text style={[styles.heroTitle, { fontSize: 28 * textScale }]}>MISSION COMPLETE!</Text>
              <Text style={[styles.heroSubtitle, { fontSize: 15 * textScale }]}>
                {siblingName
                  ? `Amazing co-pilot session${driverName ? ` with ${driverName}` : ""}!`
                  : "Amazing co-pilot work! 🚀"}
              </Text>
            </Animated.View>

            <View style={styles.scoreCard}>
              <View style={styles.scoreMain}>
                <Text style={styles.scoreValue}>{completed}</Text>
                <Text style={styles.scoreDividerText}>/ {total}</Text>
                <Text style={styles.scoreLabel}>MISSIONS</Text>
              </View>
              <View style={styles.scoreDivider} />
              <View style={styles.scoreSecondary}>
                <View
                  style={[
                    styles.pctCircle,
                    {
                      backgroundColor:
                        pct >= 80
                          ? Colors.accent
                          : pct >= 50
                          ? Colors.secondary
                          : Colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
                <Text style={styles.scoreLabel}>SCORE</Text>
              </View>
            </View>

            {missions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 13 * textScale }]}>WHAT YOU DID</Text>
                {missions.map((m) => (
                  <View
                    key={m.id}
                    style={[
                      styles.missionRow,
                      m.completed && styles.missionRowDone,
                    ]}
                  >
                    <View
                      style={[
                        styles.missionRowIcon,
                        {
                          backgroundColor: m.completed
                            ? Colors.accent + "22"
                            : Colors.textMuted + "22",
                        },
                      ]}
                    >
                      <Ionicons
                        name={m.completed ? "checkmark-circle" : "close-circle"}
                        size={20}
                        color={m.completed ? Colors.accent : Colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.missionRowText,
                        !m.completed && styles.missionRowMuted,
                      ]}
                    >
                      {m.title.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {badges.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { fontSize: 13 * textScale }]}>🏅 BADGES EARNED</Text>
                <View style={styles.badgesGrid}>
                  {badges.map((badge, i) => (
                    <BadgeCard key={badge.id} badge={badge} index={i} />
                  ))}
                </View>
              </View>
            )}

            {badges.length === 0 && (
              <View style={styles.encourageCard}>
                <Ionicons name="heart" size={30} color={Colors.primary} />
                <Text style={styles.encourageText}>
                  Keep going! More badges await next session! 🌟
                </Text>
              </View>
            )}
          </LinearGradient>
        </ViewShot>

        {shareError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
            <Text style={styles.errorBannerText}>{shareError}</Text>
          </View>
        )}

        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
          disabled={sharing}
          testID="share-recap-btn"
        >
          <Ionicons name="share-social" size={22} color={Colors.secondary} />
          <Text style={styles.shareBtnText}>
            {sharing ? "SHARING..." : "SHARE RECAP"}
          </Text>
        </Pressable>

        <Pressable onPress={handleDone} style={styles.doneBtn} testID="done-btn">
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.doneBtnGradient}
          >
            <Ionicons name="home" size={22} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>BACK TO HOME!</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    alignItems: "center",
  },
  recapCard: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  recapInner: {
    padding: 24,
    alignItems: "center",
    borderRadius: 26,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  trophyGlowRing: {
    position: "absolute",
    top: -10,
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: "hidden",
  },
  trophyGlowInner: {
    width: "100%",
    height: "100%",
    borderRadius: 80,
  },
  trophyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary + "18",
    borderWidth: 4,
    borderColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 14,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: Colors.secondary + "66",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  scoreCard: {
    width: "100%",
    backgroundColor: Colors.background,
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreMain: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  scoreValue: {
    color: Colors.primary,
    fontSize: 68,
    fontFamily: "Nunito_700Bold",
    lineHeight: 72,
  },
  scoreDividerText: {
    color: Colors.textMuted,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginTop: 2,
  },
  scoreDivider: {
    width: 1.5,
    height: 80,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  scoreSecondary: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  pctCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  pctText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
  },
  section: {
    width: "100%",
    marginBottom: 22,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  missionRowDone: {
    opacity: 0.85,
  },
  missionRowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  missionRowText: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    flex: 1,
  },
  missionRowMuted: {
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  encourageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%",
    backgroundColor: Colors.primary + "18",
    borderRadius: 22,
    padding: 18,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primary + "55",
  },
  encourageText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    lineHeight: 22,
  },
  shareBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 50,
    paddingVertical: 18,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + "15",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  shareBtnDisabled: {
    opacity: 0.5,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderWidth: 1.5,
    borderColor: "#FF6B6B",
    borderRadius: 50,
    padding: 14,
    marginBottom: 8,
    width: "100%",
  },
  errorBannerText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    flex: 1,
  },
  shareBtnText: {
    color: Colors.secondary,
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  doneBtn: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  doneBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
});
