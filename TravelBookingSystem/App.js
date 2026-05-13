import MyTabs from "./src/navigations/BottomTabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginScreen from "./src/srceens/LoginScreen";
import AccountNotLoggedInScreen from "./src/srceens/AccountNotLoggedInScreen";
import { AuthProvider } from "./context/AuthContext";
import TripDetailScreen from "./src/srceens/TripDetailScreen";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MyTabs} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="AccountRoot" component={AccountStack} />
            <Stack.Screen
              name="AccountNotLoggedInScreen"
              component={AccountNotLoggedInScreen}
            />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}
