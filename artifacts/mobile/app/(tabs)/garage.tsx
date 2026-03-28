import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StickerPicker } from "@/components/StickerPicker";
import { Colors } from "@/constants/colors";
import { PlacedSticker, StickerDefinition, STICKER_CATALOG, useApp } from "@/context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_AREA_HEIGHT = 280;

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

  pan.addListener((value) => {
    position.current = value;
  });

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
      onPanResponderMove: (_, gestureState) => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(
          _,
          gestureState
        );
      },
      onPanResponderRelease: () => {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        pan.flattenOffset();
        onMove(placed.uid, position.current.x, position.current.y);
      },
    })
  ).current;

  if (!sticker) return null;

  return (
    <Animated.View
      style={[styles.stickerOnVehicle, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.stickerOnVehicleEmoji}>{sticker.emoji}</Text>
    </Animated.View>
  );
}

export default function GarageScreen() {
  const insets = useSafeAreaInsets();
  const {
    garage,
    setVehiclePhoto,
    setVehicleName,
    placeSticker,
    removeSticker,
    moveSticker,
    isStickerUnlocked,
  } = useApp();

  const [pickerVisible, setPickerVisible] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(garage.vehicleName);
  const [photoAreaLayout, setPhotoAreaLayout] = useState({ width: SCREEN_WIDTH - 32, height: PHOTO_AREA_HEIGHT });
  const slideAnim = useRef(new Animated.Value(400)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const openPicker = useCallback(() => {
    setPickerVisible(true);
    slideAnim.setValue(400);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 80,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const closePicker = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setPickerVisible(false));
  }, [slideAnim]);

  const handlePickSticker = useCallback(
    (sticker: StickerDefinition) => {
      const cx = photoAreaLayout.width / 2 - 20;
      const cy = photoAreaLayout.height / 2 - 20;
      placeSticker(sticker.id, cx, cy);
      closePicker();
    },
    [photoAreaLayout, placeSticker, closePicker]
  );

  const handleScanRide = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Scan on Device",
        "Camera scanning works on a real iOS or Android device. On web, tap OK to use a placeholder.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Use Placeholder",
            onPress: () => setVehiclePhoto("https://placehold.co/600x400/112840/F4633A?text=My+Ride"),
          },
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera needed", "Allow camera access to scan your vehicle.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setVehiclePhoto(result.assets[0].uri);
    }
  };

  const handleReScan = async () => {
    Alert.alert(
      "Rescan Vehicle?",
      "This will replace your current photo. Your stickers will stay.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Rescan", style: "destructive", onPress: handleScanRide },
      ]
    );
  };

  const handleSaveName = async () => {
    await setVehicleName(nameInput.trim() || "My Ride");
    setEditingName(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePhotoAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPhotoAreaLayout({ width, height });
  };

  const handleMoveSticker = useCallback(
    async (uid: string, x: number, y: number) => {
      await moveSticker(uid, x, y);
    },
    [moveSticker]
  );

  const handleRemoveSticker = useCallback(
    async (uid: string) => {
      await removeSticker(uid);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [removeSticker]
  );

  const unlockedCount = STICKER_CATALOG.filter((s) => isStickerUnlocked(s)).length;

  return (
    <LinearGradient
      colors={[Colors.background, Colors.backgroundMid, Colors.backgroundDeep]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 8, paddingBottom: bottomPad + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!pickerVisible}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>🚗 GARAGE</Text>
            <Text style={styles.headerSub}>{unlockedCount} STICKERS UNLOCKED</Text>
          </View>
          {garage.photoUri && (
            <Pressable onPress={handleReScan} style={styles.rescanBtn}>
              <Ionicons name="camera" size={16} color={Colors.primary} />
              <Text style={styles.rescanBtnText}>RESCAN</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.nameRow}>
          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Ride name..."
                placeholderTextColor={Colors.textMuted}
                autoFocus
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
              />
              <Pressable onPress={handleSaveName} style={styles.nameSaveBtn}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditingName(true)} style={styles.nameDisplay}>
              <Ionicons name="car-sport" size={20} color={Colors.secondary} />
              <Text style={styles.nameText}>{garage.vehicleName.toUpperCase()}</Text>
              <Ionicons name="pencil" size={14} color={Colors.primary} />
            </Pressable>
          )}
        </View>

        {!garage.photoUri ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[Colors.backgroundCard, Colors.backgroundDeep]}
              style={styles.emptyCard}
            >
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyEmoji}>🚗</Text>
              </View>
              <Text style={styles.emptyTitle}>SCAN YOUR RIDE!</Text>
              <Text style={styles.emptySubtitle}>
                Take a photo of your GoBabyGo vehicle and turn it into your virtual garage car!
              </Text>
              <Pressable onPress={handleScanRide} style={styles.scanBtn} testID="scan-ride-btn">
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanBtnGradient}
                >
                  <Ionicons name="camera" size={26} color="#FFFFFF" />
                  <Text style={styles.scanBtnText}>SCAN YOUR RIDE!</Text>
                </LinearGradient>
              </Pressable>
              <View style={styles.stickerPreviewRow}>
                <Text style={styles.stickerPreviewLabel}>STICKERS WAITING FOR YOU:</Text>
                <View style={styles.stickerPreviewEmojis}>
                  {STICKER_CATALOG.slice(0, 6).map((s) => (
                    <Text key={s.id} style={styles.previewEmoji}>{s.emoji}</Text>
                  ))}
                  <Text style={styles.previewMore}>+{STICKER_CATALOG.length - 6}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ) : (
          <>
            <View
              style={styles.vehicleArea}
              onLayout={handlePhotoAreaLayout}
            >
              <Image
                source={{ uri: garage.photoUri }}
                style={styles.vehiclePhoto}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(9,25,42,0.5)"]}
                style={styles.vehiclePhotoOverlay}
              />
              {garage.stickers.map((placed) => (
                <DraggableSticker
                  key={placed.uid}
                  placed={placed}
                  onMove={handleMoveSticker}
                  onRemove={handleRemoveSticker}
                />
              ))}
              {garage.stickers.length === 0 && (
                <View style={styles.stickerHint} pointerEvents="none">
                  <Text style={styles.stickerHintText}>TAP + TO ADD STICKERS!</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <Pressable onPress={openPicker} style={styles.addStickerBtn} testID="add-sticker-btn">
                <LinearGradient
                  colors={[Colors.accent, "#2DB87A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addStickerBtnGradient}
                >
                  <Ionicons name="add-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.addStickerBtnText}>ADD STICKER</Text>
                </LinearGradient>
              </Pressable>
              {garage.stickers.length > 0 && (
                <View style={styles.stickerCountPill}>
                  <Text style={styles.stickerCountText}>
                    {garage.stickers.length} ON RIDE
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.helpRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.helpText}>
                DRAG stickers to move · HOLD to remove
              </Text>
            </View>

            <View style={styles.stickerCatalogPreview}>
              <Text style={styles.catalogTitle}>YOUR STICKER COLLECTION</Text>
              <View style={styles.catalogGrid}>
                {STICKER_CATALOG.map((sticker) => {
                  const unlocked = isStickerUnlocked(sticker);
                  return (
                    <Pressable
                      key={sticker.id}
                      onPress={() => {
                        if (!unlocked) return;
                        placeSticker(
                          sticker.id,
                          photoAreaLayout.width / 2 - 20,
                          photoAreaLayout.height / 2 - 20
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      }}
                      style={[
                        styles.catalogCell,
                        unlocked
                          ? { borderColor: sticker.color + "66", backgroundColor: sticker.color + "15" }
                          : { borderColor: Colors.border, opacity: 0.5 },
                      ]}
                    >
                      <Text style={[styles.catalogEmoji, !unlocked && { opacity: 0.3 }]}>
                        {sticker.emoji}
                      </Text>
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
          </>
        )}
      </ScrollView>

      {pickerVisible && (
        <Pressable style={styles.pickerBackdrop} onPress={closePicker} />
      )}

      <StickerPicker
        visible={pickerVisible}
        onClose={closePicker}
        onPickSticker={handlePickSticker}
        isStickerUnlocked={isStickerUnlocked}
        slideAnim={slideAnim}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 26,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
  },
  headerSub: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
    marginTop: 2,
  },
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: Colors.primary + "55",
  },
  rescanBtnText: {
    color: Colors.primary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  nameRow: {
    marginBottom: 14,
  },
  nameDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: Colors.secondary + "55",
    alignSelf: "flex-start",
  },
  nameText: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },
  nameEditRow: {
    flexDirection: "row",
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    color: Colors.text,
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  nameSaveBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    marginTop: 12,
  },
  emptyCard: {
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 12,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 4,
  },
  emptyEmoji: {
    fontSize: 52,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  scanBtn: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
    marginTop: 4,
  },
  scanBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    borderRadius: 50,
  },
  scanBtnText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  stickerPreviewRow: {
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  stickerPreviewLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  stickerPreviewEmojis: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewMore: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  vehicleArea: {
    width: "100%",
    height: PHOTO_AREA_HEIGHT,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: Colors.primary + "66",
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    backgroundColor: Colors.backgroundCard,
  },
  vehiclePhoto: {
    width: "100%",
    height: "100%",
  },
  vehiclePhotoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  stickerOnVehicle: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  stickerOnVehicleEmoji: {
    fontSize: 42,
  },
  stickerHint: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  stickerHintText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  addStickerBtn: {
    flex: 1,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 8,
  },
  addStickerBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  addStickerBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1.5,
  },
  stickerCountPill: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: Colors.accent + "55",
  },
  stickerCountText: {
    color: Colors.accent,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  helpText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 0.5,
  },
  stickerCatalogPreview: {
    marginTop: 4,
  },
  catalogTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 2,
    marginBottom: 12,
  },
  catalogGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  catalogCell: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  catalogEmoji: {
    fontSize: 26,
  },
  catalogLock: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.backgroundDeep,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});
