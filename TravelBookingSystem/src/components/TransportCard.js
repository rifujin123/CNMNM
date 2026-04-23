import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TransportCard({ transport }) {
  return (
    <View style={styles.card}>
      <View style={[styles.thumb, { backgroundColor: transport.color }]} />
      <Text style={styles.name} numberOfLines={1}>
        {transport.name}
      </Text>
      <Text style={styles.meta}>{transport.meta}</Text>
      <Text style={styles.price}>{transport.price ?? "From $12 / seat"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    height: 186,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 12,
    marginRight: 12,
  },
  thumb: {
    width: "100%",
    height: 96,
    borderRadius: 12,
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  price: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },
});
