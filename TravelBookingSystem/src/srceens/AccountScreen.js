import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import UserAvatar from "../components/UserAvatar";
import NotiButton from "../components/NotiButton";
import { vs, s } from "react-native-size-matters";
import Section from "../components/Section";

const AccountScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#eeeeee",
        paddingTop: vs(50),
        paddingHorizontal: 17,
      }}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <UserAvatar />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>Tuan Khoi</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.profileLink}>
                Update personal information
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <NotiButton />
      </View>
      <View style={styles.profileContainer}>
        <Section />
        <Section />
        <Section />
        <Section />
      </View>
      <View style={styles.profileContainer}>
        <Section />
        <Section />
      </View>
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: vs(20),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userTextContainer: {
    justifyContent: "center",
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  profileLink: {
    color: "#000",
    textDecorationLine: "underline",
  },
  profileContainer: {
    justifyContent: "center",
    marginTop: vs(8),
    paddingVertical: vs(10),
    borderRadius: s(15),
    backgroundColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
});
