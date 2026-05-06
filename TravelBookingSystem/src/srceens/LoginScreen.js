import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { s, vs } from "react-native-size-matters";
import LoginTabs from "../components/LoginTabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import LoginRoleSelector from "../components/LoginRoleSelector";
import GoogleLoginCard from "../components/GoogleLoginCard";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { useAuth } from "../../context/AuthContext";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setAuthData } = useAuth();
  const [activeTab, setActiveTab] = useState("Login");
  const [selectedRole, setSelectedRole] = useState("Customer");
  const isLoginTab = activeTab === "Login";
  const isProviderRole = selectedRole === "Provider";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const AUTH_ACCESS_TOKEN_KEY = "auth_access_token";
  const AUTH_USER_KEY = "auth_user";

  const handleLoginSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formBody = new URLSearchParams({
        grant_type: "password",
        username: username.trim(),
        password: password,
        client_id: "geyWx8lpJCJIzICzeHuap5VDMCAmpBYq95VTmxHz",
        client_secret:
          "ln5SkGgxG14NvWnOCEbIEkjpdo3zK0QopUN84ris80HaJV0b3u31huVqGv0Be95oVOkUxvchUQTCl2MN8v85FNPQ95nB7yoWm6CD6nq2yV1flp05OwLp92uJteaoA4B4",
      }).toString();

      const tokenRes = await Apis.post(endpoints.login, formBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const accessToken = tokenRes?.data?.access_token;
      if (!accessToken) {
        throw new Error("Không lấy được access_token");
      }

      const meRes = await authApis(accessToken).get(endpoints.currentUser);
      const me = meRes?.data;

      await AsyncStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(me ?? {}));
      setAuthData({ accessToken, userInfo: me });

      navigation.navigate("MainTabs");
    } catch (err) {
      const message =
        err?.response?.data?.error_description ||
        err?.response?.data?.detail ||
        "Đăng nhập thất bại";
      setError(message);
      console.log("Login error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          hitSlop={8}
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{isLoginTab ? "Login" : "Register"}</Text>
      </View>
      <Text style={styles.subtitle}>
        {isLoginTab
          ? "Welcome back! Please login to your account"
          : "Create your account to start your journey"}
      </Text>
      <LoginTabs
        activeTab={activeTab}
        onTabChange={(tabName) => {
          setActiveTab(tabName);
          if (tabName === "Login") {
            setSelectedRole("Customer");
          }
        }}
      />
      {!isLoginTab && (
        <LoginRoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {!isLoginTab && (
        <View>
          <TextInput style={styles.input} placeholder="Confirm Password" />
          {isProviderRole && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Business name (Provider)"
              />
              <TextInput
                style={styles.input}
                placeholder="Tax code (Provider)"
              />
            </>
          )}
        </View>
      )}
      <View style={styles.hyperlinkContainer}>
        {isLoginTab ? (
          <TouchableOpacity
            onPress={() => {
              setActiveTab("Register");
              setSelectedRole("Provider");
            }}
          >
            <Text style={styles.forgotPassword}>Wanna be our provider?</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={() => {
            if (isLoginTab) {
              return;
            }
            setActiveTab("Login");
            setSelectedRole("Customer");
          }}
        >
          <Text style={styles.forgotPassword}>
            {isLoginTab ? "Forgot Password?" : "Already have an account?"}
          </Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLoginSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : isLoginTab ? "Login" : "Register"}
        </Text>
      </TouchableOpacity>
      <GoogleLoginCard />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(50),
    paddingHorizontal: s(16),
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: vs(12),
  },
  closeButton: {
    marginRight: s(8),
  },
  title: {
    fontSize: vs(16),
    fontWeight: "bold",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: vs(12),
    color: "#64748B",
    marginBottom: vs(12),
  },
  input: {
    height: vs(42),
    backgroundColor: "#FFFFFF",
    borderWidth: s(1),
    borderColor: "#E2E8F0",
    borderRadius: s(10),
    paddingHorizontal: s(16),
    marginTop: vs(8),
  },
  forgotPassword: {
    fontSize: vs(10),
    color: "#2563EB",
    marginTop: vs(4),
  },
  hyperlinkContainer: {
    marginTop: vs(8),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: s(10),
    padding: s(12),
    marginTop: vs(12),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: vs(14),
    fontWeight: "bold",
    textAlign: "center",
  },
  error: {
    marginTop: vs(8),
    color: "#DC2626",
    fontSize: vs(11),
  },
});
