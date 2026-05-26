import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { vs } from "react-native-size-matters";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../../components/AppHeader";
import { accountStyles } from "../../styles/accountStyles";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../../context/AuthContext";
import Apis, { endpoints } from "../../../configs/Apis";

const AccountScreen = () => {
  const { user, token, clearAuth } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      if (!token) return;
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

  const items = [
    {
      key: "personal",
      title: "Personal information",
      subtitle: "Profile, phone, email",
      icon: <Octicons name="person" size={18} color="#0F172A" />,
      onPress: () => navigation.navigate("AccountRoot", { screen: "PersonalInformation" }),
    },
    {
      key: "payment",
      title: "Payment methods",
      subtitle: "Cards, billing",
      icon: <MaterialIcons name="payment" size={18} color="#0F172A" />,
      onPress: () => navigation.navigate("AccountRoot", { screen: "PaymentMethods" }),
    },
    {
      key: "security",
      title: "Security",
      subtitle: "Password, devices",
      icon: <Feather name="shield" size={18} color="#0F172A" />,
      onPress: () => navigation.navigate("AccountRoot", { screen: "Security" }),
    },
    {
      key: "notifications",
      title: "Notifications",
      subtitle: "Trips, promos",
      icon: (
        <Ionicons
          name="notifications-outline"
          size={18}
          color="#0F172A"
        />
      ),
      onPress: () => navigation.navigate("AccountRoot", { screen: "Notifications" }),
    },
    {
      key: "help",
      title: "Help & support",
      subtitle: "FAQ, contact",
      icon: <Ionicons name="help-circle-outline" size={18} color="#0F172A" />,
      onPress: () => navigation.navigate("AccountRoot", { screen: "HelpAndSupport" }),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader title="Account" />

        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <UserAvatar avatarUri={user?.avatar} />
            <View style={styles.profileText}>
              <Text style={styles.name} numberOfLines={1}>
                {(user?.last_name || "").trim()} {(user?.first_name || "").trim()}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                @{user?.username || "user"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("AccountRoot", { screen: "PersonalInformation" })}
            style={styles.editPill}
          >
            <Text style={styles.editText}>Edit</Text>
            <Feather name="chevron-right" size={16} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionShell}>
          {items.map((it, idx) => (
            <React.Fragment key={it.key}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={it.onPress}
                style={styles.row}
              >
                <View style={styles.iconWrap}>{it.icon}</View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{it.title}</Text>
                  <Text style={styles.rowSub}>{it.subtitle}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#64748B" />
              </TouchableOpacity>
              {idx !== items.length - 1 ? <View style={styles.divider} /> : null}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={18} color="#991B1B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: vs(20) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;


const styles = accountStyles;


