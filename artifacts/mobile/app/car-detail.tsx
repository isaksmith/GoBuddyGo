import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StickerPicker } from "@/components/StickerPicker";
import { Colors } from "@/constants/colors";
import {
  Model3dStatus,
  PlacedSticker,
  StickerDefinition,
  STICKER_CATALOG,
  makeStickerUid,
  useApp,
} from "@/context/AppContext";
import { getApiBaseUrl } from "@/utils/apiUrl";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_AREA_HEIGHT = 260;

function DraggableSticker({
  placed,
  onMove,
  onRemove,
}: {
  placed: PlacedSticker;
  onMove: (uid: string, x: number, y: number) => void;
  onRemove: (uid: string) => void;
}) {
  const sticker = STICKER_CATALOG.find((s) => s.id === placed.stickerId);
  const position = useRef({ x: placed.x, y: placed.y });
  const pan = useRef(new Animated.ValueXY({ x: placed.x, y: placed.y })).current;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const listenerId = pan.addListener((value) => {
      position.current = value;
    });
    return () => pan.removeListener(listenerId);
  }, [pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(position.current);
        pan.setValue({ x: 0, y: 0 });
        longPressTimer.current = setTimeout(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onRemove(placed.uid);
        }, 800);
      },
      onPanResponderMove: (_, gs) => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(_, gs);
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
        pan.flattenOffset();
        onMove(placed.uid, position.current.x, position.current.y);
      },
    })
  ).current;

  if (!sticker) return null;
  return (
    <Animated.View style={[styles.stickerOnVehicle, { transform: pan.getTranslateTransform() }]} {...panResponder.panHandlers}>
      <Text style={styles.stickerOnVehicleEmoji}>{sticker.emoji}</Text>
    </Animated.View>
  );
}

