import { MagnifyingGlassIcon } from "phosphor-react-native";
import { TextInput, View } from "react-native";

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
    <View className="mx-5 my-4 flex-row items-center rounded-xl bg-[#F5F4F5] px-4 py-3">
      <MagnifyingGlassIcon size={20} color="#9CA3AF" />

      <TextInput
        className="ml-3 flex-1 text-base text-black"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
      />
    </View>
  );
}
