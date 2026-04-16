import { StyleSheet, Text, View } from "react-native";
import React from "react";
import UserAvatar from "../components/UserAvatar";
import AccountHeader from "../components/AccountHeader";
import GuestHero from "../components/GuestHero";
const AccountNotLoggedInScreen = () => {
  return (
    <View>
      <AccountHeader />
      <GuestHero />
    </View>
  );
};

export default AccountNotLoggedInScreen;

const styles = StyleSheet.create({});
