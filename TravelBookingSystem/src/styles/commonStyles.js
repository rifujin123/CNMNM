import { StyleSheet } from "react-native";
import { s, vs } from "react-native-size-matters";

export const commonStyles = StyleSheet.create({
  tabScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  formSafe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  formContainer: {
    padding: s(16),
    paddingBottom: vs(28),
  },
  formTitle: {
    fontSize: vs(20),
    fontWeight: "700",
    color: "#0F172A",
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
  formButton: {
    height: vs(44),
    borderRadius: s(10),
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  formButtonText: {
    color: "#FFFFFF",
    fontSize: vs(13),
    fontWeight: "700",
  },
  errorText: {
    color: "#DC2626",
    fontSize: vs(11),
  },
  successText: {
    color: "#16A34A",
    fontSize: vs(11),
  },
  disabled: {
    opacity: 0.7,
  },
});