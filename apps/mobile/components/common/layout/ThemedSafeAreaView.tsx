import { useAppTheme } from "@/contexts/ThemeContext";
import type { ComponentProps } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ComponentProps<typeof SafeAreaView>;

export default function ThemedSafeAreaView({ style, ...props }: Props) {
  const { isDark } = useAppTheme();

  return (
    <SafeAreaView
      {...props}
      style={[
        { flex: 1, backgroundColor: isDark ? "#000" : "#FFF" },
        style,
      ]}
    />
  );
}
