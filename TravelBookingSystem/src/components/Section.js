import {
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import React from "react";
import { s } from "react-native-size-matters";
import Entypo from "@expo/vector-icons/Entypo";
const Section = () => {
  return (
    <TouchableWithoutFeedback style={styles.section}>
      <View style={styles.section}>
        <Text>Section</Text>
        <TouchableOpacity style={styles.nextButton}>
          <Entypo name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Section;

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 17,
    alignItems: "center",
    borderRadius: 20,
    height: s(60),
    marginTop: s(10),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  nextButton: {
    height: s(32),
    width: s(32),
    borderRadius: s(16),
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
  },
});
