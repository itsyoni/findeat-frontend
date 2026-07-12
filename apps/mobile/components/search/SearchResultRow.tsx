import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import type { SearchResultItem } from "@findeat/types/search";
import { getRelationshipLabel, getSearchEntityLabel } from "@findeat/utils";
import { View } from "react-native";

type Props = {
  item: SearchResultItem;
};

export default function SearchResultRow({ item }: Props) {
  const relationshipLabel = getRelationshipLabel(item.relationship);

  return (
    <View className="flex-row items-center border-b border-gray-100 p-4">
      <Avatar uri={item.imageUrl} username={item.title} size={52} />

      <View className="ml-4 flex-1">
        <Text className="font-bold text-black dark:text-white">
          {item.title}
        </Text>

        {!!item.subtitle && (
          <Text className="mt-1 text-sm text-gray-500">{item.subtitle}</Text>
        )}

        {!!relationshipLabel && (
          <Text className="mt-1 text-xs font-semibold text-[#8A6A1F]">
            {relationshipLabel}
          </Text>
        )}
      </View>

      <Text className="text-xs font-semibold text-gray-400">
        {getSearchEntityLabel(item.type)}
      </Text>
    </View>
  );
}
