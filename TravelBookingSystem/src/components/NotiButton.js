import {
  StyleSheet,
  Text,
  Touchable,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { s } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";
const NotiButton = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <Ionicons name="notifications-outline" size={32} color="black" />
    </TouchableOpacity>
  );
};

export default NotiButton;

const styles = StyleSheet.create({
  container: {
    height: s(48),
    width: s(48),
    borderRadius: s(24),
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
});
