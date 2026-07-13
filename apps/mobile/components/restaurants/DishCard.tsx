import { Restaurant } from "@findeat/types";
import { Image, TouchableOpacity, View } from "react-native";
import Text from "../common/AppText";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

type Props = {
  item: Restaurant["menus"][number]["items"][number];
  popular?: boolean;
};

export default function DishCard({ item, popular = false }: Props) {
  const { t } = useTranslation("restaurants");
  const isUnavailable = item.isAvailable === false;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({ pathname: "/menu-items/[id]", params: { id: item.id } })
      }
      className={`mt-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900 ${
        isUnavailable ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row gap-3">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-24 w-32 rounded-xl bg-gray-100 dark:bg-gray-800"
            resizeMode="cover"
          />
        ) : (
          <View className="h-24 w-32 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-800">
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

          {(item.reviewsCount ?? 0) > 0 && (
            <Text className="mt-1.5 text-xs font-semibold text-gray-500">
              ★ {item.averageRating?.toFixed(1) ?? "—"} · {t("dishReviewCount", { count: item.reviewsCount })}
            </Text>
          )}

          <View className="mt-2 flex-row flex-wrap gap-1.5">
            {item.isFeatured && (
              <Text className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {t("featured")}
              </Text>
            )}

            {popular && (
              <Text className="rounded-full bg-violet-100 px-2 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                {t("popular")}
              </Text>
            )}

            {item.isNew && (
              <Text className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {t("newDish")}
              </Text>
            )}

            {isUnavailable && (
              <Text className="rounded-full bg-gray-200 px-2 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {t("unavailable")}
              </Text>
            )}
          </View>

          {!!item.description && (
            <Text className="mt-2 text-sm leading-5 text-gray-500" numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
