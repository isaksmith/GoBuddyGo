import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBackground } from "@/components/AppBackground";
import { Colors } from "@/constants/colors";
import {
  VEHICLE_TYPES,
  DESIGN_COLORS,
  DESIGN_ACCESSORIES,
  useApp,
} from "@/context/AppContext";

const PICKER_COLORS = [
  "#FF3B30", "#FF9500", "#FFD60A", "#34C759",
  "#007AFF", "#5856D6", "#AF52DE", "#FF2D55",
  "#FFFFFF", "#C0C0C0", "#4A4A4A", "#1C1C1E",
];

function DesignPreview({
  vehicleType,
  primaryColor,
  accentColor,
  accessories,
  size = "large",
}: {
  vehicleType: string;
  primaryColor: string;
  accentColor: string;
  accessories: string[];
  size?: "large" | "medium";
}) {
  const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType) ?? VEHICLE_TYPES[0];
  const activeAcc = DESIGN_ACCESSORIES.filter((a) => accessories.includes(a.id));
  const containerSize = size === "large" ? { width: 260, height: 180 } : { width: 120, height: 80 };
  const emojiSize = size === "large" ? 80 : 36;
  const accSize = size === "large" ? 20 : 10;
  const borderRadius = size === "large" ? 28 : 14;

  return (
    <View
      style={[
        previewStyles.container,
        containerSize,
        { backgroundColor: primaryColor, borderRadius },
      ]}
    >
      <View style={[previewStyles.accentStripe, { backgroundColor: accentColor }]} />
      <View style={[previewStyles.accentSide, { backgroundColor: accentColor }]} />
      {activeAcc.length > 0 && (
        <View style={[previewStyles.topBadges, size === "large" && { gap: 4 }]}>
          {activeAcc.slice(0, 5).map((a) => (
            <Text key={a.id} style={{ fontSize: accSize }}>{a.emoji}</Text>
          ))}
        </View>
      )}
      <Text style={[previewStyles.vehicleEmoji, { fontSize: emojiSize }]}>{vt.emoji}</Text>
      <View style={[previewStyles.nameTag, { backgroundColor: accentColor + "DD" }]}>
        <Text style={[previewStyles.vehicleLabel, { fontSize: size === "large" ? 11 : 6 }]}>{vt.label.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const previewStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  accentStripe: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "24%",
    opacity: 0.85,
  },
  accentSide: {
    position: "absolute",
    left: 0,
    top: "20%",
    bottom: "24%",
    width: 8,
    opacity: 0.7,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  topBadges: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 2,
  },
  vehicleEmoji: {
    zIndex: 1,
  },
  nameTag: {
    position: "absolute",
    bottom: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  vehicleLabel: {
    color: "#FFFFFF",
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
});

export default function DesignBuilderScreen() {
  const insets = useSafeAreaInsets();
  const { designId } = useLocalSearchParams<{ designId?: string }>();
  const { designs, addDesign, updateDesign } = useApp();

  const existingDesign = designId ? designs.find((d) => d.id === designId) : null;

  const [vehicleType, setVehicleType] = useState(existingDesign?.vehicleType ?? VEHICLE_TYPES[0].id);
  const [primaryColor, setPrimaryColor] = useState(existingDesign?.primaryColor ?? VEHICLE_TYPES[0].defaultPrimary);
  const [accentColor, setAccentColor] = useState(existingDesign?.accentColor ?? VEHICLE_TYPES[0].defaultAccent);
  const [accessories, setAccessories] = useState<string[]>(existingDesign?.accessories ?? []);
  const [name, setName] = useState(existingDesign?.name ?? "");
  const [activeColorPicker, setActiveColorPicker] = useState<"primary" | "accent" | null>(null);
  const [saving, setSaving] = useState(false);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const previewAnim = useRef(new Animated.Value(1)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isEditing = !!existingDesign;

  const animatePreview = () => {
    Animated.sequence([
      Animated.timing(previewAnim, { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.spring(previewAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const handleSelectVehicleType = (id: string) => {
    setVehicleType(id);
    const vt = VEHICLE_TYPES.find((v) => v.id === id);
    if (vt && !isEditing) {
      setPrimaryColor(vt.defaultPrimary);
      setAccentColor(vt.defaultAccent);
    }
    animatePreview();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectColor = (color: string) => {
    if (activeColorPicker === "primary") setPrimaryColor(color);
    else if (activeColorPicker === "accent") setAccentColor(color);
    animatePreview();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAccessory = (id: string) => {
    setAccessories((prev) => {
      const next = prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id];
      return next;
    });
    animatePreview();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    const finalName = name.trim() || `Design ${Date.now()}`;
    setSaving(true);
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    try {
      if (isEditing && designId) {
        await updateDesign(designId, { name: finalName, vehicleType, primaryColor, accentColor, accessories });
      } else {
        await addDesign({ name: finalName, vehicleType, primaryColor, accentColor, accessories });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      Alert.alert("Save failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType) ?? VEHICLE_TYPES[0];

  return (
    <AppBackground>
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditing ? "✏️ EDIT DESIGN" : "🎨 DESIGN YOUR RIDE"}
            </Text>
            <Text style={styles.headerSub}>MAKE IT YOUR OWN!</Text>
          </View>
        </View>

        <View style={styles.previewSection}>
          <Animated.View style={{ transform: [{ scale: previewAnim }] }}>
            <DesignPreview
              vehicleType={vehicleType}
              primaryColor={primaryColor}
              accentColor={accentColor}
              accessories={accessories}
              size="large"
            />
          </Animated.View>
          <View style={styles.previewLabel}>
            <Text style={styles.previewLabelText}>{vt.emoji} {vt.label.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚗</Text>
            <Text style={styles.sectionTitle}>CHOOSE BASE VEHICLE</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vtRow}>
            {VEHICLE_TYPES.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => handleSelectVehicleType(v.id)}
                style={[
                  styles.vtCard,
                  vehicleType === v.id && styles.vtCardActive,
                  vehicleType === v.id && { borderColor: primaryColor },
                ]}
              >
                <Text style={styles.vtEmoji}>{v.emoji}</Text>
                <Text style={[styles.vtLabel, vehicleType === v.id && { color: Colors.text }]}>
                  {v.label.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎨</Text>
            <Text style={styles.sectionTitle}>COLORS</Text>
          </View>

          <View style={styles.colorPickerRow}>
            <Pressable
              onPress={() => setActiveColorPicker(activeColorPicker === "primary" ? null : "primary")}
              style={[
                styles.colorPickerBtn,
                activeColorPicker === "primary" && styles.colorPickerBtnActive,
              ]}
            >
              <View style={[styles.colorSwatch, { backgroundColor: primaryColor }]} />
              <View>
                <Text style={styles.colorPickerLabel}>BODY COLOR</Text>
                <Text style={styles.colorPickerHint}>
                  {activeColorPicker === "primary" ? "TAP A COLOR ↓" : "TAP TO CHANGE"}
                </Text>
              </View>
              <Ionicons
                name={activeColorPicker === "primary" ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.textMuted}
              />
            </Pressable>

            <Pressable
              onPress={() => setActiveColorPicker(activeColorPicker === "accent" ? null : "accent")}
              style={[
                styles.colorPickerBtn,
                activeColorPicker === "accent" && styles.colorPickerBtnActive,
              ]}
            >
              <View style={[styles.colorSwatch, { backgroundColor: accentColor }]} />
              <View>
                <Text style={styles.colorPickerLabel}>ACCENT COLOR</Text>
                <Text style={styles.colorPickerHint}>
                  {activeColorPicker === "accent" ? "TAP A COLOR ↓" : "TAP TO CHANGE"}
                </Text>
              </View>
              <Ionicons
                name={activeColorPicker === "accent" ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.textMuted}
              />
            </Pressable>
          </View>

          {activeColorPicker && (
            <View style={styles.colorGrid}>
              {PICKER_COLORS.map((color) => {
                const selected = color === (activeColorPicker === "primary" ? primaryColor : accentColor);
                return (
                  <Pressable
                    key={color}
                    onPress={() => handleSelectColor(color)}
                    style={[
                      styles.colorCell,
                      { backgroundColor: color },
                      selected && styles.colorCellSelected,
                      color === "#FFFFFF" && styles.colorCellLight,
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={16} color={color === "#FFFFFF" || color === "#FFD60A" || color === "#C0C0C0" ? "#1C1C1E" : "#FFFFFF"} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>✨</Text>
            <Text style={styles.sectionTitle}>ADD ACCESSORIES</Text>
            {accessories.length > 0 && (
              <View style={styles.accCountBadge}>
                <Text style={styles.accCountText}>{accessories.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.accGrid}>
            {DESIGN_ACCESSORIES.map((acc) => {
              const selected = accessories.includes(acc.id);
              return (
                <Pressable
                  key={acc.id}
                  onPress={() => toggleAccessory(acc.id)}
                  style={[
                    styles.accCell,
                    selected && styles.accCellSelected,
                    selected && { borderColor: primaryColor, backgroundColor: primaryColor + "22" },
                  ]}
                >
                  <Text style={styles.accEmoji}>{acc.emoji}</Text>
                  <Text style={[styles.accLabel, selected && { color: Colors.text }]}>
                    {acc.label.toUpperCase()}
                  </Text>
                  {selected && (
                    <View style={[styles.accCheck, { backgroundColor: primaryColor }]}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏷️</Text>
            <Text style={styles.sectionTitle}>NAME YOUR DESIGN</Text>
          </View>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={`e.g. "${vt.label} Mk. 1"`}
            placeholderTextColor={Colors.textMuted}
            maxLength={30}
            returnKeyType="done"
          />
          <Text style={styles.nameHint}>Leave blank to auto-name</Text>
        </View>
      </ScrollView>

      <View style={[styles.saveBar, { paddingBottom: insets.bottom + 12 }]}>
        <Animated.View style={[{ flex: 1 }, { transform: [{ scale: bounceAnim }] }]}>
          <Pressable onPress={handleSave} disabled={saving} style={styles.saveBtn}>
            <LinearGradient
              colors={saving ? [Colors.backgroundCard, Colors.backgroundCard] : ["#7B2FBE", "#5A1F8A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGrad}
            >
              <Ionicons name={saving ? "hourglass" : "checkmark-circle"} size={22} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {saving ? "SAVING…" : isEditing ? "SAVE CHANGES" : "SAVE DESIGN!"}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 12 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: Colors.text, fontSize: 20, fontFamily: "Nunito_700Bold", letterSpacing: 1.5 },
  headerSub: { color: Colors.accent, fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1.5, marginTop: 2 },
  previewSection: {
    alignItems: "center",
    marginBottom: 28,
    gap: 12,
  },
  previewLabel: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  previewLabelText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  vtRow: { gap: 10, paddingRight: 4 },
  vtCard: {
    width: 90,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 6,
  },
  vtCardActive: {
    backgroundColor: Colors.background,
    borderWidth: 3,
  },
  vtEmoji: { fontSize: 32 },
  vtLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  colorPickerRow: { gap: 10, marginBottom: 4 },
  colorPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  colorPickerBtnActive: {
    borderColor: Colors.primary,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  colorPickerLabel: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  colorPickerHint: {
    color: Colors.textMuted,
    fontSize: 9,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
    marginTop: 1,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
    justifyContent: "center",
  },
  colorCell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  colorCellSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  colorCellLight: {
    borderColor: "rgba(0,0,0,0.2)",
  },
  accCountBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  accCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
  accGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  accCell: {
    width: "22%",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  accCellSelected: {
    borderWidth: 2,
  },
  accEmoji: { fontSize: 26 },
  accLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  accCheck: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  nameInput: {
    backgroundColor: Colors.backgroundDeep,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  nameHint: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
    marginTop: 8,
    paddingLeft: 8,
  },
  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 12,
    backgroundColor: Colors.backgroundDeep + "EE",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    borderRadius: 50,
    overflow: "hidden",
  },
  saveBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
});
