import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppHeader from "../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminBookings,
  refundBooking,
} from "../api/admin";

const formatMoney = (value) => {
  const number = Number(value || 0);
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

const getServiceType = (booking) => {
  return booking?.service?.service_type || "service";
};

export default function AdminBookingsScreen() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookingId, setBookingId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const buildFilters = () => {
    const filters = {};

    if (bookingId.trim()) filters.booking_id = bookingId.trim();

    return filters;
  };

  const loadBookings = useCallback(async (refresh = false) => {
    if (!token) return;

    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const data = await fetchAdminBookings({
        token,
        filters: buildFilters(),
      });

      setBookings(data.items);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Cannot load bookings."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, bookingId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleRefund = (booking) => {
    Alert.alert(
      "Refund booking",
      `Mark booking #${booking.id} as refunded?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refund",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(booking.id);

              await refundBooking({
                token,
                bookingId: booking.id,
              });

              setSelectedBooking(null);
              await loadBookings(true);
            } catch (err) {
              Alert.alert(
                "Refund failed",
                err?.response?.data?.detail ||
                  err?.message ||
                  "Please try again."
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Booking Management" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadBookings(true)}
          />
        }
      >
        <AppHeader title="Booking Management" />

        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Booking ID"
            value={bookingId}
            onChangeText={setBookingId}
            keyboardType="numeric"
          />

          <Pressable
            style={styles.filterButton}
            onPress={() => loadBookings(true)}
          >
            <Ionicons name="filter-outline" size={18} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Apply Filters</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {bookings.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={42} color="#64748B" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.muted}>Try changing filters.</Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isLoading={actionLoadingId === booking.id}
              onPress={() => setSelectedBooking(booking)}
              onRefund={() => handleRefund(booking)}
            />
          ))
        )}
      </ScrollView>

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onRefund={() => selectedBooking && handleRefund(selectedBooking)}
        isLoading={actionLoadingId === selectedBooking?.id}
      />
    </SafeAreaView>
  );
}

function BookingCard({ booking, isLoading, onPress, onRefund }) {
  const canRefund =
    booking.payment_status === "paid" &&
    !["refunded", "completed", "cancelled", "expired"].includes(
      booking.booking_status
    );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>
            #{booking.id} {booking.service?.name || "Untitled service"}
          </Text>
          <Text style={styles.meta}>
            {getServiceType(booking)} - {booking.user?.email || "No email"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{booking.booking_status}</Text>
        </View>
      </View>

      <InfoRow label="Total" value={formatMoney(booking.total_price)} />
      <InfoRow label="Payment" value={booking.payment_status} />
      <InfoRow label="Created" value={formatDateTime(booking.created_date)} />

      {canRefund ? (
        <Pressable
          disabled={isLoading}
          style={[styles.refundButton, isLoading && styles.disabled]}
          onPress={onRefund}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Processing..." : "Refund"}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

function BookingDetailModal({ booking, onClose, onRefund, isLoading }) {
  if (!booking) return null;

  const canRefund =
    booking.payment_status === "paid" &&
    !["refunded", "completed", "cancelled", "expired"].includes(
      booking.booking_status
    );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Booking #{booking.id}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </Pressable>
          </View>

          <ScrollView>
            <InfoRow label="Customer" value={booking.user?.email || "N/A"} />
            <InfoRow label="Username" value={booking.user?.username || "N/A"} />
            <InfoRow label="Service" value={booking.service?.name || "N/A"} />
            <InfoRow label="Service Type" value={getServiceType(booking)} />
            <InfoRow label="Provider ID" value={String(booking.service?.provider || "N/A")} />
            <InfoRow label="Quantity" value={String(booking.quantity || 1)} />
            <InfoRow label="Total" value={formatMoney(booking.total_price)} />
            <InfoRow label="Booking Status" value={booking.booking_status} />
            <InfoRow label="Payment Status" value={booking.payment_status} />
            <InfoRow label="Created" value={formatDateTime(booking.created_date)} />
            <InfoRow label="Expires" value={formatDateTime(booking.expires_at)} />

            {booking.latest_payment ? (
              <>
                <Text style={styles.sectionTitle}>Latest Payment</Text>
                <InfoRow
                  label="Payment ID"
                  value={String(booking.latest_payment.id)}
                />
                <InfoRow
                  label="Method"
                  value={booking.latest_payment.payment_method}
                />
                <InfoRow
                  label="Status"
                  value={booking.latest_payment.payment_status}
                />
                <InfoRow
                  label="Transaction"
                  value={booking.latest_payment.transaction_id}
                />
              </>
            ) : (
              <Text style={styles.muted}>No payment found.</Text>
            )}

            {canRefund ? (
              <Pressable
                disabled={isLoading}
                style={[styles.refundButton, isLoading && styles.disabled]}
                onPress={onRefund}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Processing..." : "Refund Booking"}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "N/A"}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  muted: {
    fontSize: 13,
    color: "#64748B",
  },
  filters: {
    marginTop: 14,
    gap: 10,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },
  filterButton: {
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  error: {
    marginTop: 12,
    color: "#DC2626",
    fontWeight: "700",
  },
  empty: {
    marginTop: 80,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  card: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1D4ED8",
  },
  infoRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  infoValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  refundButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "flex-end",
  },
  modalBox: {
    maxHeight: "86%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
});
