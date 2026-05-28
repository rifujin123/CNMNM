import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAdminPayments,
  confirmStaticQrPayment,
} from "../../api/admin";
import PaymentCard from "../../components/AdminPayments/PaymentCard";

const formatMoney = (value, currency = "VND") => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} ${currency}`;
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

export default function AdminPaymentsScreen() {
  const { token } = useAuth();

  const [payments, setPayments] = useState([]);
  const [bookingFilter, setBookingFilter] = useState("");
  const [appliedBookingFilter, setAppliedBookingFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const buildFilters = () => {
    const filters = {};

    if (appliedBookingFilter.trim()) filters.booking = appliedBookingFilter.trim();

    return filters;
  };

  const loadPayments = useCallback(async (refresh = false) => {
    if (!token) return;

    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const data = await fetchAdminPayments({
        token,
        filters: buildFilters(),
      });

      setPayments(data.items);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Cannot load payments."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, appliedBookingFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleConfirmSuccess = (payment) => {
    Alert.alert(
      "Confirm payment",
      `Confirm ${formatMoney(payment.amount, payment.currency)} as paid?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setActionLoadingId(payment.id);

              await confirmStaticQrPayment({
                token,
                paymentId: payment.id,
                result: "success",
              });

              await loadPayments(true);
            } catch (err) {
              Alert.alert(
                "Confirm failed",
                err?.response?.data?.detail || err?.message || "Please try again."
              );
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  const handleMarkFailed = (payment) => {
    Alert.alert(
      "Mark payment failed",
      "This will mark the payment as failed and update the booking status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Failed",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(payment.id);

              await confirmStaticQrPayment({
                token,
                paymentId: payment.id,
                result: "failed",
              });

              await loadPayments(true);
            } catch (err) {
              Alert.alert(
                "Update failed",
                err?.response?.data?.detail || err?.message || "Please try again."
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
        <AppHeader title="Payment Review" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Loading payments...</Text>
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
            onRefresh={() => loadPayments(true)}
          />
        }
      >
        <AppHeader title="Payment Review" />

        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Booking ID"
            value={bookingFilter}
            onChangeText={setBookingFilter}
            keyboardType="numeric"
          />

          <Pressable style={styles.filterButton} onPress={() => setAppliedBookingFilter(bookingFilter.trim())}>
            <Ionicons name="filter-outline" size={18} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Apply Filters</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {payments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={42} color="#16A34A" />
            <Text style={styles.emptyTitle}>No payments found</Text>
            <Text style={styles.muted}>There are no payments matching this filter.</Text>
          </View>
        ) : (
          payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              isLoading={actionLoadingId === payment.id}
              onConfirm={() => handleConfirmSuccess(payment)}
              onFailed={() => handleMarkFailed(payment)}
              formatMoney={formatMoney}
              formatDateTime={formatDateTime}
            />
          ))
        )}
      </ScrollView>
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
    color: "#0F172A",
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
