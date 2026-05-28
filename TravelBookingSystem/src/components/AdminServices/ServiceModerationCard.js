import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import InfoRow from "../InfoRow";

export default function ServiceModerationCard({
  service,
  isLoading,
  onToggle,
  formatMoney,
}) {
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
