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

const LoginScreen = () => {
  const [activeTab, setActiveTab] = useState("Login");
  const [selectedRole, setSelectedRole] = useState("Customer");
  const isLoginTab = activeTab === "Login";
  const isProviderRole = selectedRole === "Provider";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity hitSlop={8} style={styles.closeButton}>
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

      <TextInput style={styles.input} placeholder="Email Address" />
      <TextInput style={styles.input} placeholder="Password" />
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
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          {isLoginTab ? "Login" : "Register"}
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: vs(14),
    fontWeight: "bold",
    textAlign: "center",
  },
});
