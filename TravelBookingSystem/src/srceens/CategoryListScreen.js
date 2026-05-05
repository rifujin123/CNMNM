import React, { useLayoutEffect } from "react";
import { StyleSheet, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryListScreen({ route, navigation }) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.headerBtn}
        >
          <Text>
            {" "}
            <Ionicons name="filter" size={24} color="black" />
          </Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return <SafeAreaView style={styles.safe}></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  headerBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
