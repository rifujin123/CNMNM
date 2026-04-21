import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeHeader({ userName }) {
  return (
    <View style={styles.row}>
      <Text style={styles.greeting}>Hello, {userName}</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{userName?.[0] || "U"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#0F172A",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDBA74",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "700",
  },
});
