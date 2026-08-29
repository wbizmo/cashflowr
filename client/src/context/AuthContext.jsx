import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cashflowr_token"));
  const [authLoading, setAuthLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("cashflowr_token");
    localStorage.removeItem("cashflowr_user");
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem("cashflowr_token", nextToken);
    localStorage.setItem("cashflowr_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      localStorage.setItem("cashflowr_user", JSON.stringify(data.user));
    } catch {
      clearSession();
    } finally {
      setAuthLoading(false);
    }
  }, [token, clearSession]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener("cashflowr:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("cashflowr:unauthorized", handleUnauthorized);
  }, [clearSession]);

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    persistSession(data.token, data.user);
    return data;
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    persistSession(data.token, data.user);
    return data;
  };

  const updateAuthUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("cashflowr_user", JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      if (token) await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        authLoading,
        register,
        login,
        logout,
        updateAuthUser,
        isLoggedIn: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
