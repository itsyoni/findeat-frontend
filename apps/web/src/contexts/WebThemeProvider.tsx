import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  WebThemeContext,
  type ResolvedWebTheme,
  type WebThemePreference,
} from "./webThemeContext";

const STORAGE_KEY = "findeat-web-theme";

function savedPreference(): WebThemePreference {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : "system";
}

function systemTheme(): ResolvedWebTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function WebThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<WebThemePreference>(savedPreference);
  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedWebTheme>(() =>
      preference === "system" ? systemTheme() : preference,
    );

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextTheme =
        preference === "system"
          ? query.matches
            ? "dark"
            : "light"
          : preference;
      setResolvedTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
    };

    applyTheme();
    query.addEventListener("change", applyTheme);
    return () => query.removeEventListener("change", applyTheme);
  }, [preference]);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference(nextPreference: WebThemePreference) {
        localStorage.setItem(STORAGE_KEY, nextPreference);
        setPreferenceState(nextPreference);
      },
    }),
    [preference, resolvedTheme],
  );

  return (
    <WebThemeContext.Provider value={value}>
      {children}
    </WebThemeContext.Provider>
  );
}
