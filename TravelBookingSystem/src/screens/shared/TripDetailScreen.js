import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { scale } from "react-native-size-matters";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TripChips from "../../components/TripChips";
import TripTypeChips from "../../components/TripTypeChip";
import TripSumaryCard from "../../components/TripSumaryCard";
import {
  useBookings,
  useCancelBooking,
  useCreatePayment,
} from "../../hooks/useBookings";
import { usePayments } from "../../hooks/usePayments";

const tabs = ["upcoming", "completed", "cancelled"];

const statusGroups = {
  upcoming: ["pending"],
  completed: ["completed", "confirmed"],
  cancelled: ["cancelled", "expired", "payment_failed", "refunded"],
};

const typeTabs = [
  { label: "All", value: "all", icon: "checkmark" },
  { label: "Tour", value: "tour", icon: "map-outline" },
  { label: "Hotel", value: "hotel", icon: "business-outline" },
  { label: "Transport", value: "transport", icon: "car-outline" },
];

const normalize = (value) => String(value || "").toLowerCase();

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

const formatMoney = (value) => {
  const number = Number(value || 0);
  if (Number.isNaN(number)) return String(value || "0");
  return `${number.toLocaleString("vi-VN")} VND`;
};

const getCityName = (service) => {
  if (!service?.city) return "Unknown location";
  if (typeof service.city === "string") return service.city;
  return service.city.name || "Unknown location";
};

const getServiceType = (booking) =>
  normalize(booking?.service?.service_type || booking?.service_type || "tour");

const getBookingOptionLabel = (booking) => {
  const serviceType = getServiceType(booking);

  if (serviceType === "tour") {
    return booking?.tour_package?.name || "N/A";
  }

  if (serviceType === "hotel") {
    const roomNumbers = (booking?.rooms || [])
      .map((room) => room.room_number)
      .filter(Boolean)
      .join(", ");
    const roomType = booking?.room_type?.name;

    if (roomNumbers && roomType) return `${roomType} - room ${roomNumbers}`;
    return roomType || roomNumbers || "N/A";
  }

  if (serviceType === "transport") {
    const routeLabel = booking?.route
      ? `${booking.route.from_city || "Unknown"} to ${booking.route.to_city || "Unknown"}`
      : null;
    const seatType = booking?.seat_type?.name;

    if (routeLabel && seatType) return `${routeLabel} - ${seatType}`;
    return seatType || routeLabel || "N/A";
  }

  return "N/A";
};

const mapBookingToTrip = (booking) => ({
  id: String(booking.id),
  title: booking?.service?.name || "Untitled booking",
  date: formatDate(booking?.service?.start_date || booking.created_date),
  price: Number(booking.total_price || 0).toLocaleString("vi-VN"),
  bookingStatus: booking.booking_status,
  paymentStatus: booking.payment_status,
  serviceType: getServiceType(booking),
});

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstValue = data[firstKey];

    if (Array.isArray(firstValue)) return firstValue[0];
    if (typeof firstValue === "string") return firstValue;
  }

  return err?.message || fallback;
};

