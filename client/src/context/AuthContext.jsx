import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const token = localStorage.getItem("cashflowr_token");

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        return;
      }

      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("cashflowr_token");
      localStorage.removeItem("cashflowr_user");
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);

    localStorage.setItem("cashflowr_token", data.token);
    localStorage.setItem("cashflowr_user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);

    localStorage.setItem("cashflowr_token", data.token);
    localStorage.setItem("cashflowr_user", JSON.stringify(data.user));

    setUser(data.user);

    return data;
  };

  const logout = () => {
    localStorage.removeItem("cashflowr_token");
    localStorage.removeItem("cashflowr_user");
    setUser(null);
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
        isLoggedIn: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);