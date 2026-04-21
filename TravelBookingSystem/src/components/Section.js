import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { s } from "react-native-size-matters";
import Entypo from "@expo/vector-icons/Entypo";
const Section = ({ title, icon }) => {
  return (
    <View>
      <View style={styles.section}>
        <View style={styles.sectionLeft}>
          <Entypo name="dot-single" size={24} color="black" />
          <Text>{title}</Text>
        </View>
        <TouchableOpacity style={styles.nextButton}>
          <Entypo name="chevron-right" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
    </View>
  );
};

export default Section;

const styles = StyleSheet.create({
  section: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    height: s(60),
    paddingHorizontal: 12,
  },
  sectionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 25,
    backgroundColor: "#d9d9d9",
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
    shadowRadius: 4,
    elevation: 2,
  },
});
