import { StyleSheet, Text, View } from "react-native";
import React from "react";
import GuestHero from "../../components/GuestHero";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { useNavigation } from "@react-navigation/native";
import { commonStyles as styles } from "../../styles/commonStyles";

const AccountNotLoggedInScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.tabScreen}>
      <View style={styles.tabContent}>
        <AppHeader title="Account" />
        <GuestHero onLoginPress={() => navigation.navigate("Login")} />
      </View>
    </SafeAreaView>
  );
};

export default AccountNotLoggedInScreen;

