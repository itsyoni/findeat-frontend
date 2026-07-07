import Text from "@/components/common/AppText";
import type { IconProps } from "phosphor-react-native";
import type { ComponentType } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";

type Variant = "primary" | "secondary" | "outline" | "danger";

type Props = {
  title: string;
  onPress?: () => void;
  icon?: ComponentType<IconProps>;
  rightIcon?: ComponentType<IconProps>;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary: "bg-black",
  secondary: "bg-gray-100",
  outline: "border border-gray-200 bg-white",
  danger: "bg-red-500",
};

const textClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-black",
  outline: "text-black",
  danger: "text-white",
};

export default function AppButton({
  title,
  onPress,
  icon: Icon,
  rightIcon: RightIcon,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}: Props) {
  const isDisabled = disabled || loading;
  const textColor =
    variant === "primary" || variant === "danger" ? "white" : "black";

  return (
    <TouchableOpacity
      disabled={isDisabled}
      onPress={onPress}
      className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-4 ${
        variantClasses[variant]
      } ${isDisabled ? "opacity-50" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {!!Icon && <Icon size={20} color={textColor} weight="bold" />}

          <Text className={`text-center font-bold ${textClasses[variant]}`}>
            {title}
          </Text>

          {!!RightIcon && (
            <RightIcon size={20} color={textColor} weight="bold" />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
