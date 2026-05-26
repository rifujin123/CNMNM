import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchPlaceDetail } from "../../api/services";
import { useAuth } from "../../../context/AuthContext";
import { useWishlist } from "../../../context/WishlistContext";
import Entypo from "@expo/vector-icons/Entypo";
const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = height * 0.45;
const FALLBACK_IMAGE_URI =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const SERVICE_LABELS = {
  tour: "Tour",
  hotel: "Hotel",
  transport: "Transport",
};

const normalizeServiceType = (value) => {
  const type = String(value || "").toLowerCase();
  return SERVICE_LABELS[type] ? type : "tour";
};

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
  const number = toNumber(value);
  if (!number) return "N/A";
  return `${number.toLocaleString("vi-VN")} VND`;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getImageUri = (item) => {
  const candidates = [
    item?.image,
    item?.image_url,
    item?.thumbnail,
    item?.thumbnail_url,
  ];

  return candidates.find((uri) => typeof uri === "string" && uri.trim());
};

const getCityName = (item) => item?.city?.name || "Unknown location";

const getRouteLabel = (route) => {
  const fromCity = route?.from_city?.name || "Unknown";
  const toCity = route?.to_city?.name || "Unknown";
  return `${fromCity} to ${toCity}`;
};

const isPastDate = (value) => {
  if (!value) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
};

