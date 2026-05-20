import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SavedScreen from "../screens/SavedScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import HotelDetailScreen from "../screens/HotelDetailScreen";
import BookingCheckoutScreen from "../screens/BookingCheckoutScreen";
import BookingPaymentScreen from "../screens/BookingPaymentScreen";

const Stack = createNativeStackNavigator();

export default function SaveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedHome" component={SavedScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
      <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} />
    </Stack.Navigator>
  );
}
