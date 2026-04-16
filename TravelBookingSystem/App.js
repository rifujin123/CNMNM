import MyTabs from "./src/navigations/BottomTabs";
import { NavigationContainer } from "@react-navigation/native";
import IntroScreen from "./src/srceens/IntroScreen";

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}

