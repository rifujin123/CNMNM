import { StyleSheet, Text, View, Button } from "react-native";
import React, { use } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

const GoldScreen = () => {
  const navigation = useNavigation();
  const { name, params } = useRoute()
  return (
    <View style={styles.container}>
      <Text>GoldScreen</Text>
      <Button
        title="Go to tomato screen"
        onPress={() => navigation.navigate("TomatoScreen")}
      />
    </View>
  );
};

export default GoldScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "gold",
    justifyContent: "center",
    alignItems: "center",
  },
});
