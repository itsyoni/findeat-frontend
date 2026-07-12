import type { IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { TouchableOpacity } from "react-native";
import { useAppTheme } from "@/contexts/ThemeContext";

type Variant = "primary" | "secondary" | "outline" | "ghost";

type Props = {
  icon: ComponentType<IconProps>;
  onPress?: () => void;
  size?: number;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-black dark:bg-white",
  secondary: "bg-gray-100 dark:bg-gray-800",
  outline: "border border-gray-200 bg-white dark:border-gray-700 dark:bg-black",
  ghost: "bg-transparent",
};

const iconColors: Record<Variant, string> = {
  primary: "white",
  secondary: "black",
  outline: "black",
  ghost: "black",
};

export default function IconButton({
  icon: Icon,
  onPress,
  size = 22,
  variant = "primary",
  disabled = false,
  className = "",
}: Props) {
  const { isDark } = useAppTheme();
  const iconColor =
    isDark && variant !== "primary" ? "white" : iconColors[variant];

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-full ${
        variantClasses[variant]
      } ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Icon size={size} color={iconColor} weight="bold" />
    </TouchableOpacity>
  );
}
