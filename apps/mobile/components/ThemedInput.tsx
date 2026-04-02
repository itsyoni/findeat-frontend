import { TextInputProps, TextInput, View } from "react-native";
import { useState, type ComponentType } from "react";
import type { SvgProps } from "react-native-svg";
import { ThemedButton } from "@/components/ThemedButton";
import EyeIcon from "@/assets/icons/EyeOutline.svg";
import EyeSlashIcon from "@/assets/icons/EyeSlashOutline.svg";

type SvgIconProps = SvgProps;

type ThemedInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
  icon?: ComponentType<SvgIconProps>;
  iconSize?: number;
  iconColor?: string;
  iconStroke?: string;
  iconStrokeWidth?: number;
};

export function ThemedInput({
  value,
  onChangeText,
  placeholder = "",
  placeholderTextColor = "#888",
  className = "",
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  secureTextEntry = false,
  icon: InputIcon,
  iconSize = 20,
  iconColor = "black",
  iconStroke = "black",
  iconStrokeWidth = 1,
  ...props
}: ThemedInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordInput = secureTextEntry;
  const actualSecureTextEntry = isPasswordInput && !isPasswordVisible;

  return (
    <View
      className={`w-full flex-row items-center rounded-lg bg-[#f5f5f5] px-5 py-5 gap-1 ${className}`}
    >
      {InputIcon && (
        <View className="mr-2">
          <InputIcon
            width={iconSize}
            height={iconSize}
            fill={iconColor}
            stroke={iconStroke}
            strokeWidth={iconStrokeWidth}
          />
        </View>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        autoCapitalize={isPasswordInput ? "none" : autoCapitalize}
        autoCorrect={isPasswordInput ? false : autoCorrect}
        secureTextEntry={actualSecureTextEntry}
        className="min-w-0 flex-1 text-black font-cabinet text-xl"
        {...props}
      />

      {isPasswordInput && (
        <ThemedButton
          onPress={() => setIsPasswordVisible((prev) => !prev)}
          className="ml-2 h-6 w-6 items-center justify-center"
        >
          {isPasswordVisible ? (
            <EyeIcon
              width={iconSize}
              height={iconSize}
              stroke={iconStroke}
              strokeWidth={iconStrokeWidth}
            />
          ) : (
            <EyeSlashIcon
              width={iconSize}
              height={iconSize}
              stroke={iconStroke}
              strokeWidth={iconStrokeWidth}
            />
          )}
        </ThemedButton>
      )}
    </View>
  );
}
