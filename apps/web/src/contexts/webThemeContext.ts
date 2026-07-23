import { createContext } from "react";

export type WebThemePreference = "system" | "light" | "dark";
export type ResolvedWebTheme = "light" | "dark";

export type WebThemeContextValue = {
  preference: WebThemePreference;
  resolvedTheme: ResolvedWebTheme;
  setPreference: (preference: WebThemePreference) => void;
};

export const WebThemeContext = createContext<WebThemeContextValue | null>(null);
