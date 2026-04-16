import { StyleSheet, Text, View, Button } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const TomatoScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text>TomatoScreen</Text>
      <Button
        title="Go to purple screen"
        onPress={() => navigation.navigate("PurpleScreen")}
      />
    </View>
  );
};

export default TomatoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
    justifyContent: "center",
    alignItems: "center",
  },
});
