import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryListScreen from "../screens/CategoryListScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import TripDetailScreen from "../screens/TripDetailScreen";
import TripsScreen from "../screens/TripsScreen";

const Stack = createNativeStackNavigator();

export default function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsHome" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
}
