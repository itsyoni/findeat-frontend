import { AuthContextType, User } from "@findeat/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../lib/api";

const TOKEN_KEY = "findeat_access_token";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem(TOKEN_KEY);

      if (!savedToken) return;

      const user = await api.auth.me();

      setToken(savedToken);
      setUser(user);
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function login(email: string, password: string) {
    const { accessToken, user } = await api.auth.login({
      email,
      password,
    });

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);

    setToken(accessToken);
    setUser(user);
  }

  async function signup(
    email: string,
    username: string,
    password: string,
    displayName: string,
  ) {
    const { accessToken, user } = await api.auth.signup({
      email,
      username,
      password,
      displayName,
    });

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);

    setToken(accessToken);
    setUser(user);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const user = await api.auth.me();
    setUser(user);
  }

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

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
