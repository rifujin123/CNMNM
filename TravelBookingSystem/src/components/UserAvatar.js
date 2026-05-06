import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { s } from "react-native-size-matters";
import Apis from "../../configs/Apis";

const UserAvatar = ({ avatarUri }) => {
  const avatarPath = avatarUri
    ? avatarUri.startsWith("http")
      ? avatarUri
      : `${Apis.defaults.baseURL}${avatarUri.startsWith("/") ? "" : "/"}${avatarUri}`
    : null;
  return (
    <Image
      source={{
        uri: avatarPath,
      }}
      style={styles.avatar}
    />
  );
};

export default UserAvatar;

const styles = StyleSheet.create({
  avatar: {
    height: s(48),
    width: s(48),
    borderRadius: s(24),
  },
});
