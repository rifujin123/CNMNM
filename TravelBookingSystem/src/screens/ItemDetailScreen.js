import React, { useMemo, useState } from "react";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TripChips from "../components/TripChips";
import TripTypeChips from "../components/TripTypeChip";
import TripSumaryCard from "../components/TripSumaryCard";
import {
  useBookings,
  useCancelBooking,
  useCreatePayment,
} from "../hooks/useBookings";
import { usePayments } from "../hooks/usePayments";

const tabs = ["upcoming", "completed", "cancelled"];

const typeTabs = [
  { label: "All", value: "all", icon: "apps-outline" },
  { label: "Tour", value: "tour", icon: "location-outline" },
  { label: "Hotel", value: "hotel", icon: "business-outline" },
  { label: "Transport", value: "transport", icon: "bus-outline" },
];

const STATUS_GROUPS = {
  upcoming: ["pending", "confirmed"],
  completed: ["completed"],
  cancelled: ["cancelled", "expired", "payment_failed", "refunded"],
};

const formatDate = (value) => {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatMoney = (value) => {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return String(value || "0");
  }

  return `${number.toLocaleString("vi-VN")} VND`;
};

const getTripGroupStatus = (bookingStatus) => {
  if (["pending", "confirmed"].includes(bookingStatus)) return "upcoming";
  if (bookingStatus === "completed") return "completed";
  return "cancelled";
};

const mapBookingToTrip = (booking) => {
  const service = booking?.service ?? {};

  return {
    id: String(booking.id),
    title: service.name || "Untitled booking",
    date: formatDate(service.start_date || booking.created_date),
    price: Number(booking.total_price || 0).toLocaleString("vi-VN"),
    status: getTripGroupStatus(booking.booking_status),
    bookingStatus: booking.booking_status,
    paymentStatus: booking.payment_status,
    serviceType: service.service_type,
  };
};

const getLatestPaymentForBooking = (payments, bookingId) => {
  return payments.find(
    (payment) => String(payment.booking) === String(bookingId),
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || "N/A"}</Text>
  </View>
);

const TripDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const bookingId = route.params?.bookingId;

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTypeIndex, setActiveTypeIndex] = useState(0);

  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useBookings();

  const {
    data: payments = [],
    refetch: refetchPayments,
  } = usePayments();

  const cancelBookingMutation = useCancelBooking();
  const createPaymentMutation = useCreatePayment();

  const selectedTab = tabs[activeIndex];
  const selectedType = typeTabs[activeTypeIndex]?.value || "all";

  const selectedBooking = useMemo(() => {
    if (!bookingId) return null;

    return bookings.find(
      (booking) => String(booking.id) === String(bookingId),
    );
  }, [bookings, bookingId]);

  const filteredBookings = useMemo(() => {
    const allowedStatuses = STATUS_GROUPS[selectedTab] ?? [];

    return bookings.filter((booking) => {
      const statusMatches = allowedStatuses.includes(booking.booking_status);
      const serviceType = booking?.service?.service_type;
      const typeMatches = selectedType === "all" || serviceType === selectedType;

      return statusMatches && typeMatches;
    });
  }, [bookings, selectedTab, selectedType]);

  const openBookingDetail = (id) => {
    navigation.navigate("TripDetail", { bookingId: id });
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      "Cancel booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBookingMutation.mutateAsync({
                bookingId: booking.id,
              });
              await refetch();
              Alert.alert("Booking cancelled", "Your booking has been cancelled.");
            } catch (err) {
              const message =
                err?.response?.data?.detail ||
                err?.message ||
                "Cannot cancel this booking.";
              Alert.alert("Cancel failed", message);
            }
          },
        },
      ],
    );
  };

  const handlePayNow = async (booking) => {
    try {
      let payment = getLatestPaymentForBooking(payments, booking.id);

      if (!payment) {
        payment = await createPaymentMutation.mutateAsync({
          bookingId: booking.id,
          method: "STATIC_QR",
        });
        await refetchPayments();
      }

      navigation.navigate("BookingPayment", {
        bookingId: booking.id,
        paymentId: payment.id,
        payment,
      });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Cannot open payment for this booking.";
      Alert.alert("Payment unavailable", message);
    }
  };

  const renderListItem = ({ item }) => {
    const trip = mapBookingToTrip(item);

    return (
      <TripSumaryCard
        trip={trip}
        onPress={() => openBookingDetail(item.id)}
      />
    );
  };

  const renderDetail = () => {
    if (!selectedBooking) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Booking not found</Text>
          <Text style={styles.stateText}>
            This booking may have been refreshed or removed.
          </Text>

          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("TripDetail")}>
            <Text style={styles.primaryButtonText}>View All Bookings</Text>
          </Pressable>
        </View>
      );
    }

    const service = selectedBooking.service ?? {};
    const tourPackage = selectedBooking.tour_package;
    const canCancel = selectedBooking.booking_status === "pending";
    const canPay = selectedBooking.payment_status === "unpaid";

    return (
      <FlatList
        data={[selectedBooking]}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.detailContent}
        renderItem={() => (
          <>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>{service.name || "Untitled booking"}</Text>
              <Text style={styles.detailSubTitle}>{service.city || "Unknown location"}</Text>

              <View style={styles.divider} />

              <DetailRow label="Service type" value={service.service_type} />
              <DetailRow label="Package" value={tourPackage?.name} />
              <DetailRow label="Quantity" value={String(selectedBooking.quantity)} />
              <DetailRow label="Total price" value={formatMoney(selectedBooking.total_price)} />
              <DetailRow label="Booking status" value={selectedBooking.booking_status} />
              <DetailRow label="Payment status" value={selectedBooking.payment_status} />
              <DetailRow label="Created date" value={formatDate(selectedBooking.created_date)} />
            </View>

            {canPay ? (
              <Pressable
                style={[
                  styles.primaryButton,
                  createPaymentMutation.isPending && styles.disabledButton,
                ]}
                disabled={createPaymentMutation.isPending}
                onPress={() => handlePayNow(selectedBooking)}
              >
                <Text style={styles.primaryButtonText}>
                  {createPaymentMutation.isPending ? "Opening Payment..." : "Pay Now"}
                </Text>
              </Pressable>
            ) : null}

            {canCancel ? (
              <Pressable
                style={[
                  styles.dangerButton,
                  cancelBookingMutation.isPending && styles.disabledButton,
                ]}
                disabled={cancelBookingMutation.isPending}
                onPress={() => handleCancelBooking(selectedBooking)}
              >
                <Text style={styles.dangerButtonText}>
                  {cancelBookingMutation.isPending ? "Cancelling..." : "Cancel Booking"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      />
    );
  };

  const renderList = () => (
    <>
      <TripChips
        items={tabs}
        activeIndex={activeIndex}
        onChange={(index) => setActiveIndex(index)}
      />

      <TripTypeChips
        items={typeTabs}
        activeIndex={activeTypeIndex}
        onChange={(index) => setActiveTypeIndex(index)}
      />

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderListItem}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>No bookings here</Text>
            <Text style={styles.stateText}>
              Try another status or service type.
            </Text>
          </View>
        }
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>
          {bookingId ? "Booking Detail" : "My Bookings"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading bookings...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Cannot load bookings</Text>
          <Text style={styles.stateText}>Please try again.</Text>

          <Pressable style={styles.primaryButton} onPress={refetch}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : bookingId ? (
        renderDetail()
      ) : (
        renderList()
      )}
    </SafeAreaView>
  );
};

export default TripDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: scale(70),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: scale(20),
  },
  backButton: {
    position: "absolute",
    left: scale(20),
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
  listContent: {
    padding: scale(16),
    paddingBottom: scale(40),
  },
  detailContent: {
    padding: scale(16),
    paddingBottom: scale(40),
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: scale(16),
    padding: scale(16),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: scale(16),
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  detailSubTitle: {
    marginTop: scale(4),
    fontSize: 14,
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: scale(14),
  },
  detailRow: {
    paddingVertical: scale(8),
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: scale(4),
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryButton: {
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(10),
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dangerButton: {
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#991B1B",
  },
  disabledButton: {
    opacity: 0.6,
  },
  centerState: {
    padding: scale(24),
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
});