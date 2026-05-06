import React from "react";
import { View, StyleSheet, TextInput } from "react-native";

export default function SearchBar({ placeholder, value, onChangeText }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 5,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    paddingHorizontal: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  input: {
    fontSize: 14,
    color: "#94A3B8",
  },
});
