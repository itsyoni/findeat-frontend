import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { SearchResultItem } from "@/types/search";
import { View } from "react-native";

type Props = {
  item: SearchResultItem;
};

export default function SearchResultRow({ item }: Props) {
  return (
    <View className="flex-row items-center border-b border-gray-100 p-4">
      <Avatar uri={item.imageUrl} username={item.title} size={52} />

      <View className="ml-4 flex-1">
        <Text className="font-bold text-black">{item.title}</Text>

        {!!item.subtitle && (
          <Text className="mt-1 text-sm text-gray-500">{item.subtitle}</Text>
        )}

        {!!item.relationship && item.relationship !== "NONE" && (
          <Text className="mt-1 text-xs font-semibold text-[#8A6A1F]">
            {item.relationship === "FRIENDS"
              ? "Friend"
              : item.relationship === "FOLLOWING"
                ? "Following"
                : "Follows you"}
          </Text>
        )}
      </View>

      <Text className="text-xs font-semibold text-gray-400">
        {item.type === "USER" ? "User" : "Restaurant"}
      </Text>
    </View>
  );
}
