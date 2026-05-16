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

  const {
    service,
    selectedPackage,
    quantity: initialQuantity = 1,
  } = route.params ?? {};

  const [quantity, setQuantity] = useState(Number(initialQuantity) || 1);

  const createBookingMutation = useCreateBooking();
  const createPaymentMutation = useCreatePayment();

  const isSubmitting =
    createBookingMutation.isPending || createPaymentMutation.isPending;

  const maxQuantity = service?.empty_slot ? Number(service.empty_slot) : null;

  const unitPrice = useMemo(() => {
    const packageTotal = toNumber(selectedPackage?.total_price);
    if (packageTotal > 0) return packageTotal;

    return toNumber(service?.base_price) + toNumber(selectedPackage?.price);
  }, [service?.base_price, selectedPackage?.price, selectedPackage?.total_price]);

  const totalPrice = unitPrice * quantity;

  const increaseQuantity = () => {
    setQuantity((current) => {
      const next = current + 1;

      if (maxQuantity && next > maxQuantity) {
        Alert.alert("Not enough slots", `Only ${maxQuantity} slots are available.`);
        return current;
      }

      return next;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleConfirmBooking = async () => {
    if (!service?.id || !selectedPackage?.id) {
      Alert.alert("Missing booking data", "Please go back and choose a package again.");
      return;
    }

    let createdBooking = null;

    try {
      createdBooking = await createBookingMutation.mutateAsync({
        payload: {
          service: Number(service.id),
          tour_package: Number(selectedPackage.id),
          quantity,
        },
      });

      const payment = await createPaymentMutation.mutateAsync({
        bookingId: createdBooking.id,
        method: "STATIC_QR",
      });

      navigation.navigate("BookingPayment", {
        bookingId: createdBooking.id,
        paymentId: payment.id,
        payment,
      });
    } catch (err) {
      const message = getErrorMessage(err);

      if (createdBooking?.id) {
        Alert.alert(
          "Booking created",
          `Your booking was created, but payment could not be started. ${message}`,
        );
        return;
      }

      Alert.alert("Booking failed", message);
    }
  };

  if (!service || !selectedPackage) {
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
            Please go back to the tour detail and choose a package again.
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
          <Text style={styles.label}>Tour</Text>
          <Text style={styles.title}>{service.name}</Text>
          <Text style={styles.mutedText}>{service?.city?.name || "Unknown location"}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Selected package</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>{selectedPackage.name}</Text>
              <Text style={styles.mutedText}>Unit price</Text>
            </View>
            <Text style={styles.summaryPrice}>{formatMoney(unitPrice)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Guests</Text>

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
            <Text style={styles.helperText}>{maxQuantity} slots available</Text>
          ) : null}
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Unit price</Text>
            <Text style={styles.totalValue}>{formatMoney(unitPrice)}</Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Guests</Text>
            <Text style={styles.totalValue}>{quantity}</Text>
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
});