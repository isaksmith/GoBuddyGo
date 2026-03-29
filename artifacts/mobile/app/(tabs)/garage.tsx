import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
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
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DefaultCarSvg from "@/components/DefaultCarSvg";
import { Colors } from "@/constants/colors";
import {
  CarDesign,
  SavedCar,
  VEHICLE_TYPES,
  DESIGN_ACCESSORIES,
  useApp,
} from "@/context/AppContext";
import { getApiBaseUrl } from "@/utils/apiUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = 160;
const CARD_HEIGHT = 210;

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

function SavedCarCard({ car, onPress, onDelete, onRename, onView3d }: {
  car: SavedCar;
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
  onView3d?: () => void;
}) {
  const has3d = car.model3dStatus === "succeeded" && !!car.model3dUrl;
  return (
    <Pressable onPress={onPress} style={cardStyles.card}>
      <View style={cardStyles.imageArea}>
        {has3d ? (
          <View style={cardStyles.model3dThumb} pointerEvents="none">
            <WebView
              source={{ html: `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#09192A;overflow:hidden}model-viewer{width:100%;height:100%;background-color:#09192A;--poster-color:#09192A;}</style></head><body><model-viewer src="${car.model3dUrl}" camera-orbit="225deg 65deg auto" camera-controls="false" interaction-prompt="none" auto-rotate="false" shadow-intensity="1" environment-image="neutral" exposure="1.2" alt="3D car preview"></model-viewer></body></html>` }}
              style={cardStyles.model3dWebView}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              allowFileAccess
              mixedContentMode="always"
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
        {has3d && onView3d && (
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onView3d(); }}
            style={cardStyles.view3dBadge}
            hitSlop={6}
          >
            <Ionicons name="cube" size={11} color="#FFFFFF" />
            <Text style={cardStyles.view3dBadgeText}>VIEW 3D</Text>
          </Pressable>
        )}
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.name} numberOfLines={1}>{car.name}</Text>
        {!car.isDefault && (
          <View style={cardStyles.actions}>
            <Pressable onPress={onRename} hitSlop={8} style={cardStyles.actionBtn}>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
            </Pressable>
            <Pressable onPress={onDelete} hitSlop={8} style={cardStyles.actionBtn}>
              <Ionicons name="trash-outline" size={14} color={Colors.danger} />
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function DesignCard({ design, onPress, onDelete, onRename }: {
  design: CarDesign;
  onPress: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={cardStyles.card}>
      <View style={[cardStyles.imageArea, { justifyContent: "center", alignItems: "center", backgroundColor: Colors.backgroundDeep }]}>
        <DesignPreview design={design} size={70} />
      </View>
      <View style={cardStyles.footer}>
        <Text style={cardStyles.name} numberOfLines={1}>{design.name}</Text>
        <View style={cardStyles.actions}>
          <Pressable onPress={onRename} hitSlop={8} style={cardStyles.actionBtn}>
            <Ionicons name="pencil" size={14} color={Colors.primary} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8} style={cardStyles.actionBtn}>
            <Ionicons name="trash-outline" size={14} color={Colors.danger} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

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

const cardStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  imageArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDeep,
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
  },
  name: {
    color: Colors.text,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
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
    borderRadius: 18,
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
  },
});

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
      testID="home-btn-garage"
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

type Tab = "cars" | "designs";

export default function GarageScreen() {
  const insets = useSafeAreaInsets();
  const { savedCars, designs, addSavedCar, deleteSavedCar, updateSavedCar, deleteDesign, updateDesign } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("cars");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameType, setRenameType] = useState<Tab>("cars");
  const [renameText, setRenameText] = useState("");
  const tabAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const homeBtnBottom = insets.bottom + 82;

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

  const handleImportGlb = useCallback(async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".glb";
      input.onchange = async () => {
        try {
          const file = input.files?.[0];
          if (!file) return;
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const name = file.name.replace(/\.glb$/i, "") || `Import ${savedCars.length + 1}`;
          const car = await addSavedCar("", name);
          await updateSavedCar(car.id, {
            model3dStatus: "succeeded",
            model3dUrl: dataUri,
            model3dTaskId: null,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
          Alert.alert("Import failed", e instanceof Error ? e.message : "Could not import GLB file.");
        }
      };
      input.click();
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["model/gltf-binary", "application/octet-stream"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const fileName = asset.name ?? "";
      if (!fileName.toLowerCase().endsWith(".glb")) {
        Alert.alert("Invalid file", "Please select a .glb file.");
        return;
      }
      const uri = asset.uri;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const dataUri = `data:model/gltf-binary;base64,${base64}`;
      const rawName = fileName.replace(/\.glb$/i, "") || `Import ${savedCars.length + 1}`;
      const car = await addSavedCar("", rawName);
      await updateSavedCar(car.id, {
        model3dStatus: "succeeded",
        model3dUrl: dataUri,
        model3dTaskId: null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Import failed", e instanceof Error ? e.message : "Could not import GLB file.");
    }
  }, [savedCars.length, addSavedCar, updateSavedCar]);

  const handleDesignNew = () => {
    router.push("/design-builder");
  };

  const handleOpenCar = (car: SavedCar) => {
    router.push(`/car-detail?carId=${car.id}`);
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

  const handleDeleteDesign = (design: CarDesign) => {
    Alert.alert("Delete Design", `Remove "${design.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDesign(design.id);
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 8, paddingBottom: homeBtnBottom + 76 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🏠 GARAGE</Text>
            <Text style={styles.headerSub}>
              {savedCars.length} {savedCars.length === 1 ? "CAR" : "CARS"} · {designs.length} {designs.length === 1 ? "DESIGN" : "DESIGNS"}
            </Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
          <Pressable style={styles.tabBtn} onPress={() => switchTab("cars")}>
            <Ionicons name="camera" size={15} color={activeTab === "cars" ? Colors.text : Colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === "cars" && styles.tabLabelActive]}>SAVED CARS</Text>
          </Pressable>
          <Pressable style={styles.tabBtn} onPress={() => switchTab("designs")}>
            <Ionicons name="color-palette" size={15} color={activeTab === "designs" ? Colors.text : Colors.textMuted} />
            <Text style={[styles.tabLabel, activeTab === "designs" && styles.tabLabelActive]}>MY DESIGNS</Text>
          </Pressable>
        </View>

        {activeTab === "cars" && (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardRow}
            >
              {savedCars.map((car) => (
                <SavedCarCard
                  key={car.id}
                  car={car}
                  onPress={() => handleOpenCar(car)}
                  onDelete={() => handleDeleteCar(car)}
                  onRename={() => startRename(car.id, "cars", car.name)}
                  onView3d={() => handleOpenCar(car)}
                />
              ))}
              <CreateCard label="Scan New Car" onPress={handleScanNewCar} />
            </ScrollView>
            <Text style={styles.scrollHint}>← Swipe to see more cars</Text>
            <Pressable onPress={handleImportGlb} style={styles.importGlbBtn}>
              <Ionicons name="construct-outline" size={14} color="#A0C4FF" />
              <Text style={styles.importGlbText}>⚙️ Import GLB</Text>
            </Pressable>
          </View>
        )}

        {activeTab === "designs" && (
          <View style={styles.section}>
            {designs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎨</Text>
                <Text style={styles.emptyTitle}>NO DESIGNS YET</Text>
                <Text style={styles.emptySubtitle}>Design your dream GoBabyGo ride! Pick a base, choose colors, and add accessories.</Text>
                <Pressable onPress={handleDesignNew} style={styles.emptyBtn}>
                  <LinearGradient colors={["#7B2FBE", "#5A1F8A"]} style={styles.emptyBtnGrad}>
                    <Ionicons name="color-palette" size={20} color="#FFFFFF" />
                    <Text style={styles.emptyBtnText}>DESIGN NEW CAR!</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardRow}
              >
                {designs.map((design) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    onPress={() => handleOpenDesign(design)}
                    onDelete={() => handleDeleteDesign(design)}
                    onRename={() => startRename(design.id, "designs", design.name)}
                  />
                ))}
                <CreateCard label="Design New Car" onPress={handleDesignNew} />
              </ScrollView>
            )}

            {designs.length > 0 && (
              <Text style={styles.scrollHint}>← Swipe to see more designs</Text>
            )}
          </View>
        )}

        <View style={styles.bottomActions}>
          {activeTab === "cars" && savedCars.length > 0 && (
            <Pressable onPress={handleScanNewCar} style={styles.fabBtn}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.fabGrad}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.fabText}>SCAN NEW CAR</Text>
              </LinearGradient>
            </Pressable>
          )}
          {activeTab === "designs" && designs.length > 0 && (
            <Pressable onPress={handleDesignNew} style={styles.fabBtn}>
              <LinearGradient colors={["#7B2FBE", "#5A1F8A"]} style={styles.fabGrad}>
                <Ionicons name="color-palette" size={20} color="#FFFFFF" />
                <Text style={styles.fabText}>DESIGN NEW CAR</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <HomeButton bottomOffset={homeBtnBottom} />

      {renameId && (
        <View style={styles.renameOverlay}>
          <Pressable style={styles.renameBackdrop} onPress={() => setRenameId(null)} />
          <View style={styles.renameSheet}>
            <Text style={styles.renameTitle}>RENAME</Text>
            <TextInput
              style={styles.renameInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              placeholder="Enter new name..."
              placeholderTextColor={Colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={commitRename}
              maxLength={30}
            />
            <View style={styles.renameActions}>
              <Pressable onPress={() => setRenameId(null)} style={styles.renameCancelBtn}>
                <Text style={styles.renameCancelText}>CANCEL</Text>
              </Pressable>
              <Pressable onPress={commitRename} style={styles.renameSaveBtn}>
                <Text style={styles.renameSaveText}>SAVE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  backBtn: {
    marginRight: 2,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
  },
  tabLabelActive: {
    color: Colors.text,
  },
  section: {
    minHeight: CARD_HEIGHT + 40,
  },
  cardRow: {
    paddingRight: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  scrollHint: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
    marginTop: 12,
    textAlign: "center",
  },
  importGlbBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "#A0C4FF55",
    borderStyle: "dashed",
    backgroundColor: "rgba(160,196,255,0.06)",
  },
  importGlbText: {
    color: "#A0C4FF",
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.8,
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  renameOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "flex-end",
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
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
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
});
