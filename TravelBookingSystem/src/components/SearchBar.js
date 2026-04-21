import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SearchBar({ placeholder }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{placeholder}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  text: {
    fontSize: 14,
    color: "#94A3B8",
  },
});
