import { StyleSheet, Text, View } from "react-native";
import React from "react";
import GuestHero from "../components/GuestHero";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { useNavigation } from "@react-navigation/native";

const AccountNotLoggedInScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <AppHeader title="Account" />
        <GuestHero onLoginPress={() => navigation.navigate("Login")} />
      </View>
    </SafeAreaView>
  );
};

export default AccountNotLoggedInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
