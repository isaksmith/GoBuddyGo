import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { SessionRecord, useApp } from "@/context/AppContext";

function SessionItem({ session, isFirst }: { session: SessionRecord; isFirst: boolean }) {
  const date = new Date(session.date);
  const pct =
    session.totalMissions > 0
      ? Math.round((session.missionsCompleted / session.totalMissions) * 100)
      : 0;

  const pctColor =
    pct >= 80 ? Colors.accent : pct >= 50 ? Colors.secondary : Colors.primary;

  return (
    <View
      style={[
        styles.card,
        isFirst && {
          borderColor: Colors.primary + "88",
          shadowColor: Colors.primary,
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardDate}>
            {date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).toUpperCase()}
          </Text>
          {session.childName ? (
            <Text style={styles.cardChild}>
              🏎 DRIVER: {session.childName.toUpperCase()}
            </Text>
          ) : null}
        </View>
        <View style={[styles.pctCircle, { backgroundColor: pctColor }]}>
          <Text style={styles.pctText}>{pct}%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
          <Text style={styles.statText}>
            {session.missionsCompleted}/{session.totalMissions}
          </Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="time" size={16} color={Colors.accentBlue} />
          <Text style={styles.statText}>
            {Math.floor(session.durationSeconds / 60)}m{" "}
            {session.durationSeconds % 60}s
          </Text>
        </View>
        {session.badges.length > 0 && (
          <View style={styles.statChip}>
            <Ionicons name="star" size={16} color={Colors.secondary} />
            <Text style={styles.statText}>{session.badges.length}</Text>
          </View>
        )}
      </View>

      {session.badges.length > 0 && (
        <View style={styles.badgesRow}>
          {session.badges.map((b) => (
            <View key={b.id} style={styles.badgeToken}>
              <Ionicons name="star" size={11} color={Colors.secondary} />
              <Text style={styles.badgeTokenText}>{b.title.toUpperCase()}</Text>
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
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Text style={styles.headerTitle}>🏆 HISTORY</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{sessionHistory.length} RIDES</Text>
        </View>
      </View>

      <FlatList
        data={sessionHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SessionItem session={item} isFirst={index === 0} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={sessionHistory.length > 0}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="trophy-outline" size={52} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>NO RIDES YET</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first mission to see your history here!
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  countPill: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  countText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
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
    paddingHorizontal: 28,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardLeft: {
    flex: 1,
    gap: 3,
  },
  cardDate: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  cardChild: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.3,
  },
  pctCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  pctText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.backgroundDeep,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badgeToken: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.secondary + "18",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: Colors.secondary + "66",
  },
  badgeTokenText: {
    color: Colors.secondary,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
});
