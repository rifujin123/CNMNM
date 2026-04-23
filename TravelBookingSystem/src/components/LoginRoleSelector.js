import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { s, vs } from "react-native-size-matters";

const ACTIVE_STROKE_COLOR = "#2563EB";
const ACTIVE_TEXT_COLOR = "#1D4ED8";

const INACTIVE_STROKE_COLOR = "#CBD5E1";
const INACTIVE_TEXT_COLOR = "#334155";

const LoginRoleSelector = ({ selectedRole, onRoleChange }) => {
  const isCustomerSelected = selectedRole === "Customer";

  return (
    <View style={styles.roleRow}>
      <Text style={styles.roleText}>I am joining as</Text>
      <Text style={styles.subRoleText}>Choose your account type</Text>
      <View style={styles.roleButtonContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            styles.roleButtonSpacing,
            isCustomerSelected
              ? styles.roleButtonActive
              : styles.roleButtonInactive,
          ]}
          onPress={() => onRoleChange("Customer")}
        >
          <Text
            style={[
              styles.roleButtonText,
              isCustomerSelected
                ? styles.roleButtonTextActive
                : styles.roleButtonTextInactive,
            ]}
          >
            Customer
          </Text>
          <Text style={styles.roleSubText}>Book and manage trips</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            !isCustomerSelected
              ? styles.roleButtonActive
              : styles.roleButtonInactive,
          ]}
          onPress={() => onRoleChange("Provider")}
        >
          <Text
            style={[
              styles.roleButtonText,
              !isCustomerSelected
                ? styles.roleButtonTextActive
                : styles.roleButtonTextInactive,
            ]}
          >
            Provider
          </Text>
          <Text style={styles.roleSubText}>List and run services</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginRoleSelector;

const styles = StyleSheet.create({
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
  roleSubText: {
    fontSize: vs(8),
    color: "#64748B",
  },
  roleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: vs(12),
  },
  roleButton: {
    flex: 1,
    paddingHorizontal: s(10),
    paddingVertical: s(5),
    backgroundColor: "#FFFFFF",
    width: s(42),
    height: vs(42),
    borderRadius: s(18),
    borderColor: "#CBD5E1",
    borderWidth: s(1),
  },
  roleButtonActive: {
    borderColor: ACTIVE_STROKE_COLOR,
  },
  roleButtonInactive: {
    borderColor: INACTIVE_STROKE_COLOR,
  },
  roleButtonSpacing: {
    marginRight: s(5),
  },
  roleButtonText: {
    fontSize: vs(10),
    fontWeight: "bold",
  },
  roleButtonTextActive: {
    color: ACTIVE_TEXT_COLOR,
  },
  roleButtonTextInactive: {
    color: INACTIVE_TEXT_COLOR,
  },
});
