import React, { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,Alert,Pressable,RefreshControl,ScrollView,StyleSheet,Text,TextInput,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAdminBookings,
  refundBooking,
} from "../../api/admin";
import BookingCard from "../../components/AdminBookings/BookingCard";
import BookingDetailModal from "../../components/AdminBookings/BookingDetailModal";

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
  const [appliedBookingId, setAppliedBookingId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const buildFilters = () => {
    const filters = {};
    if (appliedBookingId.trim()) {
      filters.booking_id = appliedBookingId.trim();
    }
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
  }, [token, appliedBookingId]);

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
            onPress={() => setAppliedBookingId(bookingId.trim())}
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
              formatMoney={formatMoney}
              formatDateTime={formatDateTime}
              getServiceType={getServiceType}
            />
          ))
        )}
      </ScrollView>

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onRefund={() => selectedBooking && handleRefund(selectedBooking)}
        isLoading={actionLoadingId === selectedBooking?.id}
        formatMoney={formatMoney}
        formatDateTime={formatDateTime}
        getServiceType={getServiceType}
      />
    </SafeAreaView>
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
});
