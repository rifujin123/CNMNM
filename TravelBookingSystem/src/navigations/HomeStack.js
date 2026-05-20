import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import CategoryListScreen from "../screens/CategoryListScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import HotelDetailScreen from "../screens/HotelDetailScreen";
import SeeAllScreen from "../screens/SeeAllScreen";
import BookingCheckoutScreen from "../screens/BookingCheckoutScreen";
import BookingPaymentScreen from "../screens/BookingPaymentScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="CategoryList"
        component={CategoryListScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.category?.name ?? "Category",
          headerTintColor: "#0F172A",
          headerStyle: { backgroundColor: "#F8FAFC" },
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name="SeeAll"
        component={SeeAllScreen}
        options={({ route }) => ({
          headerShown: true,
          headerTitle: route.params?.title ?? "All Tours",
          headerTintColor: "#0F172A",
          headerStyle: { backgroundColor: "#F8FAFC" },
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="HotelDetail" component={HotelDetailScreen} />
      <Stack.Screen name="BookingCheckout" component={BookingCheckoutScreen} />
      <Stack.Screen name="BookingPayment" component={BookingPaymentScreen} />
    </Stack.Navigator>
  );
}
