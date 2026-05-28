import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import InfoRow from "../InfoRow";

export default function ProviderCard({
  provider,
  isLoading,
  onApprove,
  onReject,
}) {
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

const styles = StyleSheet.create({
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
  muted: {
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
