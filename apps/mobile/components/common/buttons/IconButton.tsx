import type { IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { TouchableOpacity } from "react-native";

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
  primary: "bg-black",
  secondary: "bg-gray-100",
  outline: "border border-gray-200 bg-white",
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
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`h-12 w-12 items-center justify-center rounded-full ${
        variantClasses[variant]
      } ${disabled ? "opacity-50" : ""} ${className}`}
    >
      <Icon size={size} color={iconColors[variant]} weight="bold" />
    </TouchableOpacity>
  );
}
