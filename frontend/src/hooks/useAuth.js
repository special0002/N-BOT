import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [userName, setUserName] = useState(() => localStorage.getItem("userName"));

  const login = useCallback(async (email, password) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    
    const res = await api.post("/token", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    
    const { access_token, user_name } = res.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("userName", user_name);
    setToken(access_token);
    setUserName(user_name);
    return user_name;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken(null);
    setUserName(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
