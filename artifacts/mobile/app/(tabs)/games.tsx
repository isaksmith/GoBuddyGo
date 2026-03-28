import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

function HomeButton({ bottomOffset }: { bottomOffset: number }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace("/");
      }}
      style={({ pressed }) => [
        styles.homeBtn,
        { bottom: bottomOffset },
        pressed && styles.homeBtnPressed,
      ]}
      testID="home-btn-games"
    >
      <LinearGradient
        colors={["#F4633A", "#C13E20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.homeBtnGradient}
      >
        <Ionicons name="home" size={28} color="#FFFFFF" />
        <Text style={styles.homeBtnText}>HOME</Text>
      </LinearGradient>
    </Pressable>
  );
}

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { missions, settings } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const homeBtnBottom = insets.bottom + 82;

  const handlePlay = useCallback((missionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (missionId === "coin-dash") {
      router.push("/coin-dash");
    } else {
      router.push({ pathname: "/ar", params: { missionId } });
    }
  }, []);

  const enabledIds = settings.enabledMissionIds;

  const mediumGames = missions.filter(
    (m) => m.enabled && enabledIds.includes(m.id) && m.difficulty === "medium"
  );

  const easyGames = missions.filter(
    (m) => m.enabled && enabledIds.includes(m.id) && m.difficulty === "easy"
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Ionicons name="game-controller" size={26} color={Colors.primary} />
        <Text style={styles.headerTitle}>GAMES</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: homeBtnBottom + 76 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── GAMES section (medium) ─────────────────────────── */}
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={["#F5C518", "#D4A800"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionBadge}
          >
            <Ionicons name="flash" size={14} color="#FFF" />
            <Text style={styles.sectionBadgeText}>GAMES</Text>
          </LinearGradient>
        </View>

        {mediumGames.length > 0 ? (
          mediumGames.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => handlePlay(game.id)}
              style={({ pressed }) => [
                styles.featuredCard,
                pressed && styles.featuredCardPressed,
              ]}
              testID={`game-${game.id}`}
            >
              <LinearGradient
                colors={["#F5C518CC", "#D4A80033"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featuredCardGradient}
              >
                <View style={styles.featuredIconCircle}>
                  <Ionicons
                    name={(game.icon as keyof typeof Ionicons.glyphMap) ?? "game-controller"}
                    size={46}
                    color="#F5C518"
                  />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredTitle}>{game.title}</Text>
                  <Text style={styles.featuredDesc}>{game.description}</Text>
                  <View style={styles.featuredPlayRow}>
                    <View style={styles.featuredPlayBtn}>
                      <Ionicons name="play" size={14} color="#FFFFFF" />
                      <Text style={styles.featuredPlayText}>PLAY NOW</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="time-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>More games coming soon!</Text>
          </View>
        )}

        {/* ── MINI GAMES section (easy) ──────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <LinearGradient
            colors={["#3ECF8E", "#2DB87A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionBadge}
          >
            <Ionicons name="star" size={14} color="#FFF" />
            <Text style={styles.sectionBadgeText}>MINI GAMES</Text>
          </LinearGradient>
          <Text style={styles.sectionSub}>Fun for everyone!</Text>
        </View>

        {easyGames.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => handlePlay(game.id)}
            style={({ pressed }) => [
              styles.miniCard,
              pressed && styles.miniCardPressed,
            ]}
            testID={`game-${game.id}`}
          >
            <View style={styles.miniIconCircle}>
              <Ionicons
                name={(game.icon as keyof typeof Ionicons.glyphMap) ?? "star"}
                size={28}
                color="#3ECF8E"
              />
            </View>
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle}>{game.title}</Text>
              <Text style={styles.miniDesc} numberOfLines={1}>{game.description}</Text>
            </View>
            <View style={styles.miniPlayBtn}>
              <Ionicons name="play-circle" size={38} color="#3ECF8E" />
            </View>
          </Pressable>
        ))}

        {easyGames.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="star-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No mini games available</Text>
          </View>
        )}
      </ScrollView>

      <HomeButton bottomOffset={homeBtnBottom} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  sectionSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F5C51855",
    shadowColor: "#F5C518",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    backgroundColor: Colors.backgroundCard,
  },
  featuredCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  featuredCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  featuredIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5C51820",
    borderWidth: 2,
    borderColor: "#F5C51855",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  featuredInfo: {
    flex: 1,
    gap: 6,
  },
  featuredTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  featuredDesc: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    lineHeight: 18,
  },
  featuredPlayRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  featuredPlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5C518",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  featuredPlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  miniCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#3ECF8E33",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  miniCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  miniIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#3ECF8E18",
    borderWidth: 1.5,
    borderColor: "#3ECF8E44",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  miniInfo: {
    flex: 1,
    gap: 3,
  },
  miniTitle: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  miniDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
  },
  miniPlayBtn: {
    flexShrink: 0,
  },
  emptyCard: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },
  homeBtn: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#F4633A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
    zIndex: 100,
  },
  homeBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  homeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  homeBtnText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
});
