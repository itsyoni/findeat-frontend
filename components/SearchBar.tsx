import { MagnifyingGlassIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import TextInput from "./AppTextInput";

type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
};

export default function SearchBar({
  value = "",
  onChangeText,
  placeholder = "Search...",
  autoFocus = false,
  editable = true,
  onPress,
}: SearchBarProps) {
  const input = (
    <TextInput
      editable={editable}
      className="mx-5 my-4 border-0 bg-[#F5F4F5]"
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      leftIcon={<MagnifyingGlassIcon size={20} color="#9CA3AF" />}
    />
  );

  if (!editable) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <View pointerEvents="none">{input}</View>
      </TouchableOpacity>
    );
  }

  return input;
}
