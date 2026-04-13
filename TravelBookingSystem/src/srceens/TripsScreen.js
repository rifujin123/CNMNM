import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TripsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trips</Text>
      <Text style={styles.subtitle}>
        Quan ly booking (upcoming/completed/cancelled).
      </Text>
    </View>
  );
};

export default TripsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },
});
