import { useContext } from "react";
import { WebThemeContext } from "../contexts/webThemeContext";

export function useWebTheme() {
  const context = useContext(WebThemeContext);
  if (!context) {
    throw new Error("useWebTheme must be used inside WebThemeProvider");
  }
  return context;
}
