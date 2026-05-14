import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SavedScreen from "../srceens/SavedScreen";
import ItemDetailScreen from "../srceens/ItemDetailScreen";

const Stack = createNativeStackNavigator();

export default function SaveStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedHome" component={SavedScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}
