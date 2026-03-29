import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import { Colors } from "@/constants/colors";
import { BADGE_REGISTRY, BADGE_UNLOCK_ORDER, DEFAULT_UNLOCKED_COUNT, BadgeMeta, resolveId } from "@/constants/badgeRegistry";
import { useApp } from "@/context/AppContext";
import { useTextScale } from "@/hooks/useTextScale";

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
      testID="home-btn-badges"
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

interface GalleryItem {
  meta: BadgeMeta;
  earnedDate: number | null;
}

function BadgeGridCard({ item, textScale }: { item: GalleryItem; textScale: number }) {
  const { meta, earnedDate } = item;
  const earned = earnedDate !== null;
  const { gradientColors, SvgComponent } = meta;

  return (
    <LinearGradient
      colors={
        earned
          ? [gradientColors[0] + "44", gradientColors[1] + "22"]
          : [gradientColors[0] + "33", gradientColors[1] + "22"]
      }
      style={[styles.badgeCard, !earned && styles.badgeCardLocked, !earned && { borderColor: gradientColors[0] + "66" }]}
    >
      <View
        style={[
          styles.badgeIconCircle,
          earned
            ? { borderColor: gradientColors[0] + "99", shadowColor: gradientColors[0] }
            : { borderColor: gradientColors[0] + "55", shadowColor: "transparent" },
          !earned && styles.badgeIconCircleLocked,
        ]}
      >
        <View style={!earned ? styles.lockedSvgWrapper : undefined}>
          <SvgComponent />
        </View>
        {!earned && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.badgeTitle,
          { fontSize: 13 * textScale },
          !earned && styles.badgeTitleLocked,
        ]}
      >
        {meta.title.toUpperCase()}
      </Text>
      {earned ? (
        <Text style={[styles.badgeDate, { fontSize: 11 * textScale }]}>
          {new Date(earnedDate!).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </Text>
      ) : (
        <Text style={[styles.badgeUnearned, { fontSize: 10 * textScale, color: gradientColors[0] + "BB" }]}>NOT YET EARNED</Text>
      )}
    </LinearGradient>
  );
}

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { sessionHistory, gamesPlayed } = useApp();
  const textScale = useTextScale();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const homeBtnBottom = insets.bottom + 82;
  const numCols = width > 600 ? 3 : 2;
  const hPad = width > 600 ? 20 : 12;

  const unlockedCount = Math.min(DEFAULT_UNLOCKED_COUNT + gamesPlayed, BADGE_UNLOCK_ORDER.length);
  const unlockedSet = new Set(BADGE_UNLOCK_ORDER.slice(0, unlockedCount));

  const earnedMap: Record<string, number> = {};
  for (const session of sessionHistory) {
    for (const badge of session.badges) {
      const resolvedId = resolveId(badge.id);
      if (earnedMap[resolvedId] === undefined || session.date < earnedMap[resolvedId]) {
        earnedMap[resolvedId] = session.date;
      }
    }
  }

  const galleryItems: GalleryItem[] = BADGE_UNLOCK_ORDER.map((id) => {
    const meta = BADGE_REGISTRY[id];
    const isUnlocked = unlockedSet.has(id);
    return {
      meta,
      earnedDate: isUnlocked ? (earnedMap[id] ?? Date.now()) : null,
    };
  });

  const earnedCount = galleryItems.filter((i) => i.earnedDate !== null).length;

  return (
    <AppBackground>
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hPad }]}>
        <Ionicons name="trophy" size={26} color={Colors.primary} />
        <Text style={[styles.headerTitle, { fontSize: 32 * textScale }]}>BADGES</Text>
        <View style={styles.countPill}>
          <Text style={[styles.countText, { fontSize: 11 * textScale }]}>
            {earnedCount}/{galleryItems.length} EARNED
          </Text>
        </View>
      </View>

      <FlatList
        data={galleryItems}
        keyExtractor={(item) => item.meta.id}
        numColumns={numCols}
        key={String(numCols)}
        contentContainerStyle={[styles.list, { paddingBottom: homeBtnBottom + 76, paddingHorizontal: hPad }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <BadgeGridCard item={item} textScale={textScale} />}
      />

      <HomeButton bottomOffset={homeBtnBottom} />
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 32,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 3,
  },
  countPill: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 2,
    borderColor: Colors.secondary + "55",
  },
  countText: {
    color: Colors.secondary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: 12,
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    margin: 6,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  badgeCardLocked: {
    borderColor: Colors.border,
  },
  badgeIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  badgeIconCircleLocked: {
    shadowOpacity: 0,
    elevation: 0,
  },
  lockedSvgWrapper: {
    opacity: 0.55,
  },
  lockOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  badgeTitle: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    textAlign: "center",
  },
  badgeTitleLocked: {
    color: Colors.textMuted,
  },
  badgeDate: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
  },
  badgeUnearned: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_400Regular",
    letterSpacing: 0.5,
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
