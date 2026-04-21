import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { s, vs } from "react-native-size-matters";

export default function GuestHero(props) {
  const { onLoginPress } = props;

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarIcon}>G</Text>
      </View>

      <Text style={styles.title}>Sign in to your account</Text>

      <Text style={styles.description}>
        Track bookings, save trips, and manage your profile in one place.
      </Text>

      <TouchableOpacity style={styles.button} onPress={onLoginPress}>
        <Text style={styles.buttonText}>Sign In / Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: vs(32),
    marginBottom: vs(24),
  },
  avatar: {
    width: s(64),
    height: s(64),
    borderRadius: s(32),
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    fontSize: s(22),
    fontWeight: "600",
    color: "#64748B",
  },
  title: {
    marginTop: vs(16),
    fontSize: s(20),
    lineHeight: vs(24),
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  description: {
    marginTop: vs(10),
    fontSize: s(14),
    lineHeight: vs(20),
    color: "#64748B",
    textAlign: "center",
    maxWidth: s(500),
  },
  button: {
    marginTop: vs(20),
    width: "75%",
    height: vs(48),
    borderRadius: s(20),
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: s(10),
    shadowOffset: { width: 0, height: vs(4) },
    elevation: 3,
  },
  buttonText: {
    fontSize: s(14),
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
