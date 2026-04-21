import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function PromoBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Summer Escape 30% Off</Text>
      <Text style={styles.sub}>Book your next trip today</Text>

      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>Explore now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 20,
    height: 192,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    padding: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    color: "#FFF",
    fontWeight: "700",
    maxWidth: 240,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: "#DBEAFE",
  },
  cta: {
    marginTop: 18,
    width: 120,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D4ED8",
  },
});
