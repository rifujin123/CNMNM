import MyTabs from "./src/navigations/BottomTabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/srceens/LoginScreen";
import AccountNotLoggedInScreen from "./src/srceens/AccountNotLoggedInScreen";
import AccountScreen from "./src/srceens/AccountScreen";
import { AuthProvider } from "./context/AuthContext";
import TripDetailScreen from "./src/srceens/TripDetailScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MyTabs} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AccountScreen" component={AccountScreen} />
          <Stack.Screen
            name="AccountNotLoggedInScreen"
            component={AccountNotLoggedInScreen}
          />
          <Stack.Screen name="TripDetail" component={TripDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
