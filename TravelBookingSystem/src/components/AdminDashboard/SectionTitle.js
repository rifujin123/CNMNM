import React from "react";
import { StyleSheet, Text } from "react-native";

export default function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
});