import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useApp, countAvailableSessionMissions } from "@/context/AppContext";

const DURATIONS = [5, 10, 15, 20, 30];
const DIFFICULTIES = [
  { value: "easy", label: "Easy", desc: "Simple, encouraging missions" },
  { value: "medium", label: "Medium", desc: "Easy + medium difficulty" },
  { value: "all", label: "All", desc: "All missions including challenging" },
] as const;

function PinEntry({
  onUnlock,
  pin,
}: {
  onUnlock: () => void;
  pin: string;
}) {
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (entered === pin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUnlock();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      setEntered("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <View style={pinStyles.container}>
      <View style={pinStyles.lockCircle}>
        <Ionicons name="lock-closed" size={40} color={Colors.primary} />
      </View>
      <Text style={pinStyles.title}>Parent Mode</Text>
      <Text style={pinStyles.subtitle}>Enter your PIN to access settings</Text>

      <TextInput
        style={[pinStyles.pinInput, error && pinStyles.pinInputError]}
        value={entered}
        onChangeText={(v) => setEntered(v.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        secureTextEntry
        placeholder="••••"
        placeholderTextColor={Colors.textMuted}
        maxLength={6}
        testID="pin-input"
      />
      {error && <Text style={pinStyles.errorText}>Incorrect PIN</Text>}

      <Pressable onPress={handleSubmit} style={pinStyles.unlockBtn} testID="pin-unlock-btn">
        <Text style={pinStyles.unlockBtnText}>Unlock</Text>
      </Pressable>

      <Pressable onPress={() => router.back()} style={pinStyles.cancelBtn}>
        <Text style={pinStyles.cancelBtnText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const pinStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 14,
  },
  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 107, 43, 0.1)",
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  pinInput: {
    width: "70%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    letterSpacing: 8,
  },
  pinInputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },
  unlockBtn: {
    width: "70%",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  unlockBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
});

export default function ParentModeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, missions } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [changePinVisible, setChangePinVisible] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const usingDefaultPin = settings.parentPin === "1234";
  const availableCount = countAvailableSessionMissions(missions, settings);

  const toggleMission = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const ids = settings.enabledMissionIds;
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    await updateSettings({ enabledMissionIds: next });
  };

  const handleSavePin = async () => {
    if (newPin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }
    await updateSettings({ parentPin: newPin });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChangePinVisible(false);
    setNewPin("");
    setConfirmPin("");
    setPinError("");
  };

  if (!unlocked) {
    return (
      <LinearGradient
        colors={[Colors.background, Colors.backgroundMid]}
        style={{ flex: 1, paddingTop: topPad }}
      >
        <PinEntry onUnlock={() => setUnlocked(true)} pin={settings.parentPin} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Parent Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {usingDefaultPin && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={18} color={Colors.secondary} />
            <Text style={styles.warningText}>
              You are using the default PIN (1234). Change it below to secure Parent Mode.
            </Text>
          </View>
        )}
        {availableCount < 3 && (
          <View style={styles.warningBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={Colors.secondary} />
            <Text style={styles.warningText}>
              Only {availableCount} mission{availableCount !== 1 ? "s" : ""} available for current settings — enable at least 3 for a full session.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Session Duration</Text>
          <View style={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d}
                onPress={() => updateSettings({ sessionDurationMinutes: d })}
                style={[
                  styles.durationChip,
                  settings.sessionDurationMinutes === d && styles.durationChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    settings.sessionDurationMinutes === d && styles.durationTextActive,
                  ]}
                >
                  {d}m
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mission Difficulty</Text>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d.value}
              onPress={() => updateSettings({ difficulty: d.value })}
              style={[
                styles.difficultyCard,
                settings.difficulty === d.value && styles.difficultyCardActive,
              ]}
            >
              <View style={styles.difficultyLeft}>
                <Text
                  style={[
                    styles.difficultyLabel,
                    settings.difficulty === d.value && styles.difficultyLabelActive,
                  ]}
                >
                  {d.label}
                </Text>
                <Text style={styles.difficultyDesc}>{d.desc}</Text>
              </View>
              {settings.difficulty === d.value && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Active Missions</Text>
          {missions.map((m) => (
            <View key={m.id} style={styles.missionToggleRow}>
              <View style={styles.missionToggleInfo}>
                <Text style={styles.missionToggleTitle}>{m.title}</Text>
                <Text style={styles.missionToggleDiff}>{m.difficulty}</Text>
              </View>
              <Switch
                value={settings.enabledMissionIds.includes(m.id)}
                onValueChange={() => toggleMission(m.id)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#FFFFFF"
                testID={`mission-toggle-${m.id}`}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security</Text>
          <Pressable onPress={() => setChangePinVisible(true)} style={styles.changePinBtn} testID="change-pin-btn">
            <Ionicons name="key" size={20} color={Colors.primary} />
            <Text style={styles.changePinText}>Change Parent PIN</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={changePinVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChangePinVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Parent PIN</Text>
            <Text style={styles.modalSubtitle}>Enter a new 4–6 digit PIN</Text>

            <TextInput
              style={styles.modalInput}
              value={newPin}
              onChangeText={(v) => { setNewPin(v.replace(/\D/g, "").slice(0, 6)); setPinError(""); }}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="New PIN"
              placeholderTextColor={Colors.textMuted}
              maxLength={6}
              testID="new-pin-input"
            />
            <TextInput
              style={styles.modalInput}
              value={confirmPin}
              onChangeText={(v) => { setConfirmPin(v.replace(/\D/g, "").slice(0, 6)); setPinError(""); }}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="Confirm PIN"
              placeholderTextColor={Colors.textMuted}
              maxLength={6}
              testID="confirm-pin-input"
            />

            {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => { setChangePinVisible(false); setNewPin(""); setConfirmPin(""); setPinError(""); }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSavePin} style={styles.modalSaveBtn} testID="save-pin-btn">
                <Text style={styles.modalSaveText}>Save PIN</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255, 209, 102, 0.12)",
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    color: Colors.secondary,
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    lineHeight: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  durationChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  durationChipActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 107, 43, 0.12)",
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  durationTextActive: {
    color: Colors.primary,
  },
  difficultyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  difficultyCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 107, 43, 0.08)",
  },
  difficultyLeft: {
    flex: 1,
  },
  difficultyLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 2,
  },
  difficultyLabelActive: {
    color: Colors.primary,
  },
  difficultyDesc: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },
  missionToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  missionToggleInfo: {
    flex: 1,
  },
  missionToggleTitle: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
  },
  missionToggleDiff: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    textTransform: "capitalize",
    marginTop: 2,
  },
  changePinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changePinText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 14,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: Colors.text,
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    letterSpacing: 6,
  },
  pinErrorText: {
    color: Colors.danger,
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  modalCancelText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: "Nunito_600SemiBold",
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
