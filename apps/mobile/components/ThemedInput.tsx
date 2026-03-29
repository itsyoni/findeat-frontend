import { TextInputProps, TextInput } from "react-native";

type ThemedInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  className?: string;
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
  ...props
}: ThemedInputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      className={`rounded-full bg-white px-5 py-4 font-cabinet ${className}`}
      {...props}
    />
  );
}
