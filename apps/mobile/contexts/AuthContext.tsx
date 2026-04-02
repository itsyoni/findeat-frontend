import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";

type User = {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  bio?: string | null;
  profilePictureUrl?: string | null;
  followersCount?: number;
  followingCount?: number;
  reviewsCount?: number;
  reviews?: {
    id: string;
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
    overallRating?: number | null;
    createdAt: string;
  }[];
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (data: { token: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "accessToken";
const USER_KEY = "currentUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);

        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        const response = await api.get("/auth/me");
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
        setUser(response.data);
      } catch (error) {
        console.log("Auth restore failed:", error);

        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const signIn = async ({ token }: { token: string }) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setToken(token);

    const response = await api.get("/auth/me");

    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
    setUser(response.data);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
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
