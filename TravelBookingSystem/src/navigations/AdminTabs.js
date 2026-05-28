import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminProvidersScreen from "../screens/admin/AdminProvidersScreen";
import AdminPaymentsScreen from "../screens/admin/AdminPaymentsScreen";
import AdminBookingsScreen from "../screens/admin/AdminBookingsScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#64748B",
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AdminProviders"
        component={AdminProvidersScreen}
        options={{
          title: "Providers",
          tabBarIcon: ({ color }) => (
            <Ionicons name="business-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AdminPayments"
        component={AdminPaymentsScreen}
        options={{
          title: "Payments",
          tabBarIcon: ({ color }) => (
            <Ionicons name="card-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{
          title: "Bookings",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar-outline" size={24} color={color} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}
