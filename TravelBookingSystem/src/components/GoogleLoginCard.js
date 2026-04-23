import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";

const GoogleLoginCard = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <AntDesign name="google" size={24} color="#4285F4" />
      <Text style={styles.label}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
});
