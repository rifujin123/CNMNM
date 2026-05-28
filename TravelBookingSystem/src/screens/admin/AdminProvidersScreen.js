import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import AppHeader from "../../components/AppHeader";
import ProviderCard from "../../components/AdminProviders/ProviderCard";
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
});
