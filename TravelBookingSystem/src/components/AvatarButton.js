import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React from "react";
import { s } from "react-native-size-matters";
import Ionicons from "@expo/vector-icons/Ionicons";

const AvatarButton = ({ onPress, avatarUri }) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={28} color="black" />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AvatarButton;

const styles = StyleSheet.create({
  container: {
    height: s(32),
    width: s(32),
    borderRadius: s(16),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: s(16),
  },
});
