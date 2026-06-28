import SearchBar from "@/components/SearchBar";
import { ReactNode, useMemo, useState } from "react";
import { FlatList, TouchableOpacity } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import Text from "../AppText";

type Props<T> = {
  data: T[];
  onCancel: () => void;
  onSelect: (item: T) => void;
  searchFn: (query: string, item: T) => boolean;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  placeholder?: string;
  emptyText?: string;
};

export default function SearchResultsView<T>({
  data,
  onCancel,
  onSelect,
  searchFn,
  keyExtractor,
  renderItem,
  placeholder = "Search",
  emptyText = "No results found",
}: Props<T>) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return data.filter((item) => searchFn(query, item));
  }, [query, data, searchFn]);

  return (
    <>
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(120)}
        className="flex-row items-center"
      >
        <Animated.View layout={LinearTransition.springify()} className="flex-1">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={placeholder}
            autoFocus
          />
        </Animated.View>

        <TouchableOpacity className="pr-5" onPress={onCancel}>
          <Text className="font-semibold text-black">Cancel</Text>
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query.trim() ? (
            <Text className="mt-8 text-center text-gray-500">{emptyText}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            {renderItem(item)}
          </TouchableOpacity>
        )}
      />
    </>
  );
}
