import { createStackNavigator } from "@react-navigation/stack";
import GoldScreen from "../srceens/GoldScreen";
import TomatoScreen from "../srceens/TomatoScreen";
import PurpleScreen from "../srceens/PurpleScreen";

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GoldScreen" component={GoldScreen} />
      <Stack.Screen name="TomatoScreen" component={TomatoScreen} />
      <Stack.Screen name="PurpleScreen" component={PurpleScreen} />
    </Stack.Navigator>
  );
}

export default MainStackNavigator;
