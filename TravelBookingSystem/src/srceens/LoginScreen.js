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

const LoginScreen = () => {
  const [activeTab, setActiveTab] = useState("Login");
  const isLoginTab = activeTab === "Login";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLoginTab ? "Login" : "Register"}</Text>
      <Text style={styles.subtitle}>
        {isLoginTab
          ? "Welcome back! Please login to your account"
          : "Create your account to start your journey"}
      </Text>
      <LoginTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {!isLoginTab && (
        <View style={styles.roleRow}>
          <Text style={styles.roleText}>I am joining as</Text>
          <Text style={styles.subRoleText}>Choose your account type</Text>
        </View>
      )}

      <TextInput style={styles.input} placeholder="Email Address" />
      <TextInput style={styles.input} placeholder="Password" />
      {!isLoginTab && (
        <View>
          <TextInput style={styles.input} placeholder="Confirm Password" />
          <TextInput
            style={styles.input}
            placeholder="Business name (Provider)"
          />
          <TextInput style={styles.input} placeholder="Tax code (Provider)" />
        </View>
      )}
      <View style={styles.hyperlinkContainer}>
        {isLoginTab ? (
          <Text style={styles.forgotPassword}>Wanna be our provider?</Text>
        ) : (
          <View />
        )}
        <Text style={styles.forgotPassword}>
          {isLoginTab ? "Forgot Password?" : "Already have an account?"}
        </Text>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          {isLoginTab ? "Login" : "Register"}
        </Text>
      </TouchableOpacity>
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
  title: {
    fontSize: vs(24),
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: vs(12),
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
    marginTop: vs(8),
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: vs(14),
    fontWeight: "bold",
    textAlign: "center",
  },
  roleRow: {},
  roleText: {
    marginTop: vs(12),
    fontSize: vs(10),
    color: "#64748B",
  },
  subRoleText: {
    fontSize: vs(8),
    color: "#64748B",
  },
});
