import { TextInputProps, TextInput, View } from "react-native";
import type { ComponentType } from "react";

type SvgIconProps = {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
};

type ThemedInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
  icon?: ComponentType<SvgIconProps>;
  iconSize?: number;
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
  icon: InputIcon,
  iconSize = 20,
  ...props
}: ThemedInputProps) {
  return (
    <View
      className={`w-full flex-row items-center rounded-full bg-[#f5f5f5] px-4 py-3 ${className}`}
    >
      {InputIcon && (
        <View className="mr-2">
          <InputIcon width={iconSize} height={iconSize} fill="none" />
        </View>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        className="min-w-0 flex-1 text-black"
        {...props}
      />
    </View>
  );
}
