import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const { sessionHistory } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const homeBtnBottom = insets.bottom + 82;

  const allBadges = sessionHistory.flatMap((s) =>
    s.badges.map((b) => ({ ...b, date: s.date }))
  );

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>⭐ Badges</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{allBadges.length} EARNED</Text>
        </View>
      </View>

      <FlatList
        data={allBadges}
        keyExtractor={(_, i) => String(i)}
        numColumns={2}
        contentContainerStyle={[styles.list, { paddingBottom: homeBtnBottom + 76 }]}
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
    paddingBottom: 16,
    gap: 10,
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
