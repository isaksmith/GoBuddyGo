import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { StickerDefinition, STICKER_CATALOG } from "@/context/AppContext";

interface StickerPickerProps {
  visible: boolean;
  onClose: () => void;
  onPickSticker: (sticker: StickerDefinition) => void;
  isStickerUnlocked: (sticker: StickerDefinition) => boolean;
  slideAnim: Animated.Value;
}

export function StickerPicker({
  visible,
  onClose,
  onPickSticker,
  isStickerUnlocked,
  slideAnim,
}: StickerPickerProps) {
  if (!visible) return null;

  const handlePick = (sticker: StickerDefinition) => {
    const unlocked = isStickerUnlocked(sticker);
    if (!unlocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPickSticker(sticker);
  };

  return (
    <Animated.View
      style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.handle} />
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>🎨 PICK A STICKER</Text>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {STICKER_CATALOG.map((sticker) => {
          const unlocked = isStickerUnlocked(sticker);
          return (
            <Pressable
              key={sticker.id}
              onPress={() => handlePick(sticker)}
              style={[
                styles.stickerCell,
                { borderColor: unlocked ? sticker.color + "66" : Colors.border },
                unlocked && { backgroundColor: sticker.color + "18" },
              ]}
              testID={`sticker-${sticker.id}`}
            >
              {unlocked ? (
                <>
                  {sticker.image ? (
                    <Image source={sticker.image} style={styles.stickerImage} />
                  ) : (
                    <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                  )}
                  <Text style={[styles.stickerLabel, { color: sticker.color }]}>
                    {sticker.label.toUpperCase()}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.lockedOverlay}>
                    {sticker.image ? (
                      <Image source={sticker.image} style={[styles.stickerImage, { opacity: 0.3 }]} />
                    ) : (
                      <Text style={styles.stickerEmojiLocked}>{sticker.emoji}</Text>
                    )}
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.unlockHint}>
                    {sticker.unlockCondition?.type === "sessions"
                      ? `${sticker.unlockCondition.count} RIDES`
                      : sticker.unlockCondition?.type === "badges"
                      ? `${sticker.unlockCondition.count} BADGES`
                      : "LOCKED"}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 2,
    borderColor: Colors.border,
    paddingBottom: Platform.OS === "web" ? 24 : 20,
    maxHeight: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 24,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  panelTitle: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.backgroundDeep,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 10,
    justifyContent: "flex-start",
  },
  stickerCell: {
    width: 72,
    height: 80,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: Colors.backgroundDeep,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  stickerImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  stickerEmoji: {
    fontSize: 30,
    lineHeight: 36,
  },
  stickerLabel: {
    fontSize: 8,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  lockedOverlay: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  stickerEmojiLocked: {
    fontSize: 26,
    lineHeight: 32,
    opacity: 0.3,
  },
  lockBadge: {
    position: "absolute",
    top: -4,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  unlockHint: {
    color: Colors.textMuted,
    fontSize: 7,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
