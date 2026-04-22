import MyTabs from "./src/navigations/BottomTabs";
import { NavigationContainer } from "@react-navigation/native";
import IntroScreen from "./src/srceens/IntroScreen";
import LoginScreen from "./src/srceens/LoginScreen";
import LoginTabs from "./src/components/LoginTabs";
import { StyleSheet, View } from "react-native";
import { vs } from "react-native-size-matters";
export default function App() {
  return (
    // <NavigationContainer>
    //   <MyTabs />
    // </NavigationContainer>
    <LoginScreen />
  );
}
