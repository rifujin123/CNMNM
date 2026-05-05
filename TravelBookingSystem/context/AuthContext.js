import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const isLoggedIn = Boolean(token && user);

  const setAuthData = ({ accessToken, userInfo }) => {
    setToken(accessToken);
    setUser(userInfo);
  };

  const clearAuth = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isLoggedIn,
    authLoading,
    setAuthLoading,
    setAuthData,
    clearAuth,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
