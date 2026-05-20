import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCreateBooking, useCreatePayment } from "../hooks/useBookings";

const COLORS = {
  primary: "#0D9488",
  dark: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  danger: "#DC2626",
};

const PAYMENT_METHODS = [
  { label: "Static QR", value: "STATIC_QR", icon: "qr-code-outline" },
];

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

const getCityName = (service) => {
  if (!service?.city) return "Unknown location";
  if (typeof service.city === "string") return service.city;
  return service.city.name || "Unknown location";
};

const getRouteLabel = (route) => {
  const fromCity = route?.from_city?.name || "Unknown";
  const toCity = route?.to_city?.name || "Unknown";
  return `${fromCity} to ${toCity}`;
};

const getErrorMessage = (err) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return err?.message || "Cannot create booking. Please try again.";
};

export default function BookingCheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [paymentMethod, setPaymentMethod] = useState("STATIC_QR");

  const {
    service,
    serviceType: routeServiceType,
    selectedPackage,
    selectedRoom,
    selectedRoute,
    selectedSeatType,
    quantity: initialQuantity = 1,
  } = route.params ?? {};

  const serviceType = normalizeServiceType(routeServiceType || service?.type);
  const serviceLabel = SERVICE_LABELS[serviceType];
  const [quantity, setQuantity] = useState(Number(initialQuantity) || 1);

  const createBookingAction = useCreateBooking();
  const createPaymentAction = useCreatePayment();

  const isSubmitting =
    createBookingAction.isPending || createPaymentAction.isPending;

  const selectedOption = useMemo(() => {
    if (serviceType === "tour") {
      return selectedPackage
        ? {
            title: selectedPackage.name,
            subtitle: "Tour package",
            price: selectedPackage.total_price ?? selectedPackage.price,
          }
        : null;
    }

    if (serviceType === "hotel") {
      return selectedRoom
        ? {
            title: `Room ${selectedRoom.room_number || selectedRoom.id}`,
            subtitle: selectedRoom.room_type?.name || "Hotel room",
            price: selectedRoom.room_type?.price,
          }
        : null;
    }

    if (serviceType === "transport") {
      return selectedSeatType
        ? {
            title: selectedSeatType.name,
            subtitle: selectedRoute ? getRouteLabel(selectedRoute) : "Transport seat",
            price: toNumber(service?.base_price) + toNumber(selectedSeatType.price),
          }
        : null;
    }

    return null;
  }, [selectedPackage, selectedRoom, selectedRoute, selectedSeatType, service?.base_price, serviceType]);

  const maxQuantity = useMemo(() => {
    if (serviceType === "tour") {
      return service?.empty_slot ? Number(service.empty_slot) : null;
    }

    if (serviceType === "transport") {
      return selectedSeatType?.availableSeats
        ? Number(selectedSeatType.availableSeats)
        : null;
    }

    return 1;
  }, [selectedSeatType?.availableSeats, service?.empty_slot, serviceType]);

  const unitPrice = useMemo(() => {
    if (serviceType === "tour") {
      const packageTotal = toNumber(selectedPackage?.total_price);
      if (packageTotal > 0) return packageTotal;

      return toNumber(service?.base_price) + toNumber(selectedPackage?.price);
    }

    if (serviceType === "hotel") {
      return toNumber(selectedRoom?.room_type?.price);
    }

    if (serviceType === "transport") {
      return toNumber(service?.base_price) + toNumber(selectedSeatType?.price);
    }

    return toNumber(service?.base_price);
  }, [
    selectedPackage?.price,
    selectedPackage?.total_price,
    selectedRoom?.room_type?.price,
    selectedSeatType?.price,
    service?.base_price,
    serviceType,
  ]);

  const billableQuantity = serviceType === "hotel" ? 1 : quantity;
  const totalPrice = unitPrice * billableQuantity;

  const hasRequiredSelection =
    Boolean(service?.id) &&
    ((serviceType === "tour" && Boolean(selectedPackage?.id)) ||
      (serviceType === "hotel" && Boolean(selectedRoom?.id)) ||
      (serviceType === "transport" &&
        Boolean(selectedRoute?.id) &&
        Boolean(selectedSeatType?.id) &&
        Number(selectedSeatType?.availableSeats ?? 1) > 0));

  const increaseQuantity = () => {
    setQuantity((current) => {
      const next = current + 1;

      if (maxQuantity && next > maxQuantity) {
        Alert.alert("Not enough availability", `Only ${maxQuantity} item(s) are available.`);
        return current;
      }

      return next;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const buildBookingPayload = () => {
    const payload = {
      service: Number(service.id),
      quantity: billableQuantity,
    };

    if (serviceType === "tour") {
      payload.tour_package = Number(selectedPackage.id);
    }

    if (serviceType === "hotel") {
      payload.rooms = [Number(selectedRoom.id)];

      if (selectedRoom.room_type?.id) {
        payload.room_type = Number(selectedRoom.room_type.id);
      }
    }

    if (serviceType === "transport") {
      payload.route = Number(selectedRoute.id);
      payload.seat_type = Number(selectedSeatType.id);
    }

    return payload;
  };

  const handleConfirmBooking = async () => {
    if (!hasRequiredSelection) {
      Alert.alert(
        "Missing booking data",
        "Please go back and choose an available option again."
      );
      return;
    }

    let createdBooking = null;

    try {
      createdBooking = await createBookingAction.execute({
        payload: buildBookingPayload(),
      });

      const payment = await createPaymentAction.execute({
        bookingId: createdBooking.id,
        method: paymentMethod,
      });

      navigation.replace("BookingPayment", {
        bookingId: createdBooking.id,
        paymentId: payment.id,
        payment,
      });
    } catch (err) {
      const message = getErrorMessage(err);

      if (createdBooking?.id) {
        Alert.alert(
          "Booking created",
          `Your booking was created, but payment could not be started. ${message}`
        );
        return;
      }

      Alert.alert("Booking failed", message);
    }
  };

  if (!service || !hasRequiredSelection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
          </Pressable>
          <Text style={styles.headerTitle}>Booking</Text>
        </View>

        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Missing booking data</Text>
          <Text style={styles.emptyText}>
            Please go back to the service detail and choose an option again.
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.dark} />
        </Pressable>
        <Text style={styles.headerTitle}>Booking</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>{serviceLabel}</Text>
          <Text style={styles.title}>{service.name}</Text>
          <Text style={styles.mutedText}>{getCityName(service)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Selected option</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>{selectedOption.title}</Text>
              <Text style={styles.mutedText}>{selectedOption.subtitle}</Text>
            </View>
            <Text style={styles.summaryPrice}>{formatMoney(unitPrice)}</Text>
          </View>
        </View>

        {serviceType === "transport" ? (
          <View style={styles.section}>
            <Text style={styles.label}>Route</Text>
            <Text style={styles.title}>{getRouteLabel(selectedRoute)}</Text>
            <Text style={styles.mutedText}>
              Depart: {formatDateTime(selectedRoute?.departure_time)}
            </Text>
            <Text style={styles.mutedText}>
              Arrive: {formatDateTime(selectedRoute?.arrival_time)}
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>
            {serviceType === "transport"
              ? "Seats"
              : serviceType === "hotel"
                ? "Rooms"
                : "Guests"}
          </Text>

          {serviceType === "hotel" ? (
            <Text style={styles.quantityStatic}>1 room selected</Text>
          ) : (
            <>
              <View style={styles.quantityRow}>
                <Pressable
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1 || isSubmitting}
                  style={[
                    styles.stepperButton,
                    (quantity <= 1 || isSubmitting) && styles.disabledButton,
                  ]}
                >
                  <Ionicons name="remove" size={20} color={COLORS.dark} />
                </Pressable>

                <Text style={styles.quantityText}>{quantity}</Text>

                <Pressable
                  onPress={increaseQuantity}
                  disabled={isSubmitting}
                  style={[styles.stepperButton, isSubmitting && styles.disabledButton]}
                >
                  <Ionicons name="add" size={20} color={COLORS.dark} />
                </Pressable>
              </View>

              {maxQuantity ? (
                <Text style={styles.helperText}>{maxQuantity} available</Text>
              ) : null}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Payment method</Text>
          <View style={styles.paymentMethodList}>
            {PAYMENT_METHODS.map((method) => {
              const selected = paymentMethod === method.value;

              return (
                <Pressable
                  key={method.value}
                  disabled={isSubmitting}
                  onPress={() => setPaymentMethod(method.value)}
                  style={[
                    styles.paymentMethodItem,
                    selected && styles.paymentMethodItemActive,
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={20}
                    color={selected ? COLORS.primary : COLORS.muted}
                  />

                  <Text
                    style={[
                      styles.paymentMethodText,
                      selected && styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.label}
                  </Text>

                  {selected ? (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Unit price</Text>
            <Text style={styles.totalValue}>{formatMoney(unitPrice)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {serviceType === "transport"
                ? "Seats"
                : serviceType === "hotel"
                  ? "Rooms"
                  : "Guests"}
            </Text>
            <Text style={styles.totalValue}>{billableQuantity}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatMoney(totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    height: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dark,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.dark,
  },
  mutedText: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.dark,
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 4,
  },
  quantityStatic: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    minWidth: 44,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.dark,
  },
  helperText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 12,
    color: COLORS.muted,
  },
  totalBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.dark,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.55,
  },
  emptyState: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  primaryButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.white,
  },
  paymentMethodList: {
    gap: 10,
  },
  paymentMethodItem: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  paymentMethodItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#ECFDF5",
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.dark,
  },
  paymentMethodTextActive: {
    color: COLORS.primary,
  },
});
