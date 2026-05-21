import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppHeader from "../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminBookings,
  fetchAdminPayments,
  fetchPendingProviders,
} from "../api/admin";

const BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} VND`;
};

export default function AdminDashboardScreen() {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingPayments: 0,
    pendingProviders: 0,
    paidRevenue: 0,
    bookingStatusCounts: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchAllSuccessPayments = async () => {
    const limit = 50;
    let offset = 0;
    let allItems = [];
    let totalCount = null;

    while (totalCount === null || offset < totalCount) {
      const page = await fetchAdminPayments({
        token,
        filters: {
          payment_status: "SUCCESS",
          limit,
          offset,
        },
      });

      allItems = [...allItems, ...page.items];
      totalCount = page.count;
      offset += limit;

      if (!page.items.length) break;
    }

    return allItems;
  };

  const loadDashboard = useCallback(async (refresh = false) => {
    if (!token) return;

    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const [
        allBookings,
        pendingProviders,
        processingPayments,
        reviewPayments,
        pendingPayments,
        successPayments,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      ] = await Promise.all([
        fetchAdminBookings({ token, filters: { limit: 1, offset: 0 } }),
        fetchPendingProviders({ token }),
        fetchAdminPayments({
          token,
          filters: { payment_status: "PROCESSING", limit: 1, offset: 0 },
        }),
        fetchAdminPayments({
          token,
          filters: { payment_status: "REVIEW", limit: 1, offset: 0 },
        }),
        fetchAdminPayments({
          token,
          filters: { payment_status: "PENDING", limit: 1, offset: 0 },
        }),
        fetchAllSuccessPayments(),
        fetchAdminBookings({
          token,
          filters: { booking_status: "pending", limit: 1, offset: 0 },
        }),
        fetchAdminBookings({
          token,
          filters: { booking_status: "confirmed", limit: 1, offset: 0 },
        }),
        fetchAdminBookings({
          token,
          filters: { booking_status: "completed", limit: 1, offset: 0 },
        }),
        fetchAdminBookings({
          token,
          filters: { booking_status: "cancelled", limit: 1, offset: 0 },
        }),
      ]);

      const paidRevenue = successPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      setStats({
        totalBookings: allBookings.count,
        pendingProviders: pendingProviders.count,
        pendingPayments:
          processingPayments.count + reviewPayments.count + pendingPayments.count,
        paidRevenue,
        bookingStatusCounts: {
          pending: pendingBookings.count,
          confirmed: confirmedBookings.count,
          completed: completedBookings.count,
          cancelled: cancelledBookings.count,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Cannot load dashboard.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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
            icon="calendar-outline"
            title="Total Bookings"
            value={stats.totalBookings}
          />
          <StatCard
            icon="card-outline"
            title="Pending Payments"
            value={stats.pendingPayments}
          />
          <StatCard
            icon="business-outline"
            title="Pending Providers"
            value={stats.pendingProviders}
          />
          <StatCard
            icon="cash-outline"
            title="Paid Revenue"
            value={formatMoney(stats.paidRevenue)}
          />
        </View>

        <Text style={styles.sectionTitle}>Bookings by Status</Text>

        {BOOKING_STATUSES.map((status) => (
          <View key={status} style={styles.statusRow}>
            <Text style={styles.statusLabel}>{status}</Text>
            <Text style={styles.statusValue}>
              {stats.bookingStatusCounts[status] || 0}
            </Text>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={22} color="#2563EB" />
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
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
    color: "#64748B",
  },
  error: {
    marginTop: 12,
    color: "#DC2626",
    fontWeight: "700",
  },
  grid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    width: "48%",
    minHeight: 118,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "space-between",
  },
  cardValue: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  statusRow: {
    minHeight: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusLabel: {
    textTransform: "capitalize",
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  statusValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#2563EB",
  },
});
