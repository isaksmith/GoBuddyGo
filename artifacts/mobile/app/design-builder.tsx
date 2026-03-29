import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
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
import ModelViewer from "@/components/ModelViewer";
import { getApiBaseUrl } from "@/utils/apiUrl";
import {
  VEHICLE_TYPES,
  DESIGN_COLORS,
  DESIGN_ACCESSORIES,
  useApp,
} from "@/context/AppContext";

type ScanStatus = "idle" | "pending" | "failed";

type ScannedVehicle = {
  id: string;
  modelUrl: string;
  label: string;
};

const SCANNED_RESTORED_ID = "scanned-restored";

const PICKER_COLORS = [
  "#FF3B30", "#FF9500", "#FFD60A", "#34C759",
  "#007AFF", "#5856D6", "#AF52DE", "#FF2D55",
  "#FFFFFF", "#C0C0C0", "#4A4A4A", "#1C1C1E",
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const LARGE_PREVIEW_WIDTH = SCREEN_WIDTH - 32;
const LARGE_PREVIEW_HEIGHT = Math.round(LARGE_PREVIEW_WIDTH * 0.62);

function VehicleModelViewer({ modelUrl, size, interactive = false }: { modelUrl: string; size: "large" | "medium"; interactive?: boolean }) {
  const containerSize = size === "large"
    ? { width: LARGE_PREVIEW_WIDTH, height: LARGE_PREVIEW_HEIGHT }
    : { width: 70, height: 52 };
  const controls = interactive ? "camera-controls" : 'camera-controls="false" interaction-prompt="none"';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${modelUrl}" camera-orbit="225deg 65deg auto" ${controls} auto-rotate="false" shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="3D vehicle preview"></model-viewer></body></html>`;
  return (
    <View style={[containerSize, { borderRadius: size === "large" ? 28 : 14, overflow: "hidden" }]} pointerEvents={interactive ? "auto" : "none"}>
      <ModelViewer html={html} style={{ flex: 1 }} scrollEnabled={false} />
    </View>
  );
}

function DesignPreview({
  vehicleType,
  primaryColor,
  accentColor,
  accessories,
  size = "large",
  customModelUrl,
}: {
  vehicleType: string;
  primaryColor: string;
  accentColor: string;
  accessories: string[];
  size?: "large" | "medium";
  customModelUrl?: string | null;
}) {
  const vt = VEHICLE_TYPES.find((v) => v.id === vehicleType) ?? VEHICLE_TYPES[0];
  const activeAcc = DESIGN_ACCESSORIES.filter((a) => accessories.includes(a.id));
  const containerSize = size === "large"
    ? { width: LARGE_PREVIEW_WIDTH, height: LARGE_PREVIEW_HEIGHT }
    : { width: 120, height: 80 };
  const accSize = size === "large" ? 20 : 10;
  const borderRadius = size === "large" ? 28 : 14;

  const isScannedType = vehicleType.startsWith("scanned-");
  const effectiveModelUrl = isScannedType ? customModelUrl : vt.modelUrl;

  if (isScannedType && !effectiveModelUrl) {
    return (
      <View style={[previewStyles.container, containerSize, { backgroundColor: "#09192A", borderRadius, alignItems: "center", justifyContent: "center", gap: 10 }]}>
        <Text style={{ fontSize: size === "large" ? 48 : 24 }}>🚗</Text>
        {size === "large" && (
          <Text style={{ color: "#8ca0b5", fontSize: 12, fontFamily: "Nunito_700Bold", letterSpacing: 1 }}>
            GENERATING 3D MODEL...
          </Text>
        )}
      </View>
    );
  }

  if (effectiveModelUrl) {
    return (
      <View style={[previewStyles.container, containerSize, { backgroundColor: "#09192A", borderRadius }]}>
        <VehicleModelViewer modelUrl={effectiveModelUrl} size={size} interactive={size === "large"} />
        {activeAcc.length > 0 && (
          <View style={[previewStyles.topBadges, size === "large" && { gap: 4 }]}>
            {activeAcc.slice(0, 5).map((a) => (
              <Text key={a.id} style={{ fontSize: accSize }}>{a.emoji}</Text>
            ))}
          </View>
        )}
        {size !== "large" && (
          <View style={[previewStyles.nameTag, { backgroundColor: "#1C1C1EDD" }]}>
            <Text style={[previewStyles.vehicleLabel, { fontSize: 6 }]}>{vt.label.toUpperCase()}</Text>
          </View>
        )}
      </View>
    );
  }

  const emojiSize = size === "large" ? 100 : 36;
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
  const { designs, addDesign, updateDesign, deleteDesign } = useApp();

  const existingDesign = designId ? designs.find((d) => d.id === designId) : null;

  const isRestoredCustom = existingDesign?.vehicleType === "custom" && !!existingDesign?.customVehicleModelUrl;
  const vehicleTypeIsValid = existingDesign?.vehicleType
    ? (VEHICLE_TYPES.some((v) => v.id === existingDesign.vehicleType) || isRestoredCustom)
    : true;
  const validVehicleType = isRestoredCustom
    ? SCANNED_RESTORED_ID
    : vehicleTypeIsValid
    ? (existingDesign?.vehicleType ?? VEHICLE_TYPES[0].id)
    : VEHICLE_TYPES[0].id;

  const [vehicleType, setVehicleType] = useState(validVehicleType);
  const [primaryColor, setPrimaryColor] = useState(
    vehicleTypeIsValid
      ? (existingDesign?.primaryColor ?? VEHICLE_TYPES[0].defaultPrimary)
      : VEHICLE_TYPES[0].defaultPrimary
  );
  const [accentColor, setAccentColor] = useState(
    vehicleTypeIsValid
      ? (existingDesign?.accentColor ?? VEHICLE_TYPES[0].defaultAccent)
      : VEHICLE_TYPES[0].defaultAccent
  );
  const [accessories, setAccessories] = useState<string[]>(existingDesign?.accessories ?? []);
  const [name, setName] = useState(existingDesign?.name ?? "");
  const [activeColorPicker, setActiveColorPicker] = useState<"primary" | "accent" | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scannedVehicles, setScannedVehicles] = useState<ScannedVehicle[]>(() =>
    isRestoredCustom
      ? [{ id: SCANNED_RESTORED_ID, modelUrl: existingDesign!.customVehicleModelUrl!, label: existingDesign!.name?.trim() || "New Car" }]
      : []
  );
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const previewAnim = useRef(new Animated.Value(1)).current;
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTaskIdRef = useRef<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isEditing = !!existingDesign;

  const animatePreview = useCallback(() => {
    Animated.sequence([
      Animated.timing(previewAnim, { toValue: 0.93, duration: 100, useNativeDriver: true }),
      Animated.spring(previewAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [previewAnim]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    activeTaskIdRef.current = null;
  }, []);

  const startPolling = useCallback((taskId: string) => {
    stopPolling();
    activeTaskIdRef.current = taskId;
    const poll = async () => {
      if (activeTaskIdRef.current !== taskId) return;
      try {
        const res = await fetch(`${getApiBaseUrl()}/image-to-3d/${taskId}`);
        if (!res.ok) return;
        const data = await res.json() as { status: "pending" | "succeeded" | "failed"; modelUrl?: string | null };
        if (activeTaskIdRef.current !== taskId) return;
        if (data.status === "succeeded") {
          stopPolling();
          const url = data.modelUrl ?? null;
          if (url) {
            const newId = `scanned-${Date.now()}`;
            setScannedVehicles((prev) => [...prev, { id: newId, modelUrl: url, label: "New Car" }]);
            setVehicleType(newId);
            setScanStatus("idle");
            animatePreview();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            setScanStatus("failed");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } else if (data.status === "failed") {
          stopPolling();
          setScanStatus("failed");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (e) { console.warn("Scan polling failed:", e); }
    };
    pollTimerRef.current = setInterval(poll, 5000);
    poll();
  }, [stopPolling, animatePreview]);

  useEffect(() => { return () => stopPolling(); }, [stopPolling]);

  const submitImageForScan = useCallback(async (photoUri: string) => {
    try {
      let imageDataUri: string;
      if (Platform.OS === "web" || photoUri.startsWith("data:")) {
        imageDataUri = photoUri;
      } else {
        const ext = photoUri.split(".").pop()?.toLowerCase() ?? "jpeg";
        const mime = ext === "png" ? "image/png" : ext === "heic" ? "image/heic" : "image/jpeg";
        const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
        imageDataUri = `data:${mime};base64,${base64}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/image-to-3d`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUri }),
      });
      if (!res.ok) {
        setScanStatus("failed");
        return;
      }
      const data = await res.json() as { taskId: string };
      setScanStatus("pending");
      startPolling(data.taskId);
    } catch (_e) {
      setScanStatus("failed");
    }
  }, [startPolling]);

  const handleScanNewCar = useCallback(async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = (input as HTMLInputElement).files?.[0];
        if (!file) return;
        setScanStatus("pending");
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        submitImageForScan(dataUri);
      };
      input.click();
      return;
    }
    Alert.alert("Scan Your Car", "Add a photo to generate a 3D model", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            setScanStatus("pending");
            submitImageForScan(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            setScanStatus("pending");
            submitImageForScan(result.assets[0].uri);
          }
        },
      },
    ]);
  }, [submitImageForScan]);

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

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!designId) return;
    setShowDeleteConfirm(false);
    await deleteDesign(designId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const handleSave = async () => {
    const finalName = name.trim() || `Design ${Date.now()}`;
    setSaving(true);
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();
    try {
      const isScanned = vehicleType.startsWith("scanned-");
      const customUrl = isScanned ? (scannedVehicles.find((sv) => sv.id === vehicleType)?.modelUrl ?? null) : null;
      const savedVehicleType = isScanned ? "custom" : vehicleType;
      if (isEditing && designId) {
        await updateDesign(designId, { name: finalName, vehicleType: savedVehicleType, primaryColor, accentColor, accessories, customVehicleModelUrl: customUrl });
      } else {
        await addDesign({ name: finalName, vehicleType: savedVehicleType, primaryColor, accentColor, accessories, customVehicleModelUrl: customUrl });
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
  const isScannedVehicle = vehicleType.startsWith("scanned-");
  const currentScanned = isScannedVehicle ? scannedVehicles.find((sv) => sv.id === vehicleType) : null;
  const customModelUrl = currentScanned?.modelUrl ?? null;

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
              customModelUrl={customModelUrl}
            />
          </Animated.View>
          {isScannedVehicle && scanStatus === "pending" ? (
            <View style={styles.previewLabel}>
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.previewLabelText}>GENERATING 3D MODEL...</Text>
            </View>
          ) : (
            <View style={styles.previewLabel}>
              <Text style={styles.previewLabelText}>
                {isScannedVehicle
                  ? `✨ ${currentScanned?.label?.toUpperCase() ?? "MY CAR"}`
                  : (!vt.modelUrl && vt.emoji ? `${vt.emoji} ` : "") + vt.label.toUpperCase()}
              </Text>
            </View>
          )}
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
                {v.modelUrl ? (
                  <VehicleModelViewer modelUrl={v.modelUrl} size="medium" />
                ) : (
                  <Text style={styles.vtEmoji}>{v.emoji}</Text>
                )}
                <Text style={[styles.vtLabel, vehicleType === v.id && { color: Colors.text }]}>
                  {v.label.toUpperCase()}
                </Text>
              </Pressable>
            ))}
            {scannedVehicles.map((sv) => (
              <Pressable
                key={sv.id}
                onPress={() => handleSelectVehicleType(sv.id)}
                style={[
                  styles.vtCard,
                  vehicleType === sv.id && styles.vtCardActive,
                  vehicleType === sv.id && { borderColor: primaryColor },
                ]}
              >
                <VehicleModelViewer modelUrl={sv.modelUrl} size="medium" />
                <Text style={[styles.vtLabel, vehicleType === sv.id && { color: Colors.text }]}>
                  {sv.label.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={scanStatus === "pending" ? undefined : handleScanNewCar}
            style={[styles.scanBtn, scanStatus === "pending" && styles.scanBtnPending]}
          >
            {scanStatus === "pending" ? (
              <>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.scanBtnText}>SCANNING YOUR CAR...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name={scanStatus === "failed" ? "refresh" : "camera-outline"}
                  size={18}
                  color={scanStatus === "failed" ? "#FF3B30" : Colors.primary}
                />
                <Text style={[styles.scanBtnText, scanStatus === "failed" && { color: "#FF3B30" }]}>
                  {scanStatus === "failed" ? "SCAN FAILED — TRY AGAIN" : scannedVehicles.length > 0 ? "SCAN ANOTHER CAR" : "SCAN NEW CAR"}
                </Text>
              </>
            )}
          </Pressable>
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
            onChangeText={(text) => {
              setName(text);
              if (isScannedVehicle) {
                setScannedVehicles((prev) =>
                  prev.map((sv) => sv.id === vehicleType ? { ...sv, label: text.trim() || "New Car" } : sv)
                );
              }
            }}
            placeholder={`e.g. "${vt.label} Mk. 1"`}
            placeholderTextColor={Colors.textMuted}
            maxLength={30}
            returnKeyType="done"
          />
          <Text style={styles.nameHint}>Leave blank to auto-name</Text>
        </View>

        {isEditing && (
          <Pressable onPress={handleDelete} style={styles.deleteFloatingBtn} disabled={saving}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            <Text style={styles.deleteBtnText}>DELETE DESIGN</Text>
          </Pressable>
        )}
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
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <Pressable style={styles.confirmBackdrop} onPress={() => setShowDeleteConfirm(false)} />
          <View style={styles.confirmSheet}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash-outline" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.confirmTitle}>DELETE DESIGN?</Text>
            <Text style={styles.confirmBody}>
              "{existingDesign?.name ?? "This design"}" will be permanently removed. This cannot be undone.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={styles.confirmCancelBtn}>
                <Text style={styles.confirmCancelText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={confirmDelete} style={styles.confirmDeleteBtn}>
                <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.confirmDeleteText}>DELETE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
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
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}18`,
  },
  scanBtnPending: {
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundDeep,
  },
  scanBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
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
  confirmOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  confirmSheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  confirmIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF3B3018",
    borderWidth: 2,
    borderColor: "#FF3B3040",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  confirmTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  confirmBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  confirmCancelText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  deleteFloatingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FF3B3055",
    backgroundColor: "#FF3B3011",
    marginBottom: 8,
  },
  deleteBtnText: {
    color: "#FF3B30",
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
  },
});
