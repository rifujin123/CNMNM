import React, { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,RefreshControl,ScrollView,StyleSheet,Text,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../../context/AuthContext";
import { fetchAdminDashboard } from "../../api/admin";
import StatCard from "../../components/AdminDashboard/StatCard";
import SectionTitle from "../../components/AdminDashboard/SectionTitle";
import StatusRow from "../../components/AdminDashboard/StatusRow";

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

const formatStatusLabel = (value) => {
  return String(value || "unknown").replace(/_/g, " ");
};

const getCountEntries = (counts = {}) => {
  return Object.entries(counts);
};

export default function AdminDashboardScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    summary: {
    paid_revenue: "0.00",
    success_payment_count: 0,
    pending_payment_count: 0,
    total_bookings: 0,
    pending_provider_count: 0,
    total_services: 0,
    active_service_count: 0,
    inactive_service_count: 0,
    },
    booking_status_counts: {},
    payment_status_counts: {},
    revenue_by_service_type: [],
    recent_pending_payments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (refresh = false) => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const data = await fetchAdminDashboard({ token });
      setStats(data);

    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Cannot load dashboard."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = stats.summary || {};
  const bookingStatusEntries = getCountEntries(stats.booking_status_counts);
  const paymentStatusEntries = getCountEntries(stats.payment_status_counts);
  const recentPendingPayments = stats.recent_pending_payments || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Admin Dashboard" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Loading dashboard...</Text>
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
            onRefresh={() => loadDashboard(true)}
          />
        }
      >
        <AppHeader title="Admin Dashboard" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.grid}>
          <StatCard
            icon="cash-outline"
            title="Paid Revenue"
            value={formatMoney(summary.paid_revenue)}
          />
          <StatCard
            icon="checkmark-circle-outline"
            title="Success Payments"
            value={summary.success_payment_count}
          />

          <StatCard
            icon="time-outline"
            title="Pending Payments"
            value={summary.pending_payment_count}
          />

          <StatCard
            icon="business-outline"
            title="Pending Providers"
            value={summary.pending_provider_count}
          />

          <StatCard
            icon="calendar-outline"
            title="Total Bookings"
            value={summary.total_bookings}
          />

          <StatCard
            icon="list-outline"
            title="Active Services"
            value={summary.active_service_count}
          />
        </View>

        <SectionTitle title="Revenue by Service Type" />
        {(stats.revenue_by_service_type || []).map((item) => (
          <StatusRow
            key={item.type}
            label={`${item.type} (${item.bookings})`}
            value={formatMoney(item.revenue)}
          />
        ))}

        <SectionTitle title="Booking Status" />
        {bookingStatusEntries.length === 0 ? (
          <Text style={styles.muted}>No booking status data.</Text>
        ) : (
          bookingStatusEntries.map(([status, count]) => (
            <StatusRow
              key={status}
              label={formatStatusLabel(status)}
              value={count}
            />
          ))
        )}

        <SectionTitle title="Payment Status" />
        {paymentStatusEntries.length === 0 ? (
          <Text style={styles.muted}>No payment status data.</Text>
        ) : (
          paymentStatusEntries.map(([status, count]) => (
            <StatusRow
              key={status}
              label={formatStatusLabel(status)}
              value={count}
            />
          ))
        )}

        <SectionTitle title="Recent Pending Payments" />
        {recentPendingPayments.length === 0 ? (
          <Text style={styles.muted}>No pending payments.</Text>
        ) : (
          recentPendingPayments.map((payment) => (
            <View key={payment.id} style={styles.listCard}>
              <Text style={styles.listTitle}>Payment #{payment.id}</Text>
              <Text style={styles.listMeta}>Booking #{payment.booking}</Text>
              <Text style={styles.listMeta}>
                {payment.payment_status} - {formatDateTime(payment.created_at)}
              </Text>
              <Text style={styles.listValue}>
                {formatMoney(payment.amount, payment.currency)}
              </Text>
            </View>
          ))
        )}


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#F8FAFC",},
  content: {paddingHorizontal: 20,paddingTop: 12,},
  center: {flex: 1,alignItems: "center",justifyContent: "center",gap: 10,},
  muted: {color: "#64748B",},
  error: {marginTop: 12,color: "#DC2626",fontWeight: "700",},
  grid: {marginTop: 16,flexDirection: "row",flexWrap: "wrap",gap: 12,},
  listCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  listMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  listValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
});
