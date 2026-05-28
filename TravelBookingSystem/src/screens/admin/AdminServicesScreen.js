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
import SegmentedControl from "../../components/AdminServices/SegmentedControl";
import ServiceModerationCard from "../../components/AdminServices/ServiceModerationCard";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAdminServices,
  updateAdminServiceActive,
} from "../../api/admin";

const SERVICE_TYPES = [
  { key: "all", label: "All" },
  { key: "tour", label: "Tours" },
  { key: "hotel", label: "Hotels" },
  { key: "transport", label: "Transport" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString("vi-VN")} VND`;
};

const getStatusFilterParams = (statusFilter) => {
  if (statusFilter === "active") return { is_active: true };
  if (statusFilter === "inactive") return { is_active: false };
  return {};
};

export default function AdminServicesScreen() {
  const { token } = useAuth();

  const [services, setServices] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [serviceId, setServiceId] = useState("");
  const [appliedServiceId, setAppliedServiceId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const [error, setError] = useState("");

  const loadServices = useCallback(async (refresh = false) => {
    if (!token) return;

    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const data = await fetchAdminServices({
        token,
        type: typeFilter,
        filters: {
          ...getStatusFilterParams(statusFilter),
          ...(appliedServiceId.trim() ? { service_id: appliedServiceId.trim() } : {}),
        },
      });

      setServices(data.items);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Cannot load services.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token, typeFilter, statusFilter, appliedServiceId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const toggleService = (service) => {
    const nextActive = !service.is_active;
    const actionText = nextActive ? "activate" : "deactivate";

    Alert.alert(
      nextActive ? "Activate service" : "Deactivate service",
      `Do you want to ${actionText} "${service.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: nextActive ? "Activate" : "Deactivate",
          style: nextActive ? "default" : "destructive",
          onPress: async () => {
            const loadingKey = `${service.service_type}-${service.id}`;

            try {
              setActionLoadingKey(loadingKey);

              await updateAdminServiceActive({
                token,
                type: service.service_type,
                serviceId: service.id,
                isActive: nextActive,
              });

              await loadServices(true);
            } catch (err) {
              Alert.alert(
                "Update failed",
                err?.response?.data?.detail ||
                  err?.message ||
                  "Please try again.",
              );
            } finally {
              setActionLoadingKey("");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Service Moderation" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Loading services...</Text>
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
            onRefresh={() => loadServices(true)}
          />
        }
      >
        <AppHeader title="Service Moderation" />

        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Service ID"
            value={serviceId}
            onChangeText={setServiceId}
            keyboardType="numeric"
          />

          <Pressable
            style={styles.filterButton}
            onPress={() => setAppliedServiceId(serviceId.trim())}
          >
            <Ionicons name="filter-outline" size={18} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Apply Filters</Text>
          </Pressable>
        </View>

        <SegmentedControl
          options={SERVICE_TYPES}
          value={typeFilter}
          onChange={setTypeFilter}
        />

        <SegmentedControl
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {services.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={42} color="#64748B" />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.muted}>Try changing the filter.</Text>
          </View>
        ) : (
          services.map((service) => {
            const loadingKey = `${service.service_type}-${service.id}`;

            return (
              <ServiceModerationCard
                key={loadingKey}
                service={service}
                isLoading={actionLoadingKey === loadingKey}
                onToggle={() => toggleService(service)}
                formatMoney={formatMoney}
              />
            );
          })
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
