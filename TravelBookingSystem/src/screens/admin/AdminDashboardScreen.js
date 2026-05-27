import React, { useCallback, useEffect, useState } from "react";
import {ActivityIndicator,RefreshControl,ScrollView,StyleSheet,Text,View,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../../context/AuthContext";
import { fetchAdminDashboard } from "../../api/admin";


const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} VND`;
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


      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIconBox}>
        <Ionicons name={icon} size={34} color="#2563EB" />
      </View>
      <View style={styles.cardTextBox}>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </View>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function StatusRow({ label, value }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#F8FAFC",},
  content: {paddingHorizontal: 20,paddingTop: 12,},
  center: {flex: 1,alignItems: "center",justifyContent: "center",gap: 10,},
  muted: {color: "#64748B",},
  error: {marginTop: 12,color: "#DC2626",fontWeight: "700",},
  grid: {marginTop: 16,flexDirection: "row",flexWrap: "wrap",gap: 12,},
  card: {width: "100%",minHeight: 96,backgroundColor: "#FFFFFF",borderRadius: 12,padding: 14,borderWidth: 1,borderColor: "#E2E8F0",flexDirection: "row",alignItems: "center",gap: 14,},
  cardIconBox: {width: 58,height: 58,borderRadius: 14,backgroundColor: "#DBEAFE",alignItems: "center",justifyContent: "center",},
  cardTextBox: {flex: 1,},
  cardValue: {fontSize: 21,fontWeight: "900",color: "#0F172A",},
  cardTitle: {marginTop: 4,fontSize: 13,color: "#64748B",fontWeight: "700",},
  sectionTitle: {
  marginTop: 22,
  marginBottom: 10,
  fontSize: 16,
  fontWeight: "900",
  color: "#0F172A",
},
statusRow: {
  minHeight: 46,
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
  fontSize: 14,
  fontWeight: "900",
  color: "#2563EB",
},
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
