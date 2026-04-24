import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SavedScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Saved</Text>
      <Text style={styles.subtitle}>Cac dia diem/tour da luu.</Text>
    </SafeAreaView>
  );
};

export default SavedScreen;

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
