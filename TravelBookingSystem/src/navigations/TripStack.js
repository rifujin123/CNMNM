import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TripDetailScreen from "../screens/shared/TripDetailScreen";
import TripsScreen from "../screens/shared/TripsScreen";
import BookingCheckoutScreen from "../screens/shared/BookingCheckoutScreen";
import BookingPaymentScreen from "../screens/shared/BookingPaymentScreen";

const Stack = createNativeStackNavigator();

export default function TripStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TripsHome" component={TripsScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen}/>
      <Stack.Screen name="BookingPayment" component={BookingPaymentScreen}/>
    </Stack.Navigator>
  );
}
