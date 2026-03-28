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

function GoldCoinIcon({ size = 40 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#D4A017",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFE066",
        shadowColor: "#F5C518",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 6,
      }}
    >
      <View
        style={{
          width: size * 0.68,
          height: size * 0.68,
          borderRadius: (size * 0.68) / 2,
          backgroundColor: "#F5C518",
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: "#FFE566",
        }}
      >
        <Text
          style={{
            color: "#7A5000",
            fontFamily: "Nunito_700Bold",
            fontSize: size * 0.36,
          }}
        >
          $
        </Text>
      </View>
    </View>
  );
}

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

const FEATURED_GAMES = [
  {
    id: "race",
    title: "Race",
    description: "Start your engines! Hit the gas at the green light and nail a pit stop.",
    emoji: "🏎️",
    colors: ["#F5C518CC", "#D4A80033"] as [string, string],
    accentColor: "#F5C518",
    borderColor: "#F5C51855",
    isGoldCoin: false,
  },
  {
    id: "coin-dash",
    title: "Coin Dash",
    description: "Drive your car around and collect coins with the D-pad!",
    emoji: "",
    colors: ["#3ECF8ECC", "#2DB87A33"] as [string, string],
    accentColor: "#3ECF8E",
    borderColor: "#3ECF8E55",
    isGoldCoin: true,
  },
];

const MINI_GAMES = [
  { id: "m1", emoji: "📣", label: "Cheer!", color: "#EF476F" },
  { id: "m2", emoji: "🖐️", label: "High Five!", color: "#F5C518" },
  { id: "m4", emoji: "🎵", label: "Dance!", color: "#9B5DE5" },
  { id: "m5", emoji: "👍", label: "Thumbs Up!", color: "#3ECF8E" },
  { id: "m8", emoji: "🔢", label: "Count!", color: "#4FC3F7" },
  { id: "m9", emoji: "🏆", label: "Lap Cheer!", color: "#F4633A" },
];

export default function GamesScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useApp();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const homeBtnBottom = insets.bottom + 82;

  const handlePlay = useCallback((gameId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (gameId === "coin-dash") {
      router.push("/coin-dash");
    } else if (gameId === "race") {
      router.push("/race");
    } else {
      router.push({ pathname: "/ar", params: { missionId: gameId } });
    }
  }, []);

  const enabledIds = settings.enabledMissionIds;

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
        {/* ── GAMES section ─────────────────────────────────── */}
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

        {FEATURED_GAMES.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => handlePlay(game.id)}
            style={({ pressed }) => [
              styles.featuredCard,
              { borderColor: game.borderColor },
              pressed && styles.featuredCardPressed,
            ]}
            testID={`game-${game.id}`}
          >
            <LinearGradient
              colors={game.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredCardGradient}
            >
              <View style={[styles.featuredIconCircle, { backgroundColor: game.accentColor + "20", borderColor: game.accentColor + "55" }]}>
                {game.isGoldCoin ? (
                  <GoldCoinIcon size={48} />
                ) : (
                  <Text style={styles.featuredEmoji}>{game.emoji}</Text>
                )}
              </View>
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredTitle}>{game.title}</Text>
                <Text style={styles.featuredDesc}>{game.description}</Text>
                <View style={styles.featuredPlayRow}>
                  <View style={[styles.featuredPlayBtn, { backgroundColor: game.accentColor }]}>
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.featuredPlayText}>PLAY NOW</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}

        {/* ── MINI GAMES section ────────────────────────────── */}
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
        </View>

        <View style={styles.miniGrid}>
          {MINI_GAMES.filter((g) => enabledIds.includes(g.id)).map((game) => (
            <Pressable
              key={game.id}
              onPress={() => handlePlay(game.id)}
              style={({ pressed }) => [
                styles.miniCard,
                { backgroundColor: game.color },
                pressed && styles.miniCardPressed,
              ]}
              testID={`game-${game.id}`}
            >
              <Text style={styles.miniEmoji}>{game.emoji}</Text>
              <Text style={styles.miniLabel}>{game.label}</Text>
            </Pressable>
          ))}
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
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
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  featuredEmoji: {
    fontSize: 40,
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
  miniGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  miniCard: {
    width: "47%",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  miniCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  miniEmoji: {
    fontSize: 42,
  },
  miniLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
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
