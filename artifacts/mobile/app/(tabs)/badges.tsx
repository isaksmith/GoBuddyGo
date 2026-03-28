import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const { sessionHistory } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const allBadges = sessionHistory.flatMap((s) =>
    s.badges.map((b) => ({ ...b, date: s.date }))
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.replace("/")} style={styles.backBtn} hitSlop={12} testID="badges-home-btn">
          <Ionicons name="arrow-back" size={26} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>⭐ Badges</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{allBadges.length} EARNED</Text>
        </View>
      </View>

      <FlatList
        data={allBadges}
        keyExtractor={(_, i) => String(i)}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="star-outline" size={52} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>NO BADGES YET</Text>
            <Text style={styles.emptySubtitle}>
              Complete missions to earn badges!
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.badgeCard}>
            <View style={styles.badgeIconCircle}>
              <Ionicons name="star" size={36} color={Colors.secondary} />
            </View>
            <Text style={styles.badgeTitle}>{item.title.toUpperCase()}</Text>
            <Text style={styles.badgeDate}>
              {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </Text>
          </View>
        )}
      />
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
    paddingBottom: 16,
    gap: 10,
  },
  backBtn: {
    marginRight: 2,
  },
  headerTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
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
    paddingBottom: 40,
    gap: 12,
  },
  badgeCard: {
    flex: 1,
    margin: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.secondary + "44",
  },
  badgeIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.secondary + "18",
    borderWidth: 2,
    borderColor: Colors.secondary + "55",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeTitle: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    textAlign: "center",
  },
  badgeDate: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginTop: 4,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 21,
  },
});
