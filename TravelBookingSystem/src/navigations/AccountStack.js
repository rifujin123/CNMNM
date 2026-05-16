import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountScreen from "../screens/AccountScreen";
import PersonalInformationScreen from "../screens/PersonalInformationScreen";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";
import SecurityScreen from "../screens/SecurityScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import HelpAndSupportScreen from "../screens/HelpAndSupportScreen";

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
