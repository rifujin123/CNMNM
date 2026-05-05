import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AvatarButton from "./AvatarButton";
import { vs } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis from "../../configs/Apis";
export default function AppHeader({ title }) {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("auth_user");
      setUser(raw ? JSON.parse(raw) : null);
    };
    loadUser();
  }, []);

  const avatarPath = user?.avatar;
  const avatarUri = avatarPath
    ? avatarPath.startsWith("http")
      ? avatarPath
      : `${Apis.defaults.baseURL}${avatarPath.startsWith("/") ? "" : "/"}${avatarPath}`
    : null;
  const onAvatarPress = () => {
    navigation.navigate("AccountNotLoggedInScreen");
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
