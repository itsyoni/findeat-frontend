import { ACCESSIBILITY_KEY } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppTextSize =
  | "system"
  | "large"
  | "larger"
  | "largest"
  | "maximum";

type AccessibilityPreferences = {
  textSize: AppTextSize;
  boldText: boolean;
  reduceMotion: boolean;
};

type AccessibilityContextValue = AccessibilityPreferences & {
  textScale: number;
  usesSystemTextSize: boolean;
  setTextSize: (value: AppTextSize) => Promise<void>;
  setBoldText: (value: boolean) => Promise<void>;
  setReduceMotion: (value: boolean) => Promise<void>;
};

const defaults: AccessibilityPreferences = {
  textSize: "system",
  boldText: false,
  reduceMotion: false,
};

// Version 2 resets the original global reduce-motion preference. The first
// implementation could leave Reanimated disabled after the setting changed.
const ACCESSIBILITY_PREFERENCES_VERSION = 2;

const textScales: Record<AppTextSize, number> = {
  system: 1,
  large: 1.15,
  larger: 1.3,
  largest: 1.5,
  maximum: 2,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<AccessibilityPreferences>(defaults);

  useEffect(() => {
    AsyncStorage.getItem(ACCESSIBILITY_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Partial<AccessibilityPreferences> & {
          version?: number;
        };
        const migratedPreferences: AccessibilityPreferences = {
          textSize:
            parsed.textSize && parsed.textSize in textScales
              ? parsed.textSize
              : defaults.textSize,
          boldText: parsed.boldText === true,
          reduceMotion:
            parsed.version === ACCESSIBILITY_PREFERENCES_VERSION &&
            parsed.reduceMotion === true,
        };
        setPreferences(migratedPreferences);

        if (parsed.version !== ACCESSIBILITY_PREFERENCES_VERSION) {
          void AsyncStorage.setItem(
            ACCESSIBILITY_KEY,
            JSON.stringify({
              ...migratedPreferences,
              version: ACCESSIBILITY_PREFERENCES_VERSION,
            }),
          );
        }
      })
      .catch(console.error);
  }, []);

  const update = useCallback(
    async (patch: Partial<AccessibilityPreferences>) => {
      const next = { ...preferences, ...patch };
      setPreferences(next);
      await AsyncStorage.setItem(
        ACCESSIBILITY_KEY,
        JSON.stringify({
          ...next,
          version: ACCESSIBILITY_PREFERENCES_VERSION,
        }),
      );
    },
    [preferences],
  );

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      textScale: textScales[preferences.textSize],
      usesSystemTextSize: preferences.textSize === "system",
      setTextSize: (textSize) => update({ textSize }),
      setBoldText: (boldText) => update({ boldText }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
    }),
    [preferences, update],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityPreferences() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibilityPreferences must be used inside AccessibilityProvider",
    );
  }
  return context;
}
