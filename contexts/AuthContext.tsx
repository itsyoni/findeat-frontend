import { AuthContextType, User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const TOKEN_KEY = "findeat_access_token";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUser() {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (!savedToken) return;

      api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;

      const res = await api.get<User>("/auth/me");

      setToken(savedToken);
      setUser(res.data);
    } catch (error: any) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });

    const accessToken = res.data.accessToken;
    const user = res.data.user;

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);

    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    setToken(accessToken);
    setUser(user);
  }

  async function signup(
    email: string,
    username: string,
    password: string,
    displayName: string,
  ) {
    const res = await api.post("/auth/signup", {
      email,
      username,
      password,
      displayName,
    });

    const accessToken = res.data.accessToken;
    const user = res.data.user;

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);

    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    setToken(accessToken);
    setUser(user);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);

    delete api.defaults.headers.common.Authorization;

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const res = await api.get<User>("/auth/me");
    setUser(res.data);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
