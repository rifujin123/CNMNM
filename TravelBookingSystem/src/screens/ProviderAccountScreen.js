import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { vs, s } from "react-native-size-matters";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import AppHeader from "../components/AppHeader";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import Apis, { endpoints } from "../../configs/Apis";

const ProviderAccountScreen = () => {
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
    }
  };

  const items = [
    {
      key: "personal",
      title: "Personal information",
      subtitle: "Profile, phone, email",
      icon: <Octicons name="person" size={18} color="#0F172A" />,
      onPress: () => navigation.navigate("PersonalInformation"),
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
            onPress={() => navigation.navigate("PersonalInformation")}
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

export default ProviderAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: s(18),
  },
  contentContainer: {
    paddingBottom: vs(24),
  },

  profileCard: {
    marginTop: vs(10),
    padding: s(14),
    borderRadius: s(18),
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s(10),
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
    flex: 1,
  },
  profileText: {
    flex: 1,
    gap: vs(2),
  },
  name: {
    fontSize: vs(16),
    lineHeight: vs(20),
    fontWeight: "700",
    color: "#0F172A",
  },
  meta: {
    fontSize: vs(12),
    lineHeight: vs(16),
    color: "#64748B",
  },
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(6),
    paddingHorizontal: s(10),
    paddingVertical: vs(8),
    borderRadius: s(999),
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  editText: {
    fontSize: vs(12),
    fontWeight: "700",
    color: "#0F172A",
  },

  sectionShell: {
    marginTop: vs(12),
    borderRadius: s(18),
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  row: {
    paddingHorizontal: s(14),
    paddingVertical: vs(12),
    flexDirection: "row",
    alignItems: "center",
    gap: s(12),
  },
  iconWrap: {
    width: s(36),
    height: s(36),
    borderRadius: s(12),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: vs(2),
  },
  rowTitle: {
    fontSize: vs(13),
    lineHeight: vs(18),
    fontWeight: "800",
    color: "#0F172A",
  },
  rowSub: {
    fontSize: vs(12),
    lineHeight: vs(16),
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginLeft: s(14 + 36 + 12),
  },

  logoutButton: {
    marginTop: vs(14),
    borderRadius: s(18),
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(10),
  },
  logoutText: {
    fontSize: vs(13),
    lineHeight: vs(18),
    fontWeight: "900",
    color: "#991B1B",
    letterSpacing: 0.2,
  },
});