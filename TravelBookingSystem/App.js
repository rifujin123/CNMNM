import MyTabs from "./src/navigations/BottomTabs";
import ProviderTabs from "./src/navigations/ProviderTabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import LoginScreen from "./src/screens/guest/LoginScreen";
import AccountNotLoggedInScreen from "./src/screens/guest/AccountNotLoggedInScreen";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import TripDetailScreen from "./src/screens/shared/TripDetailScreen";
import AccountStack from "./src/navigations/AccountStack";
import AdminTabs from "./src/navigations/AdminTabs";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { authLoading, isLoggedIn, role } = useAuth();

  if (authLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="MainTabs" component={MyTabs} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="AccountNotLoggedInScreen"
              component={AccountNotLoggedInScreen}
            />
          </>
        ) : role === "admin" ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="AccountRoot" component={AccountStack} />
          </>
        ) : role === "provider" ? (
          <>
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
            <Stack.Screen name="AccountRoot" component={AccountStack} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MyTabs} />
            <Stack.Screen name="AccountRoot" component={AccountStack} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="AccountNotLoggedInScreen"
              component={AccountNotLoggedInScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <RootNavigator />
      </WishlistProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});