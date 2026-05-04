import React from "react";
import { View, Text, StyleSheet } from "react-native";

function PlaceCard({ place }) {
  return (
    <View style={styles.card}>
      <View style={[styles.thumb, { backgroundColor: place.color }]} />
      <Text style={styles.name}>{place.name}</Text>
      <Text style={styles.meta}>{place.meta}</Text>
    </View>
  );
}

export default PlaceCard;

const styles = StyleSheet.create({
  card: {
    width: 170,
    height: 180,
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
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
});