export default function ItemDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const itemId = route.params?.itemId ?? route.params?.ItemId;
  const serviceType = normalizeServiceType(
    route.params?.serviceType ?? route.params?.type ?? route.params?.service_type
  );
  const serviceLabel = SERVICE_LABELS[serviceType];

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState(
    route.params?.selectedPackageId ?? null
  );
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState(null);
  const [isDescriptionModalVisible, setDescriptionModalVisible] =
    useState(false);

  const packages = place?.tour_package ?? [];
  const availableRooms = useMemo(
    () => (place?.rooms ?? []).filter((room) => room?.is_available !== false),
    [place?.rooms]
  );
  const routes = place?.routes ?? [];

  const seatTypeOptions = useMemo(() => {
    const seatTypes = place?.seat_types ?? [];
    const availability = place?.availability ?? [];

    return seatTypes.map((seatType) => {
      const row = availability.find(
        (item) =>
          String(item?.route) === String(selectedRouteId) &&
          String(item?.seat_type) === String(seatType?.id)
      );

      return {
        ...seatType,
        availableSeats: row?.available_seats ?? 0,
      };
    });
  }, [place?.availability, place?.seat_types, selectedRouteId]);

  useEffect(() => {
    let active = true;

    const loadDetail = async () => {
      try {
        setIsLoading(true);

        const data = await fetchPlaceDetail(itemId, serviceType);

        if (active) setPlace(data);
      } catch (err) {
        console.error("Fetch place detail error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (itemId) loadDetail();

    return () => {
      active = false;
    };
  }, [itemId, serviceType]);

  useEffect(() => {
    if (place?.tour_package?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(place.tour_package[0].id);
    }

    if (serviceType === "hotel") {
      setSelectedRoomId((current) => {
        const hasCurrent = availableRooms.some(
          (room) => String(room.id) === String(current)
        );
        return hasCurrent ? current : availableRooms[0]?.id ?? null;
      });
      return;
    }

    if (serviceType === "transport") {
      setSelectedRouteId((current) => {
        const hasCurrent = routes.some((item) => String(item.id) === String(current));
        return hasCurrent ? current : routes[0]?.id ?? null;
      });
    }
  }, [availableRooms, packages, place, routes, serviceType]);

  useEffect(() => {
    if (serviceType !== "transport") return;

    setSelectedSeatTypeId((current) => {
      const hasCurrent = seatTypeOptions.some(
        (seatType) =>
          String(seatType.id) === String(current) && seatType.availableSeats > 0
      );

      if (hasCurrent) return current;

      return (
        seatTypeOptions.find((seatType) => seatType.availableSeats > 0)?.id ??
        seatTypeOptions[0]?.id ??
        null
      );
    });
  }, [seatTypeOptions, serviceType]);

  const selectedPackage = packages.find(
    (pkg) => String(pkg.id) === String(selectedPackageId)
  );
  const selectedRoom = availableRooms.find(
    (room) => String(room.id) === String(selectedRoomId)
  );
  const selectedRoute = routes.find(
    (item) => String(item.id) === String(selectedRouteId)
  );
  const selectedSeatType = seatTypeOptions.find(
    (seatType) => String(seatType.id) === String(selectedSeatTypeId)
  );

  const selectedPrice = useMemo(() => {
    if (serviceType === "tour") {
      return (
        selectedPackage?.total_price_display ||
        selectedPackage?.price_display ||
        place?.base_price_display ||
        formatMoney(place?.base_price)
      );
    }

    if (serviceType === "hotel") {
      return formatMoney(selectedRoom?.room_type?.price ?? place?.base_price);
    }

    if (serviceType === "transport") {
      const total = toNumber(place?.base_price) + toNumber(selectedSeatType?.price);
      return formatMoney(total);
    }

    return formatMoney(place?.base_price);
  }, [place?.base_price, place?.base_price_display, selectedPackage, selectedRoom, selectedSeatType, serviceType]);

  const isServiceInactive = place?.is_active === false;
  const isTourSoldOut =
    serviceType === "tour" && Number(place?.empty_slot ?? 0) <= 0;
  const isTourExpired =
    serviceType === "tour" && isPastDate(place?.time_start);

  const isUnavailable = isServiceInactive || isTourSoldOut || isTourExpired;

  const canBook =
    !isUnavailable &&
    ((serviceType === "tour" && Boolean(selectedPackage)) ||
      (serviceType === "hotel" && Boolean(selectedRoom)) ||
      (serviceType === "transport" &&
        Boolean(selectedRoute) &&
        Boolean(selectedSeatType) &&
        selectedSeatType.availableSeats > 0));

  const imageUri = getImageUri(place) || FALLBACK_IMAGE_URI;

  const handleBookNow = () => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }

    if (!place || !canBook) {
      Alert.alert(
        `Choose ${serviceLabel.toLowerCase()} option`,
        "Please choose an available option before booking."
      );
      return;
    }

    const params = {
      service: { ...place, type: serviceType },
      serviceType,
      quantity: 1,
    };

    if (serviceType === "tour") {
      params.selectedPackage = selectedPackage;
    }

    if (serviceType === "hotel") {
      params.selectedRoom = selectedRoom;
    }

    if (serviceType === "transport") {
      params.selectedRoute = selectedRoute;
      params.selectedSeatType = selectedSeatType;
    }

    navigation.navigate("BookingCheckout", params);
  };

  const renderTourOptions = () => (
    <>
      <Text style={styles.sectionTitle}>Choose package</Text>

      {packages.length > 0 ? (
        packages.map((pkg) => {
          const isSelected = String(pkg.id) === String(selectedPackageId);

          return (
            <Pressable
              key={pkg.id}
              onPress={() => setSelectedPackageId(pkg.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{pkg.name}</Text>
                  <Text style={styles.optionSubText}>
                    Package price: {pkg.price_display || formatMoney(pkg.price)}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? "#0D9488" : "#94A3B8"}
                />
              </View>

              <Text style={styles.optionPrice}>
                Total: {pkg.total_price_display || formatMoney(pkg.total_price)}
              </Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No packages available.</Text>
      )}
    </>
  );

  const renderHotelOptions = () => (
    <>
      <Text style={styles.sectionTitle}>Choose room</Text>

      {availableRooms.length > 0 ? (
        availableRooms.map((room) => {
          const isSelected = String(room.id) === String(selectedRoomId);
          const roomType = room?.room_type;

          return (
            <Pressable
              key={room.id}
              onPress={() => setSelectedRoomId(room.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>
                    Room {room.room_number || room.id}
                  </Text>
                  <Text style={styles.optionSubText}>
                    {roomType?.name || "Room"} - {room.total_beds || 1} bed(s)
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? "#0D9488" : "#94A3B8"}
                />
              </View>

              <Text style={styles.optionPrice}>{formatMoney(roomType?.price)}</Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No rooms available.</Text>
      )}
    </>
  );

  const renderTransportOptions = () => (
    <>
      <Text style={styles.sectionTitle}>Choose route</Text>

      {routes.length > 0 ? (
        routes.map((item) => {
          const isSelected = String(item.id) === String(selectedRouteId);

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedRouteId(item.id)}
              style={[styles.optionCard, isSelected && styles.optionCardSelected]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{getRouteLabel(item)}</Text>
                  <Text style={styles.optionSubText}>
                    Depart: {formatDateTime(item.departure_time)}
                  </Text>
                  <Text style={styles.optionSubText}>
                    Arrive: {formatDateTime(item.arrival_time)}
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? "#0D9488" : "#94A3B8"}
                />
              </View>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No routes available.</Text>
      )}

      <Text style={styles.sectionTitle}>Choose seat type</Text>

      {seatTypeOptions.length > 0 ? (
        seatTypeOptions.map((seatType) => {
          const isSelected = String(seatType.id) === String(selectedSeatTypeId);
          const isUnavailable = !selectedRoute || seatType.availableSeats <= 0;

          return (
            <Pressable
              key={seatType.id}
              disabled={isUnavailable}
              onPress={() => setSelectedSeatTypeId(seatType.id)}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                isUnavailable && styles.optionCardDisabled,
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionText}>
                  <Text style={styles.optionName}>{seatType.name}</Text>
                  <Text style={styles.optionSubText}>
                    {seatType.availableSeats} seat(s) available
                  </Text>
                </View>

                <Ionicons
                  name={isSelected ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={isSelected ? "#0D9488" : "#94A3B8"}
                />
              </View>

              <Text style={styles.optionPrice}>
                {formatMoney(toNumber(place?.base_price) + toNumber(seatType.price))}
              </Text>
            </Pressable>
          );
        })
      ) : (
        <Text style={styles.mutedText}>No seat types available.</Text>
      )}
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.mutedText}>Loading {serviceLabel.toLowerCase()}...</Text>
      </View>
    );
  }

  if (!isLoading && !place) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cannot load {serviceLabel.toLowerCase()} detail</Text>
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
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.location}>{getCityName(place)}</Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>
            {place?.star_rating || "N/A"} - {serviceLabel}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>
          {place?.description || "No description available."}
        </Text>

        {serviceType === "hotel" ? (
          <View style={styles.infoBox}>
            <InfoRow label="Address" value={place?.address_detail || getCityName(place)} />
            <InfoRow label="Rooms" value={String(place?.total_rooms || availableRooms.length || 0)} />
          </View>
        ) : null}

        {serviceType === "transport" ? (
          <View style={styles.infoBox}>
            <InfoRow label="Brand" value={place?.brand_name || "N/A"} />
            <InfoRow label="Vehicle" value={place?.vehicle_type || "N/A"} />
            <InfoRow label="Seats" value={String(place?.total_seats || 0)} />
          </View>
        ) : null}

        {serviceType === "tour" ? renderTourOptions() : null}
        {serviceType === "hotel" ? renderHotelOptions() : null}
        {serviceType === "transport" ? renderTransportOptions() : null}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceBlock}>
          <Text style={styles.priceLabel}>Selected</Text>
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

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { paddingBottom: 130 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  image: { width: "100%", height: 280, backgroundColor: "#E2E8F0" },
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
  title: {
    marginTop: 18,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  location: {
    marginTop: 6,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#64748B",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  ratingText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
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
  infoBox: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  infoValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },
  optionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  optionCardSelected: {
    borderColor: "#0D9488",
    backgroundColor: "#ECFDF5",
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  optionSubText: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  optionPrice: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
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
    backgroundColor: "#fff",
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
  priceLabel: { fontSize: 12, color: "#64748B" },
  priceValue: { marginTop: 2, fontSize: 18, fontWeight: "900", color: "#0F172A" },
  bookButton: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  bookButtonDisabled: { opacity: 0.5 },
  bookButtonText: { fontSize: 15, fontWeight: "900", color: "#fff" },
  secondaryButton: {
    marginTop: 16,
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
});
