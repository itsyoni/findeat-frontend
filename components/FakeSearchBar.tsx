import { MagnifyingGlassIcon } from "phosphor-react-native";
import { Text, TouchableOpacity } from "react-native";

type FakeSearchBarProps = {
  placeholder?: string;
  onPress: () => void;
};

export default function FakeSearchBar({
  placeholder = "Search...",
  onPress,
}: FakeSearchBarProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-5 my-4 flex-row items-center rounded-xl bg-[#F5F4F5] px-4 py-3"
    >
      <MagnifyingGlassIcon size={20} color="#9CA3AF" />
      <Text className="ml-3 text-base text-gray-400">{placeholder}</Text>
    </TouchableOpacity>
  );
}
