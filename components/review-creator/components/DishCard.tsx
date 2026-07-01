import Text from "@/components/common/AppText";
import { ReviewDishDraft } from "@/types/review";
import { Image, View } from "react-native";

type Props = {
  item: ReviewDishDraft;
};

export default function DishCard({ item }: Props) {
  const name = item.menuItemName ?? item.customDishName ?? "Dish";
  const price = item.customPrice;

  return (
    <View className="rounded-3xl border border-gray-200 bg-white p-4">
      {item.imageUri && (
        <Image
          source={{ uri: item.imageUri }}
          className="mb-4 h-48 w-full rounded-2xl bg-gray-100"
          resizeMode="cover"
        />
      )}

      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-lg font-bold text-black">{name}</Text>

          {!!item.rating && (
            <Text className="mt-1 text-gray-500">⭐ {item.rating}/10</Text>
          )}

          {!!item.text && (
            <Text className="mt-3 text-gray-700">{item.text}</Text>
          )}
        </View>

        {price != null && (
          <Text className="font-bold text-black">₪{price}</Text>
        )}
      </View>
    </View>
  );
}
