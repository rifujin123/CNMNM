import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AvatarButton from "./AvatarButton";
import { vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import Apis from "../../configs/Apis";
import { useAuth } from "../../context/AuthContext";

export default function AppHeader({ title }) {
  const navigation = useNavigation();
  const { user, isLoggedIn, role } = useAuth();

  const avatarPath = user?.avatar;
  const avatarUri = avatarPath
    ? avatarPath.startsWith("http")
      ? avatarPath
      : `${Apis.defaults.baseURL}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`
    : null;
  const onAvatarPress = () => {
    if (isLoggedIn) {
      if (role === "provider") {
        navigation.navigate("ProviderTabs", { screen: "Profile" });
      } else {
        navigation.navigate("AccountRoot");
      }
    } else {
      navigation.navigate("AccountNotLoggedInScreen");
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.avatar}>
        <AvatarButton onPress={onAvatarPress} avatarUri={avatarUri} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: vs(8),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: vs(16),
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    color: "#0F172A",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
