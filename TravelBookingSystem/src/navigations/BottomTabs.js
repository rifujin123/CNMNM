import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeStack from "./HomeStack";
import TripStack from "./TripStack";
import SaveStack from "./SaveStack";
import ExploreStack from "./ExploreStack";
import TripsScreen from "../screens/shared/TripsScreen";
import SavedScreen from "../screens/shared/SavedScreen";
import LoginScreen from "../screens/guest/LoginScreen";
import AccountNotLoggedInScreen from "../screens/guest/AccountNotLoggedInScreen";
import AccountScreen from "../screens/account/AccountScreen";
const Tab = createBottomTabNavigator();

export default function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tab.Screen
        name="HomeFeed"
        component={HomeStack}
        options={{
          tabBarIcon: () => (
            <Ionicons name="home-outline" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarIcon: () => (
            <Ionicons name="search-outline" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="TripTab"
        component={TripStack}
        options={{
          tabBarIcon: () => (
            <Ionicons name="calendar-outline" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SaveStack}
        options={{
          tabBarIcon: () => (
            <Ionicons name="bookmark-outline" size={24} color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
