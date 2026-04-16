import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { s, vs } from "react-native-size-matters";
import NotiButton from "./NotiButton";
import { SafeAreaView } from "react-native-safe-area-context";
export default function AccountHeader() {
  return (
    <SafeAreaView style={styles.row}>
      <Text style={styles.title}>Account</Text>
      <NotiButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: vs(40),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: vs(8),
  },
  title: {
    fontSize: s(20),
    lineHeight: vs(30),
    fontWeight: "700",
    color: "#0F172A",
  },
  notifyButton: {
    width: s(30),
    height: s(30),
    borderRadius: s(9),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  bellWrap: {
    width: s(16),
    height: s(16),
    alignItems: "center",
    justifyContent: "center",
  },
  bellStem: {
    width: s(5),
    height: vs(2.5),
    borderWidth: 1.6,
    borderColor: "#0F172A",
    borderBottomWidth: 0,
    borderTopLeftRadius: s(2),
    borderTopRightRadius: s(2),
    marginBottom: vs(1),
  },
  bellBody: {
    width: s(12),
    height: vs(9),
    borderWidth: 1.6,
    borderColor: "#0F172A",
    borderTopLeftRadius: s(7),
    borderTopRightRadius: s(7),
    borderBottomLeftRadius: s(6),
    borderBottomRightRadius: s(6),
    backgroundColor: "transparent",
  },
  bellBase: {
    width: s(8),
    height: vs(2),
    borderRadius: s(1),
    backgroundColor: "#0F172A",
    marginTop: vs(1),
  },
  bellClapper: {
    width: s(3.5),
    height: s(3.5),
    borderRadius: s(1.75),
    backgroundColor: "#0F172A",
    marginTop: vs(1),
  },
});