const findPaymentForBooking = (payments, bookingId) => {
  const bookingPayments = payments.filter(
    (payment) => String(payment.booking) === String(bookingId),
  );

  return (
    bookingPayments.find((payment) =>
      ["PENDING", "PROCESSING", "REVIEW"].includes(String(payment.payment_status).toUpperCase()),
    ) || bookingPayments[0]
  );
};

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

  const { data: payments = [], refetch: refetchPayments } = usePayments();
  const cancelBookingAction = useCancelBooking();
  const createPaymentAction = useCreatePayment();

  const selectedBooking = useMemo(
    () => bookings.find((booking) => String(booking.id) === String(bookingId)),
    [bookings, bookingId],
  );

  const filteredBookings = useMemo(() => {
    const activeTab = tabs[activeIndex] || "upcoming";
    const activeType = typeTabs[activeTypeIndex]?.value || "all";
    const allowedStatuses = statusGroups[activeTab] || [];

    return bookings.filter((booking) => {
      const statusMatches = allowedStatuses.includes(normalize(booking.booking_status));
      const typeMatches =
        activeType === "all" || getServiceType(booking) === normalize(activeType);

      return statusMatches && typeMatches;
    });
  }, [activeIndex, activeTypeIndex, bookings]);

  const tripSummaries = useMemo(
    () => filteredBookings.map(mapBookingToTrip),
    [filteredBookings],
  );

  const currentPayment = useMemo(
    () => findPaymentForBooking(payments, bookingId),
    [bookingId, payments],
  );

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchPayments()]);
  };

  const handleCancelBooking = (booking) => {
    Alert.alert(
      "Cancel booking",
      "This will release the held slots for this booking.",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelBookingAction.execute({ bookingId: booking.id });
              await refreshAll();
              Alert.alert("Booking cancelled", "Your booking has been cancelled.");
            } catch (err) {
              Alert.alert(
                "Cannot cancel booking",
                getErrorMessage(err, "Please try again."),
              );
            }
          },
        },
      ],
    );
  };

  const handlePayNow = async (booking) => {
    try {
      const existingPayment = findPaymentForBooking(payments, booking.id);

      if (existingPayment) {
        navigation.navigate("BookingPayment", {
          bookingId: booking.id,
          paymentId: existingPayment.id,
          payment: existingPayment,
        });
        return;
      }

      const payment = await createPaymentAction.execute({
        bookingId: booking.id,
        method: "STATIC_QR",
      });

      navigation.navigate("BookingPayment", {
        bookingId: booking.id,
        paymentId: payment.id,
        payment,
      });
    } catch (err) {
      Alert.alert(
        "Cannot open payment",
        getErrorMessage(err, "Please try again."),
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#0F172A" />
      </TouchableOpacity>
      <Text style={styles.title}>{bookingId ? "Booking Detail" : "My Bookings"}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0D9488" />
          <Text style={styles.stateText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Cannot load bookings</Text>
          <Text style={styles.stateText}>Please check your connection and try again.</Text>
          <Pressable style={styles.primaryButton} onPress={refreshAll}>
            <Text style={styles.primaryButtonText}>
              {isRefetching ? "Retrying..." : "Try Again"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (bookingId) {
    if (!selectedBooking) {
      return (
        <SafeAreaView style={styles.container}>
          {renderHeader()}
          <View style={styles.centerState}>
            <Text style={styles.stateTitle}>Booking not found</Text>
            <Text style={styles.stateText}>
              This booking may have been removed or is not available for your account.
            </Text>
            <Pressable style={styles.primaryButton} onPress={refreshAll}>
              <Text style={styles.primaryButtonText}>Refresh</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    const isPendingBooking = normalize(selectedBooking.booking_status) === "pending";
    const isRefundedBooking = normalize(selectedBooking.booking_status) === "refunded" || normalize(selectedBooking.payment_status) === "refunded";

    const canCancel = isPendingBooking;
    const canOpenPayment = Boolean(currentPayment) && !isRefundedBooking;
    const canCreatePayment =
      isPendingBooking && normalize(selectedBooking.payment_status) === "unpaid";

    const payButtonText = currentPayment ? "View Payment" : "Pay Now";

    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>
            {selectedBooking.service?.name || "Untitled booking"}
          </Text>
          <Text style={styles.detailMeta}>{getCityName(selectedBooking.service)}</Text>

          <InfoRow label="Service Type" value={getServiceType(selectedBooking)} />
          <InfoRow
            label="Option"
            value={getBookingOptionLabel(selectedBooking)}
          />
          <InfoRow label="Quantity" value={String(selectedBooking.quantity || 1)} />
          <InfoRow label="Total" value={formatMoney(selectedBooking.total_price)} />
          <InfoRow
            label="Booking Status"
            value={selectedBooking.booking_status || "unknown"}
          />
          <InfoRow
            label="Payment Status"
            value={selectedBooking.payment_status || "unknown"}
          />
          <InfoRow
            label="Created At"
            value={formatDateTime(selectedBooking.created_date)}
          />

          {canOpenPayment || canCreatePayment ? (
            <Pressable
              style={[
                styles.primaryButton,
                createPaymentAction.isPending && styles.disabledButton,
              ]}
              disabled={createPaymentAction.isPending}
              onPress={() => handlePayNow(selectedBooking)}
            >
              <Text style={styles.primaryButtonText}>
                {createPaymentAction.isPending ? "Opening..." : payButtonText}
              </Text>
            </Pressable>
          ) : null}

          {canCancel ? (
            <Pressable
              style={[
                styles.dangerButton,
                cancelBookingAction.isPending && styles.disabledButton,
              ]}
              disabled={cancelBookingAction.isPending}
              onPress={() => handleCancelBooking(selectedBooking)}
            >
              <Text style={styles.dangerButtonText}>
                {cancelBookingAction.isPending ? "Cancelling..." : "Cancel Booking"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

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
        data={tripSummaries}
        keyExtractor={(item) => item.id}
        refreshing={isRefetching}
        onRefresh={refreshAll}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TripSumaryCard
            trip={item}
            onPress={() => navigation.navigate("TripDetail", { bookingId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.stateTitle}>No bookings here</Text>
            <Text style={styles.stateText}>
              Bookings matching this status and type will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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

export default TripDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: scale(70),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: scale(20),
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    position: "absolute",
    left: scale(20),
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
    paddingHorizontal: scale(24),
  },
  stateTitle: {
    fontSize: 18,
    lineHeight: 22,
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
  listContent: {
    padding: scale(16),
    paddingBottom: scale(32),
  },
  emptyList: {
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    paddingTop: scale(80),
  },
  detailCard: {
    margin: scale(16),
    padding: scale(16),
    borderRadius: scale(14),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: scale(10),
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  detailMeta: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: scale(4),
  },
  infoRow: {
    paddingVertical: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: scale(4),
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  primaryButton: {
    marginTop: scale(8),
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(18),
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  dangerButton: {
    height: scale(48),
    borderRadius: scale(14),
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(18),
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#B91C1C",
  },
  disabledButton: {
    opacity: 0.55,
  },
});
