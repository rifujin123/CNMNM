import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountScreen from "../screens/account/AccountScreen";
import PersonalInformationScreen from "../screens/account/PersonalInformationScreen";
import PaymentMethodsScreen from "../screens/account/PaymentMethodsScreen";
import SecurityScreen from "../screens/account/SecurityScreen";
import NotificationsScreen from "../screens/account/NotificationsScreen";
import HelpAndSupportScreen from "../screens/account/HelpAndSupportScreen";

const Stack = createNativeStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
      <Stack.Screen
        name="PersonalInformation"
        component={PersonalInformationScreen}
      />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpAndSupport" component={HelpAndSupportScreen} />
    </Stack.Navigator>
  );
};

export default AccountStack;
