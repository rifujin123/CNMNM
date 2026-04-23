import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { s, vs } from "react-native-size-matters";

const tabsArr = ["Login", "Register"];

const ACTIVE_BG = "#FFFFFF";

const ACTIVE_TEXT = "#0F172A";
const INACTIVE_TEXT = "#64748B";

const LoginTabs = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      {tabsArr.map((tabName) => {
        const isActive = activeTab === tabName;

        return (
          <TouchableOpacity
            key={tabName}
            style={[
              styles.tabButton,
              isActive && { backgroundColor: ACTIVE_BG },
            ]}
            onPress={() => onTabChange(tabName)}
          >
            <Text style={isActive ? styles.activeText : styles.inActiveText}>
              {tabName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default LoginTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F4",
    borderRadius: s(18),
    height: vs(48),
    flexDirection: "row",
    alignItems: "center",
    padding: s(4),
  },
  tabButton: {
    height: vs(40),
    flex: 1,
    borderRadius: s(18),
    justifyContent: "center",
    alignItems: "center",
  },
  activeText: {
    color: ACTIVE_TEXT,
    fontSize: s(14),
    fontWeight: "600",
  },
  inActiveText: {
    fontSize: s(14),
    color: INACTIVE_TEXT,
  },
});
