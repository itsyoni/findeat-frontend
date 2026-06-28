import { MagnifyingGlassIcon } from "phosphor-react-native";
import TextInput from "./AppTextInput";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  autoFocus = false,
}: SearchBarProps) {
  return (
    <TextInput
      className="mx-5 my-4 border-0 bg-[#F5F4F5]"
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      leftIcon={<MagnifyingGlassIcon size={20} color="#9CA3AF" />}
    />
  );
}