function ModelViewer({ modelUrl, onClose }: { modelUrl: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>
<style>* { margin:0;padding:0;box-sizing:border-box; } html,body{width:100%;height:100%;background:#09192A;overflow:hidden;}
model-viewer{width:100%;height:100%;background-color:#09192A;}</style></head>
<body><model-viewer src="${modelUrl}" camera-controls auto-rotate auto-rotate-delay="0"
rotation-per-second="30deg" shadow-intensity="1" environment-image="neutral" exposure="1"
alt="3D model of your GoBabyGo vehicle"></model-viewer></body></html>`;
  return (
    <Modal animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.viewerContainer, { paddingTop: insets.top }]}>
        <View style={styles.viewerHeader}>
          <Text style={styles.viewerTitle}>🚀 YOUR 3D RIDE</Text>
          <Pressable onPress={onClose} style={styles.viewerCloseBtn} hitSlop={10}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
        </View>
        <WebView source={{ html }} style={styles.webView} originWhitelist={["*"]} javaScriptEnabled domStorageEnabled allowFileAccess mixedContentMode="always" />
        <View style={[styles.viewerFooter, { paddingBottom: insets.bottom + 12 }]}>
          <Text style={styles.viewerHint}>Drag to rotate · Pinch to zoom</Text>
        </View>
      </View>
    </Modal>
  );
}

export default function CarDetailScreen() {
  const insets = useSafeAreaInsets();
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { savedCars, updateSavedCar, deleteSavedCar, isStickerUnlocked, isLoaded } = useApp();

  const car = savedCars.find((c) => c.id === carId);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(car?.name ?? "My Ride");
  const [photoAreaLayout, setPhotoAreaLayout] = useState({ width: SCREEN_WIDTH - 32, height: PHOTO_AREA_HEIGHT });
  const slideAnim = useRef(new Animated.Value(400)).current;
  const [viewerVisible, setViewerVisible] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTaskIdRef = useRef<string | null>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const model3dStatus = car?.model3dStatus ?? "idle";
  const model3dUrl = car?.model3dUrl ?? null;
  const model3dTaskId = car?.model3dTaskId ?? null;

  useEffect(() => {
    if (!editingName && car?.name) setNameInput(car.name);
  }, [car?.name, editingName]);

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
          await updateSavedCar(taskId.startsWith("poll_") ? taskId.replace("poll_", "") : carId!, {
            model3dStatus: url ? "succeeded" : "failed",
            model3dUrl: url,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (data.status === "failed") {
          stopPolling();
          await updateSavedCar(carId!, { model3dStatus: "failed", model3dUrl: null });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (e) { console.warn("Polling failed:", e); }
    };
    pollTimerRef.current = setInterval(poll, 5000);
    poll();
  }, [stopPolling, updateSavedCar, carId]);

  useEffect(() => {
    if (!isLoaded || !carId) return;
    if (model3dStatus === "pending" && model3dTaskId && !pollTimerRef.current) {
      startPolling(model3dTaskId);
    }
  }, [isLoaded, model3dStatus, model3dTaskId, startPolling, carId]);

  useEffect(() => { return () => stopPolling(); }, [stopPolling]);

  useEffect(() => {
    if (model3dStatus === "pending") {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    } else {
      dotAnim.setValue(0);
    }
  }, [model3dStatus, dotAnim]);

  const openPicker = useCallback(() => {
    setPickerVisible(true);
    slideAnim.setValue(400);
    Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
  }, [slideAnim]);

  const closePicker = useCallback(() => {
    Animated.timing(slideAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(() => setPickerVisible(false));
  }, [slideAnim]);

  const handlePickSticker = useCallback((sticker: StickerDefinition) => {
    if (!car || !carId) return;
    const cx = photoAreaLayout.width / 2 - 20;
    const cy = photoAreaLayout.height / 2 - 20;
    const newSticker: PlacedSticker = { uid: makeStickerUid(), stickerId: sticker.id, x: cx, y: cy };
    updateSavedCar(carId, { stickers: [...car.stickers, newSticker] });
    closePicker();
  }, [car, carId, photoAreaLayout, updateSavedCar, closePicker]);

  const handleMoveSticker = useCallback(async (uid: string, x: number, y: number) => {
    if (!car || !carId) return;
    const stickers = car.stickers.map((s) => s.uid === uid ? { ...s, x, y } : s);
    await updateSavedCar(carId, { stickers });
  }, [car, carId, updateSavedCar]);

  const handleRemoveSticker = useCallback(async (uid: string) => {
    if (!car || !carId) return;
    const stickers = car.stickers.filter((s) => s.uid !== uid);
    await updateSavedCar(carId, { stickers });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [car, carId, updateSavedCar]);

  const handleSaveName = async () => {
    if (!carId) return;
    await updateSavedCar(carId, { name: nameInput.trim() || "My Ride" });
    setEditingName(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRescan = () => {
    Alert.alert("Rescan Vehicle?", "This will replace your current photo. Stickers and 3D model will be cleared.", [
      { text: "Cancel", style: "cancel" },
      { text: "Rescan", style: "destructive", onPress: doRescan },
    ]);
  };

  const doRescan = async () => {
    if (Platform.OS === "web") {
      stopPolling();
      await updateSavedCar(carId!, {
        photoUri: "https://placehold.co/600x400/112840/F4633A?text=My+Ride",
        stickers: [],
        model3dTaskId: null,
        model3dStatus: "idle",
        model3dUrl: null,
      });
      return;
    }

    Alert.alert("Add New Photo", "Choose how to add your vehicle photo", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Take Photo",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            stopPolling();
            await updateSavedCar(carId!, {
              photoUri: result.assets[0].uri,
              stickers: [],
              model3dTaskId: null,
              model3dStatus: "idle",
              model3dUrl: null,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            stopPolling();
            await updateSavedCar(carId!, {
              photoUri: result.assets[0].uri,
              stickers: [],
              model3dTaskId: null,
              model3dStatus: "idle",
              model3dUrl: null,
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
      },
    ]);
  };

  const handleConvertTo3d = async () => {
    if (!car?.photoUri || !carId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      let imageDataUri: string;
      if (Platform.OS === "web") {
        const response = await fetch(car.photoUri);
        const blob = await response.blob();
        imageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else if (car.photoUri.startsWith("data:")) {
        imageDataUri = car.photoUri;
      } else {
        const base64 = await FileSystem.readAsStringAsync(car.photoUri, { encoding: FileSystem.EncodingType.Base64 });
        imageDataUri = `data:image/jpeg;base64,${base64}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/image-to-3d`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUri }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Network error" }));
        Alert.alert("Conversion failed", err.error ?? "Could not start 3D conversion.");
        return;
      }
      const data = await res.json() as { taskId: string };
      await updateSavedCar(carId, { model3dTaskId: data.taskId, model3dStatus: "pending", model3dUrl: null });
      startPolling(data.taskId);
    } catch (e) {
      Alert.alert("Conversion failed", e instanceof Error ? e.message : "Unknown error");
    }
  };

  const handleRetry3d = async () => {
    if (!carId) return;
    await updateSavedCar(carId, { model3dTaskId: null, model3dStatus: "idle", model3dUrl: null });
    setTimeout(() => handleConvertTo3d(), 100);
  };

  const handleDelete = () => {
    Alert.alert("Delete Car", `Remove "${car?.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          stopPolling();
          await deleteSavedCar(carId!);
          router.back();
        },
      },
    ]);
  };

  const unlockedCount = STICKER_CATALOG.filter((s) => isStickerUnlocked(s)).length;
  const showConvertBtn = !!car?.photoUri && (model3dStatus === "idle" || model3dStatus === "failed");
  const showPending = model3dStatus === "pending";
  const showViewBtn = model3dStatus === "succeeded" && !!model3dUrl;

  if (!car) {
    return (
      <LinearGradient colors={[Colors.background, Colors.backgroundDeep]} style={styles.container}>
        <View style={[styles.notFound, { paddingTop: topPad + 20 }]}>
          <Text style={styles.notFoundText}>Car not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtnAlt}>
            <Text style={styles.backBtnAltText}>← Back to Garage</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerVisible}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🚗 MY CAR</Text>
            <Text style={styles.headerSub}>{unlockedCount} STICKERS UNLOCKED</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={handleRescan} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="camera" size={18} color={Colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </Pressable>
          </View>
        </View>

        <View style={styles.nameRow}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Car name..."
                placeholderTextColor={Colors.textMuted}
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
                maxLength={30}
              />
              <Pressable onPress={handleSaveName} style={styles.nameSaveBtn}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={styles.nameDisplay}>
              <Ionicons name="car-sport" size={20} color={Colors.secondary} />
              <Text style={styles.nameText}>{car.name.toUpperCase()}</Text>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.vehicleArea} onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          setPhotoAreaLayout({ width, height });
        }}>
          <Image source={{ uri: car.photoUri }} style={styles.vehiclePhoto} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(9,25,42,0.5)"]} style={styles.vehiclePhotoOverlay} />
          {car.stickers.map((placed) => (
            <DraggableSticker key={placed.uid} placed={placed} onMove={handleMoveSticker} onRemove={handleRemoveSticker} />
          ))}
          {car.stickers.length === 0 && (
            <View style={styles.stickerHint} pointerEvents="none">
              <Text style={styles.stickerHintText}>TAP + TO ADD STICKERS!</Text>
            </View>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={openPicker} style={styles.addStickerBtn}>
            <LinearGradient colors={[Colors.accent, "#2DB87A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addStickerBtnGrad}>
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.addStickerBtnText}>ADD STICKER</Text>
            </LinearGradient>
          </Pressable>
          {car.stickers.length > 0 && (
            <View style={styles.stickerCountPill}>
              <Text style={styles.stickerCountText}>{car.stickers.length} ON RIDE</Text>
            </View>
          )}
        </View>

        <View style={styles.helpRow}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.helpText}>DRAG stickers to move · HOLD to remove</Text>
        </View>

        {showConvertBtn && (
          <Pressable onPress={handleConvertTo3d} style={styles.convert3dBtn}>
            <LinearGradient colors={["#7B2FBE", "#5A1F8A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.convert3dBtnGrad}>
              <Text style={styles.convert3dBtnText}>CONVERT TO 3D ✨</Text>
            </LinearGradient>
          </Pressable>
        )}

        {model3dStatus === "failed" && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>3D conversion failed. Try again.</Text>
          </View>
        )}

        {showPending && (
          <View style={styles.pendingCard}>
            <LinearGradient colors={[Colors.backgroundCard, "#1a1040"]} style={styles.pendingGrad}>
              <Animated.Text style={[styles.pendingEmoji, { opacity: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]}>🔮</Animated.Text>
              <Text style={styles.pendingTitle}>BUILDING YOUR 3D RIDE…</Text>
              <Text style={styles.pendingSubtitle}>This takes 1–2 minutes. Stay on this screen!</Text>
              <View style={styles.pendingDots}>
                {[0, 1, 2].map((i) => (
                  <Animated.View key={i} style={[styles.pendingDot, { opacity: dotAnim.interpolate({ inputRange: [0, 1], outputRange: [i === 0 ? 0.3 : 0.1, i === 0 ? 1 : 0.6] }) }]} />
                ))}
              </View>
            </LinearGradient>
          </View>
        )}

        {showViewBtn && (
          <Pressable onPress={() => setViewerVisible(true)} style={styles.view3dBtn}>
            <LinearGradient colors={[Colors.accentBlue, "#1565C0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.view3dBtnGrad}>
              <Ionicons name="cube" size={22} color="#FFFFFF" />
              <Text style={styles.view3dBtnText}>VIEW IN 3D 🚀</Text>
            </LinearGradient>
          </Pressable>
        )}

        {showViewBtn && (
          <Pressable onPress={handleRetry3d} style={styles.regenerateRow}>
            <Ionicons name="refresh" size={13} color={Colors.textMuted} />
            <Text style={styles.regenerateText}>REGENERATE 3D MODEL</Text>
          </Pressable>
        )}

        <View style={styles.stickerCatalog}>
          <Text style={styles.catalogTitle}>YOUR STICKER COLLECTION</Text>
          <View style={styles.catalogGrid}>
            {STICKER_CATALOG.map((sticker) => {
              const unlocked = isStickerUnlocked(sticker);
              return (
                <Pressable
                  key={sticker.id}
                  onPress={() => {
                    if (!unlocked || !car || !carId) return;
                    const newSticker: PlacedSticker = {
                      uid: makeStickerUid(),
                      stickerId: sticker.id,
                      x: photoAreaLayout.width / 2 - 20,
                      y: photoAreaLayout.height / 2 - 20,
                    };
                    updateSavedCar(carId, { stickers: [...car.stickers, newSticker] });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  style={[
                    styles.catalogCell,
                    unlocked ? { borderColor: sticker.color + "66", backgroundColor: sticker.color + "15" } : { borderColor: Colors.border, opacity: 0.5 },
                  ]}
                >
                  <Text style={[styles.catalogEmoji, !unlocked && { opacity: 0.3 }]}>{sticker.emoji}</Text>
                  {!unlocked && (
                    <View style={styles.catalogLock}>
                      <Ionicons name="lock-closed" size={10} color={Colors.textMuted} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {pickerVisible && <Pressable style={styles.pickerBackdrop} onPress={closePicker} />}
      <StickerPicker
        visible={pickerVisible}
        onClose={closePicker}
        onPickSticker={handlePickSticker}
        isStickerUnlocked={isStickerUnlocked}
        slideAnim={slideAnim}
      />
      {viewerVisible && model3dUrl && <ModelViewer modelUrl={model3dUrl} onClose={() => setViewerVisible(false)} />}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 32 },
  notFoundText: { color: Colors.text, fontSize: 18, fontFamily: "Nunito_700Bold" },
  backBtnAlt: { backgroundColor: Colors.primary, borderRadius: 50, paddingVertical: 12, paddingHorizontal: 24 },
  backBtnAltText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Nunito_700Bold" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1 },
  headerTitle: { color: Colors.text, fontSize: 22, fontFamily: "Nunito_700Bold", letterSpacing: 2 },
  headerSub: { color: Colors.accent, fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1, marginTop: 1 },
  headerRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2, borderColor: Colors.border,
    justifyContent: "center", alignItems: "center",
  },
  nameRow: { marginBottom: 14 },
  nameDisplay: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50, paddingVertical: 10, paddingHorizontal: 18,
    borderWidth: 2, borderColor: Colors.secondary + "55", alignSelf: "flex-start",
  },
  nameText: { color: Colors.secondary, fontSize: 14, fontFamily: "Nunito_700Bold", letterSpacing: 1 },
  nameEditRow: { flexDirection: "row", gap: 10 },
  nameInput: {
    flex: 1, backgroundColor: Colors.backgroundCard, borderRadius: 50,
    paddingVertical: 12, paddingHorizontal: 20, color: Colors.text,
    fontSize: 15, fontFamily: "Nunito_700Bold", borderWidth: 2, borderColor: Colors.secondary,
  },
  nameSaveBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  vehicleArea: {
    width: "100%", height: PHOTO_AREA_HEIGHT, borderRadius: 22, overflow: "hidden",
    borderWidth: 3, borderColor: Colors.primary + "66", marginBottom: 12,
    backgroundColor: Colors.backgroundCard,
  },
  vehiclePhoto: { width: "100%", height: "100%" },
  vehiclePhotoOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },
  stickerOnVehicle: { position: "absolute", top: 0, left: 0 },
  stickerOnVehicleEmoji: { fontSize: 42 },
  stickerHint: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  stickerHintText: { color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Nunito_700Bold", letterSpacing: 1.5 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  addStickerBtn: { flex: 1, borderRadius: 50, overflow: "hidden" },
  addStickerBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 50 },
  addStickerBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Nunito_700Bold", letterSpacing: 1.5 },
  stickerCountPill: { backgroundColor: Colors.backgroundCard, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, borderColor: Colors.accent + "55" },
  stickerCountText: { color: Colors.accent, fontSize: 11, fontFamily: "Nunito_700Bold", letterSpacing: 0.5 },
  helpRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  helpText: { color: Colors.textMuted, fontSize: 11, fontFamily: "Nunito_700Bold", letterSpacing: 0.5 },
  convert3dBtn: { borderRadius: 50, overflow: "hidden", marginBottom: 10 },
  convert3dBtnGrad: { alignItems: "center", justifyContent: "center", paddingVertical: 18, borderRadius: 50 },
  convert3dBtnText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Nunito_700Bold", letterSpacing: 1.5 },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  errorText: { color: Colors.danger, fontSize: 12, fontFamily: "Nunito_700Bold", letterSpacing: 0.5 },
  pendingCard: { borderRadius: 20, overflow: "hidden", marginBottom: 14, borderWidth: 2, borderColor: "#7B2FBE55" },
  pendingGrad: { padding: 22, alignItems: "center", gap: 8 },
  pendingEmoji: { fontSize: 44 },
  pendingTitle: { color: Colors.text, fontSize: 15, fontFamily: "Nunito_700Bold", letterSpacing: 1.5, textAlign: "center" },
  pendingSubtitle: { color: Colors.textSecondary, fontSize: 12, fontFamily: "Nunito_400Regular", textAlign: "center" },
  pendingDots: { flexDirection: "row", gap: 8, marginTop: 4 },
  pendingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#7B2FBE" },
  view3dBtn: { borderRadius: 50, overflow: "hidden", marginBottom: 8 },
  view3dBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, borderRadius: 50 },
  view3dBtnText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Nunito_700Bold", letterSpacing: 1.5 },
  regenerateRow: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "center", marginBottom: 16 },
  regenerateText: { color: Colors.textMuted, fontSize: 10, fontFamily: "Nunito_700Bold", letterSpacing: 1 },
  stickerCatalog: { marginTop: 4 },
  catalogTitle: { color: Colors.textSecondary, fontSize: 11, fontFamily: "Nunito_700Bold", letterSpacing: 2, marginBottom: 12 },
  catalogGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catalogCell: { width: 52, height: 52, borderRadius: 16, borderWidth: 2, justifyContent: "center", alignItems: "center", position: "relative" },
  catalogEmoji: { fontSize: 26 },
  catalogLock: { position: "absolute", bottom: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: Colors.backgroundDeep, borderWidth: 1, borderColor: Colors.border, justifyContent: "center", alignItems: "center" },
  pickerBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  viewerContainer: { flex: 1, backgroundColor: Colors.backgroundDeep },
  viewerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  viewerTitle: { color: Colors.text, fontSize: 18, fontFamily: "Nunito_700Bold", letterSpacing: 2 },
  viewerCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.backgroundCard, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  webView: { flex: 1, backgroundColor: Colors.backgroundDeep },
  viewerFooter: { alignItems: "center", paddingTop: 10, backgroundColor: Colors.backgroundDeep },
  viewerHint: { color: Colors.textMuted, fontSize: 11, fontFamily: "Nunito_700Bold", letterSpacing: 1 },
});
