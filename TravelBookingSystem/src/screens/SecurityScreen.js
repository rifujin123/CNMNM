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
import { useAuth } from "../../context/AuthContext";
import { authApis, endpoints } from "../../configs/Apis";

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
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Security</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, savingProfile && styles.disabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>{savingProfile ? "Saving..." : "Save account"}</Text>
          </TouchableOpacity>
          {!!profileError && <Text style={styles.errorText}>{profileError}</Text>}
          {!!profileSuccess && <Text style={styles.successText}>{profileSuccess}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>

          <Text style={styles.label}>Current password</Text>
          <TextInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Current password"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>New password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            style={[styles.button, savingPassword && styles.disabled]}
            onPress={handleChangePassword}
            disabled={savingPassword}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {savingPassword ? "Changing..." : "Change password"}
            </Text>
          </TouchableOpacity>
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          {!!passwordSuccess && <Text style={styles.successText}>{passwordSuccess}</Text>}
        </View>

        {/* Removed global error/success */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecurityScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: s(16),
    paddingBottom: vs(28),
  },
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
  label: {
    fontSize: vs(12),
    color: "#334155",
    fontWeight: "600",
    marginBottom: vs(6),
  },
  input: {
    height: vs(44),
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: s(10),
    paddingHorizontal: s(12),
    marginBottom: vs(14),
    color: "#0F172A",
  },
  button: {
    height: vs(44),
    borderRadius: s(10),
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: vs(2),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: vs(13),
    fontWeight: "700",
  },
  errorText: {
    color: "#DC2626",
    fontSize: vs(11),
    marginTop: vs(2),
  },
  successText: {
    color: "#16A34A",
    fontSize: vs(11),
    marginTop: vs(2),
  },
  disabled: {
    opacity: 0.7,
  },
});
