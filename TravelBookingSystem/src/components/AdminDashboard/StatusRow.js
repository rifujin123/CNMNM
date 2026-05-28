import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StatusRow({ label, value }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});