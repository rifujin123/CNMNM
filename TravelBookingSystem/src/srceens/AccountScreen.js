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
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { endpoints } from "../../configs/Apis";

const AccountScreen = () => {
  const { user, token, clearAuth } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      if (!token) {
        return;
      }
      await Apis.post(
        endpoints.logout,
        {},
        {
          headers: {
            Authorization: `Bearer ${String(token).trim()}`,
          },
        },
      );
    } catch (error) {
      console.log("Logout error data:", error?.response?.data);
      console.log("Logout status:", error?.response?.status);
      console.log("Token:", token);
    } finally {
      await AsyncStorage.removeItem("auth_access_token");
      await AsyncStorage.removeItem("auth_user");
      clearAuth();

      navigation.navigate("MainTabs", { screen: "HomeFeed" });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <UserAvatar avatarUri={user?.avatar} />
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>
              {user?.last_name} {user?.first_name}
            </Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.profileLink}>
                Update personal information
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.profileContainer}>
          <Section
            title="Personal Information"
            icon={<Octicons name="person" size={24} color="black" />}
            onPress={() => navigation.navigate("PersonalInformation")}
          />
          <Section
            title="Payment Methods"
            icon={<MaterialIcons name="payment" size={24} color="black" />}
            onPress={() => navigation.navigate("PaymentMethods")}
          />
          <Section
            title="Security"
            icon={<Feather name="settings" size={24} color="black" />}
            onPress={() => navigation.navigate("Security")}
          />
          <Section
            title="Notifications"
            icon={
              <Ionicons name="notifications-outline" size={24} color="black" />
            }
            onPress={() => navigation.navigate("Notifications")}
          />
        </View>
        <View style={styles.profileContainer}>
          <Section
            title="Help & Support"
            icon={<Ionicons name="help-outline" size={24} color="black" />}
            onPress={() => navigation.navigate("HelpAndSupport")}
          />
          <Section
            title="Logout"
            icon={<MaterialIcons name="logout" size={24} color="black" />}
            onPress={handleLogout}
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
    paddingHorizontal: s(24),
    paddingTop: vs(35),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: s(14),
    paddingTop: vs(10),
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
  },
  userTextContainer: {
    justifyContent: "center",
    gap: s(4),
  },
  userName: {
    fontSize: vs(16),
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
