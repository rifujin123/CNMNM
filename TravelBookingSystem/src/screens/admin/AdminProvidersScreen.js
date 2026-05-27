import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchPendingProviders,
  verifyProvider,
} from "../../api/admin";

export default function AdminProvidersScreen() {
  const { token } = useAuth();

  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadProviders = useCallback(async (refresh = false) => {
    if (!token) return;

    try {
      refresh ? setIsRefreshing(true) : setIsLoading(true);
      setError("");

      const data = await fetchPendingProviders({ token });
      setProviders(data.items);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Cannot load pending providers."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const approveProvider = (provider) => {
    Alert.alert(
      "Approve provider",
      `Approve ${provider.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              setActionLoadingId(provider.id);

              await verifyProvider({
                token,
                providerId: provider.id,
                approved: true,
              });

              await loadProviders(true);
            } catch (err) {
              Alert.alert(
                "Approve failed",
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

  const rejectProvider = (provider) => {
    Alert.alert(
      "Reject provider",
      `Reject ${provider.username}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoadingId(provider.id);

              await verifyProvider({
                token,
                providerId: provider.id,
                approved: false,
              });

              await loadProviders(true);
            } catch (err) {
              Alert.alert(
                "Reject failed",
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
        <AppHeader title="Provider Approval" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.muted}>Loading providers...</Text>
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
            onRefresh={() => loadProviders(true)}
          />
        }
      >
        <AppHeader title="Provider Approval" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {providers.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={42} color="#16A34A" />
            <Text style={styles.emptyTitle}>No pending providers</Text>
            <Text style={styles.muted}>All provider requests have been reviewed.</Text>
          </View>
        ) : (
          providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isLoading={actionLoadingId === provider.id}
              onApprove={() => approveProvider(provider)}
              onReject={() => rejectProvider(provider)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProviderCard({ provider, isLoading, onApprove, onReject }) {
  const profile = provider?.provider_profile;
  const licenseUrl = profile?.business_license_url || profile?.business_license;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{provider.username}</Text>
          <Text style={styles.email}>{provider.email}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Pending</Text>
        </View>
      </View>

      <InfoRow label="Business" value={profile?.business_name || "N/A"} />
      <InfoRow label="Tax code" value={profile?.tax_code || "N/A"} />

      {licenseUrl ? (
        <Image source={{ uri: licenseUrl }} style={styles.licenseImage} />
      ) : (
        <Text style={styles.muted}>No license image.</Text>
      )}

      <View style={styles.actions}>
        <Pressable
          disabled={isLoading}
          style={[styles.rejectButton, isLoading && styles.disabled]}
          onPress={onReject}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </Pressable>

        <Pressable
          disabled={isLoading}
          style={[styles.approveButton, isLoading && styles.disabled]}
          onPress={onApprove}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Processing..." : "Approve"}
          </Text>
        </Pressable>
      </View>
    </View>
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
  error: {
    marginTop: 10,
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
    marginBottom: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  email: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
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
  licenseImage: {
    marginTop: 12,
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  actions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  approveButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  disabled: {
    opacity: 0.6,
  },
});
