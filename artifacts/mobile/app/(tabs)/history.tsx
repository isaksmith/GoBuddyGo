import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { SessionRecord, useApp } from "@/context/AppContext";

function SessionItem({ session }: { session: SessionRecord }) {
  const date = new Date(session.date);
  const pct =
    session.totalMissions > 0
      ? Math.round((session.missionsCompleted / session.totalMissions) * 100)
      : 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>
            {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </Text>
          {session.childName ? (
            <Text style={styles.cardChild}>Driver: {session.childName}</Text>
          ) : null}
        </View>
        <View style={styles.pctBadge}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
          <Text style={styles.statText}>
            {session.missionsCompleted}/{session.totalMissions} Missions
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={Colors.accentBlue} />
          <Text style={styles.statText}>
            {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
          </Text>
        </View>
      </View>

      {session.badges.length > 0 && (
        <View style={styles.badgesRow}>
          {session.badges.map((b) => (
            <View key={b.id} style={styles.badgePill}>
              <Ionicons name="star" size={12} color={Colors.secondary} />
              <Text style={styles.badgePillText}>{b.title}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { sessionHistory } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>Session History</Text>
        <Text style={styles.headerSub}>{sessionHistory.length} sessions</Text>
      </View>

      <FlatList
        data={sessionHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionItem session={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sessionHistory.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Sessions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first session to see history here
            </Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: "Nunito_700Bold",
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardDate: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
  cardChild: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },
  pctBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pctText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 209, 102, 0.12)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  badgePillText: {
    color: Colors.secondary,
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },
});
