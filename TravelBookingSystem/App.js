import MyTabs from "./src/navigations/BottomTabs";
import ProviderTabs from "./src/navigations/ProviderTabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import AccountNotLoggedInScreen from "./src/screens/AccountNotLoggedInScreen";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TripDetailScreen from "./src/screens/TripDetailScreen";
import AccountStack from "./src/navigations/AccountStack";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
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