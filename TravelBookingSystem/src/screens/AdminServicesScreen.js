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

import AppHeader from "../components/AppHeader";
import { useAuth } from "../../context/AuthContext";
import {
  fetchAdminServices,
  updateAdminServiceActive,
} from "../api/admin";

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
          ...(serviceId.trim() ? { service_id: serviceId.trim() } : {}),
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
  }, [token, typeFilter, statusFilter, serviceId]);

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

          <Pressable style={styles.filterButton} onPress={() => loadServices(true)}>
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
              />
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.segmentScroll}
    >
      {options.map((option) => {
        const active = value === option.key;

        return (
          <Pressable
            key={option.key}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ServiceModerationCard({ service, isLoading, onToggle }) {
  const isActive = Boolean(service.is_active);
  const location = service.city?.name || "Unknown city";
  const category = service.category?.name || service.service_type;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.meta}>
            {service.service_type} - {category} - {location}
          </Text>
        </View>

        <View style={[styles.badge, isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text
            style={[
              styles.badgeText,
              isActive ? styles.activeBadgeText : styles.inactiveBadgeText,
            ]}
          >
            {isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <InfoRow label="Base price" value={formatMoney(service.base_price)} />

      <Pressable
        disabled={isLoading}
        style={[
          styles.toggleButton,
          isActive ? styles.deactivateButton : styles.activateButton,
          isLoading && styles.disabled,
        ]}
        onPress={onToggle}
      >
        <Text style={styles.toggleButtonText}>
          {isLoading
            ? "Updating..."
            : isActive
              ? "Set Inactive"
              : "Set Active"}
        </Text>
      </Pressable>
    </View>
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
  segmentScroll: {
    marginTop: 12,
  },
  segment: {
    marginRight: 8,
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },
  segmentActive: {
    backgroundColor: "#2563EB",
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#334155",
  },
  segmentTextActive: {
    color: "#FFFFFF",
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
  serviceName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    textTransform: "capitalize",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeBadge: {
    backgroundColor: "#DCFCE7",
  },
  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  activeBadgeText: {
    color: "#166534",
  },
  inactiveBadgeText: {
    color: "#991B1B",
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
  toggleButton: {
    marginTop: 12,
    minHeight: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activateButton: {
    backgroundColor: "#16A34A",
  },
  deactivateButton: {
    backgroundColor: "#DC2626",
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.6,
  },
});
