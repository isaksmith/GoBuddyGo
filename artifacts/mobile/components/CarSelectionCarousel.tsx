import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SavedCar } from "@/context/AppContext";
import DefaultCarSvg from "@/components/DefaultCarSvg";

interface CarSelectionCarouselProps {
  cars: SavedCar[];
  selectedCarId: string | null;
  onSelectCar: (carId: string) => void;
  visible: boolean;
}

const CAR_CARD_WIDTH = 100;
const CAR_CARD_HEIGHT = 100;
const GAP = 12;
const PADDING = 16;

function getCarPreviewSource(car: SavedCar): string | null {
  return car.photos?.frontThreeQuarter ?? car.photoUri ?? null;
}

function CarCard({
  car,
  isSelected,
  onPress,
}: {
  car: SavedCar;
  isSelected: boolean;
  onPress: () => void;
}) {
  const previewSource = getCarPreviewSource(car);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.carCard,
        isSelected && styles.carCardSelected,
        pressed && styles.carCardPressed,
      ]}
    >
      {/* Car thumbnail */}
      {previewSource ? (
        <Image
          source={{ uri: previewSource }}
          style={styles.carImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.defaultCarWrap}>
          <DefaultCarSvg width={88} height={56} bodyColor="#4F8EF7" accentColor="#FFD93D" />
        </View>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={28} color="#3ECF8E" />
        </View>
      )}

      {/* Car name below */}
      <Text
        style={[styles.carName, isSelected && styles.carNameSelected]}
        numberOfLines={1}
      >
        {car.name}
      </Text>
    </Pressable>
  );
}

export function CarSelectionCarousel({
  cars,
  selectedCarId,
  onSelectCar,
  visible,
}: CarSelectionCarouselProps) {
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to selected car when it changes
  useEffect(() => {
    if (!visible || !selectedCarId) return;
    const selectedIndex = cars.findIndex((c) => c.id === selectedCarId);
    if (selectedIndex >= 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, [selectedCarId, visible, cars]);

  if (!visible) {
    return null;
  }

  return (
    <LinearGradient
      colors={["rgba(0, 0, 0, 0.6)", "rgba(0, 0, 0, 0.3)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.headerText}>Select Your Car</Text>
      
      <FlatList
        ref={flatListRef}
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CarCard
            car={item}
            isSelected={item.id === selectedCarId}
            onPress={() => onSelectCar(item.id)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: PADDING,
    gap: 8,
    zIndex: 20,
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "BalsamiqSans_700Bold",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  listContent: {
    gap: GAP,
    paddingHorizontal: PADDING - 4,
  },
  carCard: {
    width: CAR_CARD_WIDTH,
    gap: 6,
    alignItems: "center",
  },
  carCardSelected: {
    opacity: 1,
  },
  carCardPressed: {
    opacity: 0.7,
  },
  carImage: {
    width: CAR_CARD_WIDTH,
    height: CAR_CARD_HEIGHT,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  defaultCarWrap: {
    width: CAR_CARD_WIDTH,
    height: CAR_CARD_HEIGHT,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    backgroundColor: "rgba(79,142,247,0.08)",
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#3ECF8E",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  carName: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 11,
    fontFamily: "BalsamiqSans_700Bold",
    textAlign: "center",
    maxWidth: CAR_CARD_WIDTH + 20,
  },
  carNameSelected: {
    color: "#3ECF8E",
    fontSize: 12,
  },
});
