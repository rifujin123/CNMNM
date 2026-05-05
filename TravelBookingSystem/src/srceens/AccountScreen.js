import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import UserAvatar from "../components/UserAvatar";
import AvatarButton from "../components/AvatarButton";
import { vs, s } from "react-native-size-matters";
import Section from "../components/Section";
import { SafeAreaView } from "react-native-safe-area-context";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";

const AccountScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
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
        <AvatarButton />
      </View>
      <View style={styles.content}>
        <View style={styles.profileContainer}>
          <Section
            title="Personal Information"
            icon={<Octicons name="person" size={24} color="black" />}
          />
          <Section
            title="Payment Methods"
            icon={<MaterialIcons name="payment" size={24} color="black" />}
          />
          <Section
            title="Security"
            icon={<Feather name="settings" size={24} color="black" />}
          />
          <Section
            title="Notifications"
            icon={
              <Ionicons name="notifications-outline" size={24} color="black" />
            }
          />
        </View>
        <View style={styles.profileContainer}>
          <Section
            title="Help & Support"
            icon={<Ionicons name="help-outline" size={24} color="black" />}
          />
          <Section
            title="Logout"
            icon={<MaterialIcons name="logout" size={24} color="black" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
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
