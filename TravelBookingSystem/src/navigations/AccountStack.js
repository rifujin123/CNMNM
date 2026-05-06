import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountScreen from "../srceens/AccountScreen";
import PersonalInformationScreen from "../srceens/PersonalInformationScreen";
import PaymentMethodsScreen from "../srceens/PaymentMethodsScreen";
import SecurityScreen from "../srceens/SecurityScreen";
import NotificationsScreen from "../srceens/NotificationsScreen";
import HelpAndSupportScreen from "../srceens/HelpAndSupportScreen";

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
