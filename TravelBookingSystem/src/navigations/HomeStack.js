import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../srceens/HomeScreen";
import CategoryListScreen from "../srceens/CategoryListScreen";
import ItemDetailScreen from "../srceens/ItemDetailScreen";

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
          headerTitle: route.params?.category?.name ?? "Danh mục",
          headerTintColor: "#0F172A",
          headerStyle: { backgroundColor: "#F8FAFC" },
          headerShadowVisible: false,
        })}
      />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}
