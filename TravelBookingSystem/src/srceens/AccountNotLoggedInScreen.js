import { StyleSheet, Text, View } from "react-native";
import React from "react";
import UserAvatar from "../components/UserAvatar";
import GuestHero from "../components/GuestHero";
import { vs, s } from "react-native-size-matters";
import NotiButton from "../components/NotiButton";
const AccountNotLoggedInScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
        <NotiButton />
      </View>
      <GuestHero />
    </View>
  );
};

export default AccountNotLoggedInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eeeeee",
    paddingTop: vs(50),
    paddingHorizontal: 17,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: s(20),
    lineHeight: vs(30),
    fontWeight: "700",
    color: "#0F172A",
  },
});
