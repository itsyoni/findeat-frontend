import { Restaurant } from "@findeat/types";
import { Image, View } from "react-native";
import Text from "../common/AppText";

type Props = {
  item: Restaurant["menus"][number]["items"][number];
};

export default function DishCard({ item }: Props) {
  const isUnavailable = item.isAvailable === false;

  return (
    <View
      className={`mt-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 ${
        isUnavailable ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row gap-4">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-20 w-30 rounded-2xl bg-gray-100"
            resizeMode="cover"
          />
        ) : (
          <View className="h-20 w-30 items-center justify-center rounded-2xl bg-gray-100">
            <Text className="text-2xl">🍽️</Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row justify-between gap-3">
            <Text className="flex-1 font-bold text-black dark:text-white">
              {item.name}
            </Text>

            {item.price != null && (
              <Text className="font-bold text-black dark:text-white">
                ₪{item.price}
              </Text>
            )}
          </View>

          <View className="mt-2 flex-row gap-2">
            {item.isFeatured && (
              <Text className="rounded-full bg-[#F7D786] px-2 py-1 text-xs font-bold text-black">
                Featured
              </Text>
            )}

            {isUnavailable && (
              <Text className="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600">
                Unavailable
              </Text>
            )}
          </View>

          {!!item.description && (
            <Text className="mt-2 text-sm leading-5 text-gray-500">
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
