import {
  Image,
  ScrollView,
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
import OAuthConfig from "../config/OAuthConfig";
import { pickSingleImage } from "../utils/pickImage";

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setAuthData } = useAuth();
  const [activeTab, setActiveTab] = useState("Login");
  const [selectedRole, setSelectedRole] = useState("Customer");
  const isLoginTab = activeTab === "Login";
  const isProviderRole = selectedRole === "Provider";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [businessLicense, setBusinessLicense] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const AUTH_ACCESS_TOKEN_KEY = "auth_access_token";
  const AUTH_USER_KEY = "auth_user";

  const pickBusinessLicense = async () => {
    try {
      const image = await pickSingleImage();
      if (!image) return;

      setBusinessLicense({
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      });
    } catch (err) {
      setError("Photo library permission required");
    }
  };

  const handleLoginSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }

    if (!OAuthConfig.clientId || !OAuthConfig.clientSecret) {
      setError("OAuth configuration is missing. Please contact admin.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formBody = new URLSearchParams({
        grant_type: "password",
        username: username.trim(),
        password: password,
        client_id: OAuthConfig.clientId,
        client_secret: OAuthConfig.clientSecret,
      }).toString();

      const tokenRes = await Apis.post(endpoints.login, formBody, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const accessToken = tokenRes?.data?.access_token;
      if (!accessToken) {
        throw new Error("Failed to get access_token");
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
        "Login failed";
      setError(message);
      console.log("Login error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      if (!username.trim() || !password.trim() || !email.trim()) {
        setError("Please fill in all required fields");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      if (isProviderRole && (!businessName.trim() || !taxCode.trim())) {
        setError("Please fill in all required fields");
        return;
      }

      let res;

      if (isProviderRole) {
        if (!businessLicense) {
          setError("Provider cần upload business license trước khi đăng ký.");
          return;
        }

        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("email", email.trim());
        formData.append("password", password);
        formData.append("is_provider", "true");
        formData.append("is_customer", "false");
        formData.append("provider_business_name", businessName.trim());
        formData.append("provider_tax_code", taxCode.trim());
        formData.append("business_license", businessLicense);

        res = await Apis.post(endpoints.register, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          username: username.trim(),
          email: email.trim(),
          password: password,
          is_provider: false,
          is_customer: true,
        };
        res = await Apis.post(endpoints.register, payload);
      }

      setActiveTab("Login");
      setSelectedRole("Customer");

      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setBusinessName("");
      setTaxCode("");
      setBusinessLicense(null);

      setError("Đăng ký thành công. Vui lòng đăng nhập.");
      console.log("Register success:", res?.data);
    } catch (err) {
      const data = err?.response?.data;
      const message =
        data?.detail ||
        data?.email?.[0] ||
        data?.username?.[0] ||
        data?.password?.[0] ||
        data?.provider_business_name?.[0] ||
        data?.provider_tax_code?.[0] ||
        data?.business_license?.[0] ||
        "Đăng ký thất bại";
      setError(message);
      console.log("Register error:", data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {isProviderRole && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Business name (Provider)"
                value={businessName}
                onChangeText={setBusinessName}
              />
              <TextInput
                style={styles.input}
                placeholder="Tax code (Provider)"
                value={taxCode}
                onChangeText={setTaxCode}
              />

              {/* Upload license button + preview */}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickBusinessLicense}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-upload-outline" size={22} color="#0F172A" />
                <Text style={styles.uploadButtonText}>
                  {businessLicense ? "Change License" : "Upload Business License"}
                </Text>
              </TouchableOpacity>

              {businessLicense && (
                <View style={styles.licensePreview}>
                  <Image
                    source={{ uri: businessLicense.uri }}
                    style={styles.licenseImage}
                  />
                  <Text style={styles.licenseFileName} numberOfLines={1}>
                    {businessLicense.name}
                  </Text>
                </View>
              )}
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
        onPress={isLoginTab ? handleLoginSubmit : handleRegisterSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {isLoginTab ? "Login" : "Register"}
        </Text>
      </TouchableOpacity>
      <GoogleLoginCard />
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingTop: vs(50),
    paddingHorizontal: s(16),
    paddingBottom: vs(24),
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
    uploadButton: {
    marginTop: vs(10),
    borderWidth: s(1),
    borderColor: "#93C5FD",
    borderStyle: "dashed",
    borderRadius: s(10),
    paddingVertical: vs(10),
    alignItems: "center",
    backgroundColor: "#EFF6FF",
  },
  uploadButtonText: {
    color: "#1D4ED8",
    fontSize: vs(11),
    fontWeight: "600",
  },
  licensePreview: {
    marginTop: vs(8),
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
    backgroundColor: "#F8FAFC",
    borderRadius: s(10),
    padding: s(8),
  },
  licenseImage: {
    width: s(44),
    height: s(44),
    borderRadius: s(8),
    backgroundColor: "#E2E8F0",
  },
  licenseFileName: {
    flex: 1,
    color: "#334155",
    fontSize: vs(10),
  },
});
