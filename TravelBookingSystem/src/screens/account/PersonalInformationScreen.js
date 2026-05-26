import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { s, vs } from "react-native-size-matters";
import { commonStyles } from "../../styles/commonStyles";
import Ionicons from "@expo/vector-icons/Ionicons";
import { pickSingleImage } from "../../utils/pickImage";
import { useAuth } from "../../../context/AuthContext";
import Apis, { authApis, endpoints } from "../../../configs/Apis";

const PersonalInformationScreen = () => {
  const { token, user, setAuthData } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewUri = useMemo(() => {
    if (avatarFile?.uri) return avatarFile.uri;
    if (!avatar) return null;

    // BE ImageField likely returns relative media path (e.g. /media/profiles/x.jpg)
    if (avatar.startsWith("http")) return avatar;
    return `${Apis.defaults.baseURL}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
  }, [avatar, avatarFile]);

  const handlePickImage = async () => {
    setError("");
    setSuccess("");
    setIsPickingImage(true);

    try {
      const image = await pickSingleImage();
      if (!image) return;

      setAvatarFile(image);
      setAvatar(image.uri);
    } catch (err) {
      setError(err?.message || "Cannot pick image.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!token) {
      setError("You need to login first.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("first_name", firstName.trim());
      formData.append("last_name", lastName.trim());

      if (avatarFile) {
        formData.append("avatar", {
          uri: avatarFile.uri,
          name: avatarFile.fileName,
          type: avatarFile.mimeType,
        });
      }

      const res = await authApis(token).patch(endpoints.currentUser, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res?.data ?? user;
      setAuthData({ accessToken: token, userInfo: updatedUser });
      setSuccess("Profile updated successfully.");
      setAvatarFile(null); // Clear local pick state
    } catch (err) {
      const data = err?.response?.data;
      const message =
        data?.detail ||
        data?.first_name?.[0] ||
        data?.last_name?.[0] ||
        data?.avatar?.[0] ||
        "Failed to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.formSafe}>
      <ScrollView contentContainerStyle={commonStyles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={[commonStyles.formTitle, styles.title]}>Personal Information</Text>

        <View style={styles.avatarSection}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={32} color="#64748B" />
            </View>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickImage}
            disabled={isPickingImage}
            activeOpacity={0.8}
          >
            {isPickingImage ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={styles.uploadText}>Change photo</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={commonStyles.label}>First name</Text>
        <TextInput
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          style={commonStyles.input}
        />

        <Text style={commonStyles.label}>Last name</Text>
        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          style={commonStyles.input}
        />

        {!!error && <Text style={[commonStyles.errorText, styles.errorText]}>{error}</Text>}
        {!!success && <Text style={[commonStyles.successText, styles.successText]}>{success}</Text>}

        <TouchableOpacity
          style={[commonStyles.formButton, styles.saveButton, saving && commonStyles.disabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={commonStyles.formButtonText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInformationScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: vs(20),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: vs(24),
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: vs(24),
  },
  avatarImage: {
    width: s(96),
    height: s(96),
    borderRadius: s(48),
    backgroundColor: "#E2E8F0",
  },
  avatarFallback: {
    width: s(96),
    height: s(96),
    borderRadius: s(48),
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    marginTop: vs(10),
    paddingVertical: vs(6),
    paddingHorizontal: s(10),
  },
  uploadText: {
    color: "#2563EB",
    fontSize: vs(12),
    fontWeight: "600",
  },
  saveButton: {
    marginTop: vs(8),
  },
  errorText: {
    marginBottom: vs(8),
  },
  successText: {
    marginBottom: vs(8),
  },
});
