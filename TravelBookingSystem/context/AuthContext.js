import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserRole } from "../src/utils/authRole";

const AuthContext = createContext(null);

const AUTH_ACCESS_TOKEN_KEY = "auth_access_token";
const AUTH_USER_KEY = "auth_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("guest");
  const [authLoading, setAuthLoading] = useState(true);

  const isLoggedIn = Boolean(token && user);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  const bootstrapAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_ACCESS_TOKEN_KEY),
        AsyncStorage.getItem(AUTH_USER_KEY),
      ]);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setRole(getUserRole(userData));
      }
    } catch (e) {
      console.error("Auth bootstrap error:", e);
    } finally {
      setAuthLoading(false);
    }
  };

  const setAuthData = async ({ accessToken, userInfo }) => {
    try {
      setToken(accessToken);
      setUser(userInfo);
      setRole(getUserRole(userInfo));

      if (accessToken && userInfo) {
        await AsyncStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userInfo));
      }
    } catch (e) {
      console.error("Set auth data error:", e);
    }
  };

  const clearAuth = async () => {
    try {
      setToken(null);
      setUser(null);
      setRole("guest");
      await AsyncStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.error("Clear auth error:", e);
    }
  };

  const value = {
    token,
    user,
    role,
    isLoggedIn,
    authLoading,
    setAuthLoading,
    setAuthData,
    clearAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
