import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchPlaceDetail } from "../api/services";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "");
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";

  const number = toNumber(value);
  if (Number.isNaN(number)) return "N/A";

  return `${number.toLocaleString("vi-VN")} VND`;
};

const getCityName = (hotel) => {
  if (!hotel?.city) return "Unknown location";
  if (typeof hotel.city === "string") return hotel.city;
  return hotel.city.name || "Unknown location";
};

const getImageUri = (hotel) => {
  const firstImage = Array.isArray(hotel?.images) ? hotel.images[0] : null;
  const candidates = [
    hotel?.image,
    hotel?.image_url,
    hotel?.thumbnail,
    hotel?.thumbnail_url,
    firstImage?.image_url,
    firstImage?.image,
  ];

  return candidates.find((uri) => typeof uri === "string" && uri.trim());
};

export default function HotelDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const itemId = route.params?.itemId ?? route.params?.ItemId;

  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  const availableRooms = useMemo(
    () => (hotel?.rooms ?? []).filter((room) => room?.is_available !== false),
    [hotel?.rooms]
  );

  useEffect(() => {
    let active = true;

    const loadHotelDetail = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPlaceDetail(itemId, "hotel");
        if (active) setHotel(data);
      } catch (err) {
        console.error("Fetch hotel detail error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (itemId) {
      loadHotelDetail();
    } else {
      setIsLoading(false);
    }

    return () => {
      active = false;
    };
  }, [itemId]);

  useEffect(() => {
    setSelectedRoomId((current) => {
      const hasCurrent = availableRooms.some(
        (room) => String(room.id) === String(current)
      );

      return hasCurrent ? current : availableRooms[0]?.id ?? null;
    });
  }, [availableRooms]);

  const selectedRoom = availableRooms.find(
    (room) => String(room.id) === String(selectedRoomId)
  );
  const selectedRoomType = selectedRoom?.room_type;
  const selectedPrice = formatMoney(selectedRoomType?.price ?? hotel?.base_price);
  const canBook = Boolean(hotel?.id && selectedRoom?.id);
  const imageUri = getImageUri(hotel) || FALLBACK_IMAGE_URI;

  const isSaved = isWishlisted(hotel?.id);

  const handleWishlistPress = () => {
    if (!hotel?.id) return;

    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }

    toggleWishlist({
      ...hotel,
      type: "hotel",
    });
  };

  const handleBookNow = () => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }

    if (!canBook) {
      Alert.alert(
        "Choose a room",
        "Please choose an available room before booking."
      );
      return;
    }

    navigation.navigate("BookingCheckout", {
      service: { ...hotel, type: "hotel" },
      serviceType: "hotel",
      selectedRoom,
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.mutedText}>Loading hotel...</Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Cannot load hotel detail</Text>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable style={styles.wishlistButton} onPress={handleWishlistPress}>
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? "#EF4444" : "#FFFFFF"}
            />
        </Pressable>
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>{hotel.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.metaText}>{getCityName(hotel)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.metaText}>{hotel?.star_rating || "N/A"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <InfoRow
            icon="map-outline"
            label="Address"
            value={hotel?.address_detail || getCityName(hotel)}
          />
          <InfoRow
            icon="bed-outline"
            label="Rooms"
            value={`${hotel?.total_rooms || availableRooms.length || 0}`}
          />
          <InfoRow
            icon="pricetag-outline"
            label="From"
            value={formatMoney(hotel?.base_price)}
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {hotel?.description || "No description available."}
        </Text>

        <Text style={styles.sectionTitle}>Available rooms</Text>

        {availableRooms.length > 0 ? (
          availableRooms.map((room) => {
            const isSelected = String(room.id) === String(selectedRoomId);
            const roomType = room?.room_type;

            return (
              <Pressable
                key={room.id}
                onPress={() => setSelectedRoomId(room.id)}
                style={[styles.roomCard, isSelected && styles.roomCardSelected]}
              >
                <View style={styles.roomHeader}>
                  <View style={styles.roomTitleBlock}>
                    <Text style={styles.roomName}>
                      Room {room.room_number || room.id}
                    </Text>
                    <Text style={styles.roomType}>
                      {roomType?.name || "Room"} - {room.total_beds || 1} bed(s)
                    </Text>
                  </View>

                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={isSelected ? "#0D9488" : "#94A3B8"}
                  />
                </View>

                <View style={styles.roomFooter}>
                  <Text style={styles.roomAvailability}>
                    {roomType?.available_rooms ?? 1} room(s) available
                  </Text>
                  <Text style={styles.roomPrice}>{formatMoney(roomType?.price)}</Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.mutedText}>No rooms available.</Text>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Selected room</Text>
          <Text style={styles.priceValue} numberOfLines={1}>
            {selectedPrice}
          </Text>
        </View>

        <Pressable
          disabled={!canBook}
          onPress={handleBookNow}
          style={[styles.bookButton, !canBook && styles.bookButtonDisabled]}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelBlock}>
        <Ionicons name={icon} size={18} color="#0D9488" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 132,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  image: {
    width: "100%",
    height: 280,
    backgroundColor: "#E2E8F0",
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabelBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 24,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  description: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },
  roomCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  roomCardSelected: {
    borderColor: "#0D9488",
    backgroundColor: "#ECFDF5",
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  roomTitleBlock: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  roomType: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  roomFooter: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  roomAvailability: {
    flex: 1,
    fontSize: 12,
    color: "#64748B",
  },
  roomPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0D9488",
  },
  mutedText: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#64748B",
  },
  bottomSpace: {
    height: 24,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceBlock: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  priceValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  bookButton: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonDisabled: {
    opacity: 0.5,
  },
  bookButtonText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  secondaryButton: {
    marginTop: 16,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  wishlistButton: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
},
});
