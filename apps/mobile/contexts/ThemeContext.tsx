import { THEME_KEY } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import type { ThemePreference } from "@findeat/types";

type ThemeContextValue = {
  preference: ThemePreference;
  colorScheme: "light" | "dark";
  isDark: boolean;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyPreference(preference: ThemePreference) {
  Appearance.setColorScheme(
    preference === "system" ? "unspecified" : preference,
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [preference, setStoredPreference] =
    useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((storedPreference) => {
        const nextPreference: ThemePreference =
          storedPreference === "light" || storedPreference === "dark"
            ? storedPreference
            : "system";

        setStoredPreference(nextPreference);
        applyPreference(nextPreference);
      })
      .catch(console.error);
  }, []);

  async function setPreference(nextPreference: ThemePreference) {
    setStoredPreference(nextPreference);
    applyPreference(nextPreference);
    await AsyncStorage.setItem(THEME_KEY, nextPreference);
  }

  const colorScheme = systemColorScheme === "dark" ? "dark" : "light";

  return (
    <ThemeContext.Provider
      value={{
        preference,
        colorScheme,
        isDark: colorScheme === "dark",
        setPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }

  return context;
}
