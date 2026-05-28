import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function StatCard({ icon, title, value }) {
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

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  cardIconBox: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextBox: {
    flex: 1,
  },
  cardValue: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "700",
  },
});