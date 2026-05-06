import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CategoryListScreen from "../srceens/CategoryListScreen";
import ItemDetailScreen from "../srceens/ItemDetailScreen";
import TripDetailScreen from "../srceens/TripDetailScreen";
import TripsScreen from "../srceens/TripsScreen";

const Stack = createNativeStackNavigator();

export default function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsHome" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
}
