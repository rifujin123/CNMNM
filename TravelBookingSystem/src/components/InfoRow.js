import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function InfoRow({ label, value, fallback = "N/A" }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || fallback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
