import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import ModelViewer from "@/components/ModelViewer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DefaultCarSvg from "@/components/DefaultCarSvg";
import { AppBackground } from "@/components/AppBackground";
import { Colors } from "@/constants/colors";
import { t } from "@/constants/i18n";
import {
  CarDesign,
  getVehicleModelUrl,
  SavedCar,
  VEHICLE_TYPES,
  DESIGN_ACCESSORIES,
  useApp,
} from "@/context/AppContext";
import { getApiBaseUrl } from "@/utils/apiUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IS_PAD = SCREEN_WIDTH >= 768;
const PAD_COLUMNS = 3;
const PAD_H_PADDING = 32;
const PAD_GAP = 16;
const CARD_WIDTH = IS_PAD
  ? Math.floor((SCREEN_WIDTH - PAD_H_PADDING - PAD_GAP * (PAD_COLUMNS - 1)) / PAD_COLUMNS)
  : 160;
const CARD_HEIGHT = IS_PAD ? Math.round(CARD_WIDTH * 1.31) : 210;

function DesignPreview({ design, size = 60 }: { design: CarDesign; size?: number }) {
  const vt = VEHICLE_TYPES.find((v) => v.id === design.vehicleType) ?? VEHICLE_TYPES[0];
  const accessories = DESIGN_ACCESSORIES.filter((a) => design.accessories.includes(a.id));
  return (
    <View style={[dpStyles.container, { width: size * 1.6, height: size * 1.2, borderRadius: size * 0.18 }, { backgroundColor: design.primaryColor }]}>
      <View style={[dpStyles.accentBar, { backgroundColor: design.accentColor }]} />
      <Text style={[dpStyles.emoji, { fontSize: size * 0.56 }]}>{vt.emoji}</Text>
      {accessories.length > 0 && (
        <View style={dpStyles.accRow}>
          {accessories.slice(0, 3).map((a) => (
            <Text key={a.id} style={[dpStyles.accEmoji, { fontSize: size * 0.22 }]}>{a.emoji}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const dpStyles = StyleSheet.create({
  container: { justifyContent: "center", alignItems: "center", overflow: "hidden", position: "relative" },
  accentBar: { position: "absolute", bottom: 0, left: 0, right: 0, height: "22%" },
  emoji: { zIndex: 1 },
  accRow: { position: "absolute", top: 4, right: 4, flexDirection: "row", gap: 1 },
  accEmoji: {},
});

const SavedCarCard = React.memo(function SavedCarCard({ car, onPress, onDelete, onRename, isCoinDashSelected, cardColor }: {
  car: SavedCar;
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
  isCoinDashSelected: boolean;
  cardColor?: string;
}) {
  const { settings } = useApp();
  const language = settings.language;
  const has3d = car.model3dStatus === "succeeded" && !!car.model3dUrl;
  return (
    <Pressable
      onPress={onPress}
      style={[
        cardStyles.card,
        cardColor ? { backgroundColor: cardColor } : undefined,
        isCoinDashSelected && cardStyles.cardSelected,
      ]}
    >
      <View style={cardStyles.imageArea}>
        {has3d ? (
          <View style={cardStyles.model3dThumb} pointerEvents="none">
            <ModelViewer
              cacheKey={car.model3dUrl ?? undefined}
              html={`<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script><script nomodule src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${car.model3dUrl}" camera-orbit="225deg 65deg auto" camera-controls="false" interaction-prompt="none" auto-rotate="false" shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="3D car preview"></model-viewer></body></html>`}
              style={cardStyles.model3dWebView}
              scrollEnabled={false}
            />
          </View>
        ) : car.isDefault ? (
          <View style={cardStyles.defaultCarArea}>
            <DefaultCarSvg width={140} height={90} bodyColor="#4F8EF7" accentColor="#FFD93D" />
          </View>
        ) : (
          <Image source={{ uri: car.photoUri }} style={cardStyles.image} resizeMode="cover" />
        )}
        {isCoinDashSelected && (
          <View style={cardStyles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={11} color="#FFFFFF" />
            <Text style={cardStyles.selectedBadgeText}>{t("SELECTED", language)}</Text>
          </View>
        )}
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.name} numberOfLines={1}>{car.name}</Text>
        {!car.isDefault && (
          <View style={cardStyles.actions}>
            <Pressable onPress={onRename} hitSlop={8} style={cardStyles.actionBtn}>
              <Ionicons name="pencil" size={14} color="rgba(255,255,255,0.9)" />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} style={cardStyles.actionBtn}>
              <Ionicons name="trash-outline" size={14} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}, (prev, next) => {
  return (
    prev.cardColor === next.cardColor &&
    prev.car.id === next.car.id &&
    prev.car.name === next.car.name &&
    prev.car.photoUri === next.car.photoUri &&
    prev.car.model3dStatus === next.car.model3dStatus &&
    prev.car.model3dUrl === next.car.model3dUrl &&
    prev.car.isDefault === next.car.isDefault &&
    prev.isCoinDashSelected === next.isCoinDashSelected
  );
});

const DesignCard = React.memo(function DesignCard({ design, onPress, cardColor }: {
  design: CarDesign;
  onPress: () => void;
  cardColor?: string;
}) {
  const vt = VEHICLE_TYPES.find((v) => v.id === design.vehicleType) ?? VEHICLE_TYPES[0];
  const modelUrl = design.customVehicleModelUrl ?? getVehicleModelUrl(vt.id);
  const canRenderModel = typeof modelUrl === "string" && /^https?:\/\//.test(modelUrl);
  return (
    <Pressable onPress={onPress} style={[cardStyles.card, cardColor ? { backgroundColor: cardColor } : undefined]}>
      <View style={cardStyles.imageArea}>
        {canRenderModel ? (
          <View style={cardStyles.model3dThumb} pointerEvents="none">
            <ModelViewer
              cacheKey={modelUrl}
              html={`<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"></script><script nomodule src="https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer-legacy.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${modelUrl}" camera-orbit="225deg 65deg auto" camera-controls="false" interaction-prompt="none" auto-rotate="false" shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="3D design preview"></model-viewer></body></html>`}
              style={cardStyles.model3dWebView}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={cardStyles.designFallbackArea}>
            <DesignPreview design={design} size={56} />
          </View>
        )}
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.name} numberOfLines={1}>{design.name}</Text>
      </View>
    </Pressable>
  );
}, (prev, next) => {
  return (
    prev.cardColor === next.cardColor &&
    prev.design.id === next.design.id &&
    prev.design.name === next.design.name &&
    prev.design.vehicleType === next.design.vehicleType &&
    prev.design.primaryColor === next.design.primaryColor &&
    prev.design.accentColor === next.design.accentColor &&
    prev.design.customVehicleModelUrl === next.design.customVehicleModelUrl
  );
});

function CreateCard({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={cardStyles.createCard}>
      <View style={cardStyles.createInner}>
        <View style={cardStyles.plusCircle}>
          <Ionicons name="add" size={32} color={Colors.primary} />
        </View>
        <Text style={cardStyles.createLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

const CAR_CARD_COLORS = ["#4F8EF7", "#3ECF8E", "#F5C518", "#EF476F", "#9B5DE5", "#F4633A"];
const DESIGN_CARD_COLORS = ["#7B2FBE", "#EF476F", "#3ECF8E", "#F5C518", "#4F8EF7", "#F4633A"];

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    backgroundColor: "#4F8EF7",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSelected: {
    borderWidth: 3,
    borderColor: "#3ECF8E",
    shadowColor: "#3ECF8E",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
  },
  imageArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  defaultCarArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,142,247,0.08)",
  },
  designFallbackArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,25,42,0.55)",
  },
  model3dThumb: {
    flex: 1,
    backgroundColor: "#09192A",
  },
  model3dWebView: {
    flex: 1,
    backgroundColor: "#09192A",
  },
  footer: {
    padding: 10,
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  name: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    padding: 2,
  },
  createCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary + "55",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  createInner: {
    alignItems: "center",
    gap: 10,
  },
  plusCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + "22",
    borderWidth: 2,
    borderColor: Colors.primary + "55",
    justifyContent: "center",
    alignItems: "center",
  },
  createLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  view3dBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(90,31,138,0.88)",
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(180,120,255,0.4)",
  },
  view3dBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.8,
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(62,207,142,0.92)",
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
  },
  coinDashBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  coinDashBadgeActive: {
    backgroundColor: "rgba(62,207,142,0.88)",
    borderColor: "rgba(255,255,255,0.65)",
  },
  coinDashBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
  },
});

function HomeButton({ bottomOffset }: { bottomOffset: number }) {
  const { settings } = useApp();
  const language = settings.language;
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
      testID="home-btn-garage"
    >
      <LinearGradient
        colors={["#F4633A", "#C13E20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.homeBtnGradient}
      >
        <Ionicons name="home" size={28} color="#FFFFFF" />
        <Text style={styles.homeBtnText}>{t("HOME", language)}</Text>
      </LinearGradient>
    </Pressable>
  );
}

type Tab = "cars" | "designs";

export default function GarageScreen() {
  const insets = useSafeAreaInsets();
  const { savedCars, selectedCoinDashCarId, setCoinDashCar, designs, addSavedCar, deleteSavedCar, updateSavedCar, updateDesign, settings } = useApp();
  const language = settings.language;
  const [activeTab, setActiveTab] = useState<Tab>("cars");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameType, setRenameType] = useState<Tab>("cars");
  const [renameText, setRenameText] = useState("");
  const tabAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const homeBtnBottom = insets.bottom + 24;

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(tabAnim, {
      toValue: tab === "cars" ? 0 : 1,
      tension: 100,
      friction: 14,
      useNativeDriver: false,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const autoConvertTo3d = useCallback(async (carId: string, photoUri: string) => {
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
        await updateSavedCar(carId, { model3dStatus: "failed", model3dUrl: null });
        return;
      }
      const data = await res.json() as { taskId: string };
      await updateSavedCar(carId, { model3dTaskId: data.taskId, model3dStatus: "pending", model3dUrl: null });
    } catch (_e) {
      await updateSavedCar(carId, { model3dStatus: "failed", model3dUrl: null }).catch(() => {});
    }
  }, [updateSavedCar]);

  const handleScanNewCar = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const dataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const car = await addSavedCar(dataUri, `Car ${savedCars.length + 1}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        autoConvertTo3d(car.id, dataUri);
        router.push(`/car-detail?carId=${car.id}`);
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      const libStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libStatus.status !== "granted") {
        Alert.alert("Permission needed", "Allow camera or photo library access to scan your vehicle.");
        return;
      }
    }

    Alert.alert("Add Car Photo", "Choose how to add your vehicle photo", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            const car = await addSavedCar(result.assets[0].uri, `Car ${savedCars.length + 1}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            autoConvertTo3d(car.id, result.assets[0].uri);
            router.push(`/car-detail?carId=${car.id}`);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            const car = await addSavedCar(result.assets[0].uri, `Car ${savedCars.length + 1}`);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            autoConvertTo3d(car.id, result.assets[0].uri);
            router.push(`/car-detail?carId=${car.id}`);
          }
        },
      },
    ]);
  };

  const handleDesignNew = () => {
    router.push("/design-builder");
  };

  const handleOpenDesign = (design: CarDesign) => {
    router.push(`/design-builder?designId=${design.id}`);
  };

  const handleDeleteCar = (car: SavedCar) => {
    Alert.alert("Delete Car", `Remove "${car.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSavedCar(car.id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const startRename = (id: string, type: Tab, currentName: string) => {
    setRenameId(id);
    setRenameType(type);
    setRenameText(currentName);
  };

  const commitRename = useCallback(async () => {
    if (!renameId) return;
    const trimmed = renameText.trim();
    if (!trimmed) return;
    if (renameType === "cars") {
      await updateSavedCar(renameId, { name: trimmed });
    } else {
      await updateDesign(renameId, { name: trimmed });
    }
    setRenameId(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [renameId, renameType, renameText, updateSavedCar, updateDesign]);

  const tabIndicatorLeft = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "51%"],
  });

  return (
    <AppBackground>
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 8, paddingBottom: homeBtnBottom + 76 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons name="car-sport" size={26} color={Colors.primary} />
          <Text style={styles.headerTitle}>{t("GARAGE", language)}</Text>
        </View>

        <View style={styles.tabContainer}>
          <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
          <Pressable style={styles.tabBtn} onPress={() => switchTab("cars")}>
            <Ionicons name="camera" size={15} color={activeTab === "cars" ? Colors.text : Colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === "cars" && styles.tabLabelActive]}>{t("SAVED CARS", language)}</Text>
          </Pressable>
          <Pressable style={styles.tabBtn} onPress={() => switchTab("designs")}>
            <Ionicons name="color-palette" size={15} color={activeTab === "designs" ? Colors.text : Colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === "designs" && styles.tabLabelActive]}>{t("MY DESIGNS", language)}</Text>
          </Pressable>
        </View>

        {activeTab === "cars" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={["#4F8EF7", "#2563EB"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>🚗 {t("MY CARS", language)}</Text>
              </LinearGradient>
            </View>
            <View style={styles.cardRow}>
              {savedCars.map((car, idx) => (
                <SavedCarCard
                  key={car.id}
                  car={car}
                  onPress={() => {
                    setCoinDashCar(car.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onDelete={() => handleDeleteCar(car)}
                  onRename={() => startRename(car.id, "cars", car.name)}
                  isCoinDashSelected={selectedCoinDashCarId === car.id}
                  cardColor={CAR_CARD_COLORS[idx % CAR_CARD_COLORS.length]}
                />
              ))}
              <CreateCard label={t("Scan New Car", language)} onPress={handleScanNewCar} />
            </View>
          </View>
        )}

        {activeTab === "designs" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LinearGradient colors={["#7B2FBE", "#5A1F8A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>🎨 {t("MY DESIGNS", language)}</Text>
              </LinearGradient>
            </View>
            {designs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎨</Text>
                <Text style={styles.emptyTitle}>{t("NO DESIGNS YET", language)}</Text>
                <Text style={styles.emptySubtitle}>{t("Design your dream GoBabyGo ride! Pick a base, choose colors, and add accessories.", language)}</Text>
                <Pressable onPress={handleDesignNew} style={styles.emptyBtn}>
                  <LinearGradient colors={["#7B2FBE", "#5A1F8A"]} style={styles.emptyBtnGrad}>
                    <Ionicons name="color-palette" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyBtnText}>{t("DESIGN NEW CAR!", language)}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View style={styles.cardRow}>
                {designs.map((design, idx) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    onPress={() => handleOpenDesign(design)}
                    cardColor={DESIGN_CARD_COLORS[idx % DESIGN_CARD_COLORS.length]}
                  />
                ))}
                <CreateCard label={t("Design New Car", language)} onPress={handleDesignNew} />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <HomeButton bottomOffset={homeBtnBottom} />

      {renameId && (
        <View style={styles.renameOverlay}>
          <Pressable style={styles.renameBackdrop} onPress={() => setRenameId(null)} />
          <View style={styles.renameSheet}>
            <Text style={styles.renameTitle}>{t("RENAME", language)}</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              placeholder={t("Enter new name...", language)}
              placeholderTextColor={Colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={commitRename}
              maxLength={30}
            />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameId(null)} style={styles.renameCancelBtn}>
                <Text style={styles.renameCancelText}>{t("CANCEL", language)}</Text>
              </Pressable>
              <Pressable onPress={commitRename} style={styles.renameSaveBtn}>
                <Text style={styles.renameSaveText}>{t("SAVE", language)}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    marginRight: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 32,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 3,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
    marginTop: 2,
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
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 3,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    padding: 4,
    marginBottom: 24,
    position: "relative",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    width: "47%",
    bottom: 4,
    backgroundColor: Colors.primary,
    borderRadius: 46,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    zIndex: 1,
  },
  tabLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: Colors.text,
  },
  section: {
    minHeight: CARD_HEIGHT + 40,
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
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1.5,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 28,
  },
  emptyEmoji: {
    fontSize: 52,
  },
  defaultCarWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "rgba(79,142,247,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(79,142,247,0.2)",
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 2,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "BalsamiqSans_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  emptyBtn: {
    borderRadius: 50,
    overflow: "hidden",
    width: "100%",
    marginTop: 4,
  },
  emptyBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
  bottomActions: {
    marginTop: 28,
    gap: 12,
  },
  fabBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fabGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    zIndex: 101,
  },
  previewOverlayHidden: {
    opacity: 0,
  },
  previewBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  previewSheet: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 2,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1.3,
  },
  previewTitle: {
    color: Colors.text,
    fontSize: 18,
    fontFamily: "BalsamiqSans_700Bold",
    marginTop: 2,
  },
  previewCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewViewerWrap: {
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#09192A",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewViewer: {
    flex: 1,
    backgroundColor: "#09192A",
  },
  previewFallback: {
    height: 220,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,142,247,0.08)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewDetailsBtn: {
    borderRadius: 50,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewDetailsText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
  renameOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "flex-end",
    zIndex: 101,
  },
  renameBackdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  renameSheet: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
    borderTopWidth: 2,
    borderColor: Colors.border,
  },
  renameTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  renameInput: {
    backgroundColor: Colors.backgroundDeep,
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 16,
    fontFamily: "BalsamiqSans_700Bold",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  renameActions: {
    flexDirection: "row",
    gap: 12,
  },
  renameCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
  },
  renameCancelText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
  renameSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  renameSaveText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1,
  },
});
