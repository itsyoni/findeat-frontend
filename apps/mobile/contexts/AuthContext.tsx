import { LANGUAGE_KEY, TOKEN_KEY } from "@/constants/storage";
import { api } from "@/lib/api";
import { applyAppLanguage } from "@/lib/appLanguage";
import type { SignupResult, User } from "@findeat/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  reactivate: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    username: string,
    password: string,
  ) => Promise<SignupResult>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

function toAppLanguage(language?: User["language"]) {
  return language === "HE" ? "he" : "en";
}

async function syncLanguage(user: User) {
  const appLanguage = toAppLanguage(user.language);
  await applyAppLanguage(appLanguage);
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function establishSession(session: {
    accessToken: string;
    user: User;
  }) {
    await AsyncStorage.setItem(TOKEN_KEY, session.accessToken);
    await syncLanguage(session.user);

    queryClient.clear();

    setToken(session.accessToken);
    setUser(session.user);
  }

  const loadUser = useCallback(async () => {
    try {
      const [savedToken, savedLanguage] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(LANGUAGE_KEY),
      ]);

      if (savedLanguage === "en" || savedLanguage === "he") {
        await applyAppLanguage(savedLanguage);
      }

      if (!savedToken) return;

      const user = await api.auth.me();

      await syncLanguage(user);

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
    const session = await api.auth.login({
      email,
      password,
    });
    await establishSession(session);
  }

  async function reactivate(email: string, password: string) {
    const session = await api.auth.reactivateAccount({ email, password });
    await establishSession(session);
  }

  async function signup(
    email: string,
    username: string,
    password: string,
  ) {
    return api.auth.signup({
      email,
      username,
      password,
    });
  }

  async function verifyEmail(email: string, code: string) {
    const { accessToken, user } = await api.auth.verifyEmail(email, code);

    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    await syncLanguage(user);

    queryClient.clear();

    setToken(accessToken);
    setUser(user);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);

    queryClient.clear();

    setToken(null);
    setUser(null);
  }

  async function refreshUser() {
    const user = await api.auth.me();

    await syncLanguage(user);

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
        reactivate,
        signup,
        verifyEmail,
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
