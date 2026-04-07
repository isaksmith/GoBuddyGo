import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTextScale } from "@/hooks/useTextScale";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

const SOUNDTRACK_VOLUME_STEPS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
];

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
    <KeyboardAvoidingView
      style={pinStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <View style={pinStyles.pinContent}>
        <View style={pinStyles.lockCircle}>
          <Ionicons name="lock-closed" size={40} color={Colors.primary} />
        </View>
        <Text style={pinStyles.title}>Settings</Text>
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
    </KeyboardAvoidingView>
  );
}

const pinStyles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  pinContent: {
    width: "100%",
    alignItems: "center",
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
    fontFamily: "BalsamiqSans_700Bold",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "BalsamiqSans_400Regular",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
  },
  cancelBtn: {
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: "BalsamiqSans_700Bold",
  },
});

const TEXT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

export default function ParentModeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { settings, updateSettings, resetProgress } = useApp();
  const textScale = useTextScale();
  const [unlocked, setUnlocked] = useState(false);
  const [changePinVisible, setChangePinVisible] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [siblingName, setSiblingName] = useState(settings.childName);
  const [driverName, setDriverName] = useState(settings.driverName ?? "");

  useEffect(() => { setSiblingName(settings.childName); }, [settings.childName]);
  useEffect(() => { setDriverName(settings.driverName ?? ""); }, [settings.driverName]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const usingDefaultPin = settings.parentPin === "0000";
  const soundtrackMuted = settings.soundtrackMuted ?? false;
  const soundtrackVolume = Math.max(0, Math.min(1, settings.soundtrackVolume ?? 0.5));
  const contentMaxWidth = Math.min(width, 700);
  const hPad = width > 600 ? 32 : 20;

  const handleSaveNames = async () => {
    await updateSettings({ childName: siblingName.trim(), driverName: driverName.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Reset Progress",
      "This will permanently clear all badges and session history. Your 4 default garage cars will be kept. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Reset",
          style: "destructive",
          onPress: async () => {
            await resetProgress();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
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
      <AppBackground>
        <View style={{ flex: 1, paddingTop: topPad }}>
          <PinEntry onUnlock={() => setUnlocked(true)} pin={settings.parentPin} />
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 8, paddingHorizontal: hPad }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: 22 * textScale }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40, paddingHorizontal: hPad, alignSelf: "center", width: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ width: "100%" }}
      >
        {usingDefaultPin && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={18} color={Colors.secondary} />
            <Text style={styles.warningText}>
              You are using the default PIN (0000). Change it below to secure Settings.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>Names</Text>
          <View style={styles.nameFieldsStack}>
            <View style={styles.nameInputRow}>
              <Text style={styles.nameInputLabel}>Driver's Name</Text>
              <TextInput
                style={styles.nameInput}
                value={driverName}
                onChangeText={setDriverName}
                onBlur={handleSaveNames}
                placeholder="Example: Andy"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleSaveNames}
                testID="driver-name-input"
              />
            </View>
            <View style={[styles.nameInputRow, styles.nameInputRowSecond]}>
              <Text style={styles.nameInputLabel}>Sibling's Name</Text>
              <TextInput
                style={styles.nameInput}
                value={siblingName}
                onChangeText={setSiblingName}
                onBlur={handleSaveNames}
                placeholder="Example: Joanna"
                placeholderTextColor={Colors.textMuted}
                returnKeyType="done"
                onSubmitEditing={handleSaveNames}
                testID="sibling-name-input"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>Sound & Alerts</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="musical-notes" size={18} color={Colors.primary} style={styles.toggleIcon} />
              <View>
                <Text style={styles.toggleTitle}>Sound Effects</Text>
                <Text style={styles.toggleDesc}>Play sounds in games and celebrations</Text>
              </View>
            </View>
            <Switch
              value={settings.soundsEnabled ?? true}
              onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ soundsEnabled: v }); }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
              testID="sounds-toggle"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="musical-note" size={18} color={Colors.primary} style={styles.toggleIcon} />
              <View>
                <Text style={styles.toggleTitle}>Background Music</Text>
                <Text style={styles.toggleDesc}>Mute or unmute the app soundtrack</Text>
              </View>
            </View>
            <Switch
              value={!soundtrackMuted}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ soundtrackMuted: !v });
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
              testID="soundtrack-toggle"
            />
          </View>
          <View style={styles.soundtrackVolumeWrap}>
            <Text style={styles.soundtrackVolumeLabel}>Music Volume</Text>
            <View style={styles.durationRow}>
              {SOUNDTRACK_VOLUME_STEPS.map((step) => {
                const isActive = Math.abs(soundtrackVolume - step.value) < 0.001;
                return (
                  <Pressable
                    key={step.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updateSettings({ soundtrackVolume: step.value, soundtrackMuted: step.value === 0 });
                    }}
                    style={[styles.durationChip, isActive && styles.durationChipActive]}
                    testID={`soundtrack-volume-${step.label}`}
                  >
                    <Text style={[styles.durationText, isActive && styles.durationTextActive]}>{step.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="warning" size={18} color={Colors.primary} style={styles.toggleIcon} />
              <View>
                <Text style={styles.toggleTitle}>Proximity Alerts</Text>
                <Text style={styles.toggleDesc}>"Give the driver some space!" warning</Text>
              </View>
            </View>
            <Switch
              value={settings.proximityAlertsEnabled ?? true}
              onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ proximityAlertsEnabled: v }); }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#FFFFFF"
              testID="proximity-toggle"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>Text Size</Text>
          <View style={styles.durationRow}>
            {TEXT_SIZES.map((ts) => (
              <Pressable
                key={ts.value}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ textSize: ts.value }); }}
                style={[
                  styles.durationChip,
                  (settings.textSize ?? "medium") === ts.value && styles.durationChipActive,
                ]}
                testID={`text-size-${ts.value}`}
              >
                <Text
                  style={[
                    styles.durationText,
                    (settings.textSize ?? "medium") === ts.value && styles.durationTextActive,
                  ]}
                >
                  {ts.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>Security</Text>
          <Pressable onPress={() => setChangePinVisible(true)} style={styles.changePinBtn} testID="change-pin-btn">
            <Ionicons name="key" size={20} color={Colors.primary} />
            <Text style={styles.changePinText}>Change Parent PIN</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>Data</Text>
          <Pressable onPress={handleResetProgress} style={styles.resetBtn} testID="reset-progress-btn">
            <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            <Text style={styles.resetBtnText}>Reset Progress</Text>
          </Pressable>
          <Text style={styles.resetBtnHint}>Clears all badges and session history.</Text>
        </View>

        <View style={[styles.section, styles.aboutSection]}>
          <Text style={[styles.sectionLabel, { fontSize: 13 * textScale }]}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutAppName}>GoBuddyGo</Text>
            <Text style={styles.aboutVersion}>Version {APP_VERSION}</Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutTip}>
              GoBuddyGo is a gamified augmented reality app designed for the WSU GoBabyGo program. The project team developed this prototype to enhance the experience for siblings participating in GoBabyGo while prioritizing safety and accessibility. It allows the siblings of the driver to serve as pretend co-pilots through interactive games, fun rewards, and vehicle customization features.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={changePinVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setChangePinVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
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
        </KeyboardAvoidingView>
      </Modal>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
    marginBottom: 2,
  },
  difficultyLabelActive: {
    color: Colors.primary,
  },
  difficultyDesc: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "BalsamiqSans_400Regular",
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
    fontFamily: "BalsamiqSans_700Bold",
  },
  missionToggleDiff: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "BalsamiqSans_400Regular",
    textTransform: "capitalize",
    marginTop: 2,
  },
  nameFieldsStack: {
    marginTop: 0,
  },
  nameInputRow: {
    marginTop: 0,
  },
  nameInputRowSecond: {
    marginTop: 12,
  },
  nameInputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    marginBottom: 6,
  },
  nameInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  toggleIcon: {
    marginRight: 2,
  },
  toggleTitle: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "BalsamiqSans_700Bold",
  },
  toggleDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "BalsamiqSans_400Regular",
    marginTop: 2,
  },
  soundtrackVolumeWrap: {
    paddingTop: 12,
    paddingBottom: 4,
    gap: 8,
  },
  soundtrackVolumeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.3,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(239, 71, 111, 0.08)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.danger + "40",
  },
  resetBtnText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 16,
    fontFamily: "BalsamiqSans_700Bold",
  },
  resetBtnHint: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "BalsamiqSans_400Regular",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  aboutSection: {
    marginBottom: 8,
  },
  aboutCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  aboutAppName: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: "BalsamiqSans_700Bold",
  },
  aboutVersion: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "BalsamiqSans_400Regular",
  },
  aboutDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  aboutTip: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "BalsamiqSans_400Regular",
    lineHeight: 20,
  },
  aboutTipLabel: {
    fontFamily: "BalsamiqSans_700Bold",
    color: Colors.text,
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
    textAlign: "center",
  },
  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "BalsamiqSans_400Regular",
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
    fontFamily: "BalsamiqSans_700Bold",
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    letterSpacing: 6,
  },
  pinErrorText: {
    color: Colors.danger,
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
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
    fontFamily: "BalsamiqSans_700Bold",
  },
});
