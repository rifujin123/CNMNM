import React, { useState } from "react";
import {
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
import { useAuth } from "../../../context/AuthContext";
import { authApis, endpoints } from "../../../configs/Apis";

const SecurityScreen = () => {
  const { token, user, setAuthData } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data;
    return (
      data?.detail ||
      data?.username?.[0] ||
      data?.email?.[0] ||
      data?.old_password?.[0] ||
      data?.new_password?.[0] ||
      data?.non_field_errors?.[0] ||
      fallback
    );
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");

    if (!token) {
      setProfileError("You need to login first.");
      return;
    }

    if (!username.trim() || !email.trim()) {
      setProfileError("Username and email are required.");
      return;
    }

    try {
      setSavingProfile(true);
      const payload = {
        username: username.trim(),
        email: email.trim(),
      };
      const res = await authApis(token).patch(endpoints.currentUser, payload);
      const updatedUser = res?.data ?? { ...user, ...payload };
      setAuthData({ accessToken: token, userInfo: updatedUser });
      setProfileSuccess("Account updated successfully.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Failed to update account."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!token) {
      setPasswordError("You need to login first.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      await authApis(token).post(endpoints.changePassword, {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully.");
    } catch (err) {
      setPasswordError(getErrorMessage(err, "Failed to change password."));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.formSafe}>
      <ScrollView contentContainerStyle={commonStyles.formContainer} showsVerticalScrollIndicator={false}>
        <Text style={[commonStyles.formTitle, styles.title]}>Security</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Text style={commonStyles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            style={commonStyles.input}
          />

          <Text style={commonStyles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={commonStyles.input}
          />

          <TouchableOpacity
            style={[commonStyles.formButton, styles.button, savingProfile && commonStyles.disabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.formButtonText}>{savingProfile ? "Saving..." : "Save account"}</Text>
          </TouchableOpacity>
          {!!profileError && <Text style={[commonStyles.errorText, styles.errorText]}>{profileError}</Text>}
          {!!profileSuccess && <Text style={[commonStyles.successText, styles.successText]}>{profileSuccess}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>

          <Text style={commonStyles.label}>Current password</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Current password"
            secureTextEntry
            style={commonStyles.input}
          />

          <Text style={commonStyles.label}>New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            style={commonStyles.input}
          />

          <Text style={commonStyles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            style={commonStyles.input}
          />

          <TouchableOpacity
            style={[commonStyles.formButton, styles.button, savingPassword && commonStyles.disabled]}
            onPress={handleChangePassword}
            disabled={savingPassword}
            activeOpacity={0.85}
          >
            <Text style={commonStyles.formButtonText}>
              {savingPassword ? "Changing..." : "Change password"}
            </Text>
          </TouchableOpacity>
          {!!passwordError && <Text style={[commonStyles.errorText, styles.errorText]}>{passwordError}</Text>}
          {!!passwordSuccess && <Text style={[commonStyles.successText, styles.successText]}>{passwordSuccess}</Text>}
        </View>

        {/* Removed global error/success */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: vs(20),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: vs(20),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: vs(14),
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: vs(12),
  },
  button: {
    marginTop: vs(2),
  },
  errorText: {
    marginTop: vs(2),
  },
  successText: {
    marginTop: vs(2),
  },
});
