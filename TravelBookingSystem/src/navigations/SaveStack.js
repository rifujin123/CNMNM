import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SavedScreen from "../screens/shared/SavedScreen";
import ItemDetailScreen from "../screens/shared/ItemDetailScreen";
import RatingScreen from "../screens/shared/RatingScreen";
import BookingCheckoutScreen from "../screens/shared/BookingCheckoutScreen";
import BookingPaymentScreen from "../screens/shared/BookingPaymentScreen";

const Stack = createNativeStackNavigator();

export default function SaveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedHome" component={SavedScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen
        name="RatingScreen"
        component={RatingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
      <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} />
    </Stack.Navigator>
  );
}
