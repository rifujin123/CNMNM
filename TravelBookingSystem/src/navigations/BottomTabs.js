import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeStack from "./HomeStack";
import TripStack from "./TripStack";
import ExploreStack from "./ExploreStack";
import TripsScreen from "../srceens/TripsScreen";
import SavedScreen from "../srceens/SavedScreen";
import LoginScreen from "../srceens/LoginScreen";
import AccountNotLoggedInScreen from "../srceens/AccountNotLoggedInScreen";
import AccountScreen from "../srceens/AccountScreen";
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
        component={SavedScreen}
        options={{
          tabBarIcon: () => (
            <Ionicons name="bookmark-outline" size={24} color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
