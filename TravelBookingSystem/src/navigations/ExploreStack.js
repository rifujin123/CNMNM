import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExploreScreen from "../srceens/ExploreScreen";
import ItemDetailScreen from "../srceens/ItemDetailScreen";
import CategoryListScreen from "../srceens/CategoryListScreen";
import SeeAllScreen from "../srceens/SeeAllScreen";

const Stack = createNativeStackNavigator();

export default function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
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
    </Stack.Navigator>
  );
}
