import { LoadingScreen } from "@/components/common";
import Avatar from "@/components/common/Avatar";
import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { Dish } from "@findeat/types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  CaretLeftIcon,
  ForkKnifeIcon,
  StarIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DishDetails = Dish & {
  restaurant?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    city?: string | null;
  };
  menu?: { id: string; title: string } | null;
  reviewItems?: {
    id: string;
    rating?: number | null;
    text?: string | null;
    reviewPost?: {
      post?: {
        author?: {
          id: string;
          username: string;
          avatarUrl?: string | null;
        };
      };
    };
  }[];
};

export default function MenuItemScreen() {
  const { isDark } = useAppTheme();
  const { t } = useTranslation("restaurants");
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dish, setDish] = useState<DishDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.menu
      .getDish(id)
      .then((nextDish) => {
        if (!cancelled) setDish(nextDish as DishDetails);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const ratingSummary = useMemo(() => {
    const ratings =
      dish?.reviewItems
        ?.map((review) => review.rating)
        .filter((rating): rating is number => typeof rating === "number") ?? [];
    if (!ratings.length) return null;
    return {
      average: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      count: ratings.length,
    };
  }, [dish?.reviewItems]);

  if (loading) return <LoadingScreen />;

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
          <ForkKnifeIcon size={28} color={isDark ? "#FFF" : "#111"} />
        </View>
        <Text className="mt-4 text-xl font-bold text-black dark:text-white">
          {t("dishNotFound")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 rounded-full bg-black px-5 py-3 dark:bg-white">
          <Text className="font-bold text-white dark:text-black">{t("goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? "#000" : "#FFF" }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            className="h-80 w-full bg-gray-100 dark:bg-gray-900"
            resizeMode="cover"
          />
        ) : (
          <View className="h-72 w-full items-center justify-center bg-amber-50 dark:bg-gray-900">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-gray-800">
              <ForkKnifeIcon
                size={40}
                color={isDark ? "#D1D5DB" : "#9A6B42"}
                weight="fill"
              />
            </View>
          </View>
        )}

        <View className="-mt-7 min-h-[430px] rounded-t-[30px] bg-white px-6 pb-14 pt-7 dark:bg-black">
          <View className="flex-row items-start justify-between gap-5">
            <Text className="min-w-0 flex-1 text-3xl font-bold leading-9 text-black dark:text-white">
              {dish.name}
            </Text>
            {dish.price != null && (
              <Text className="text-2xl font-bold text-black dark:text-white">
                ₪{dish.price}
              </Text>
            )}
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View
              className={`rounded-full px-3 py-1.5 ${
                dish.isAvailable
                  ? "bg-emerald-100 dark:bg-emerald-950"
                  : "bg-gray-200 dark:bg-gray-800"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  dish.isAvailable
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {t(dish.isAvailable ? "available" : "unavailable")}
              </Text>
            </View>
            {dish.isFeatured && (
              <View className="rounded-full bg-amber-100 px-3 py-1.5 dark:bg-amber-950">
                <Text className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t("featured")}
                </Text>
              </View>
            )}
            {!!dish.category && (
              <View className="rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-900">
                <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {dish.category}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-8">
            <Text className="text-lg font-bold text-black dark:text-white">
              {t("aboutDish")}
            </Text>
            <Text className="mt-3 text-base leading-6 text-gray-600 dark:text-gray-300">
              {dish.description || t("noDishDescription")}
            </Text>
          </View>

          {ratingSummary && (
            <View className="mt-8 rounded-3xl bg-gray-50 p-5 dark:bg-gray-900">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-black dark:text-white">
                    {t("dishReviews")}
                  </Text>
                  <Text className="mt-1 text-sm text-gray-500">
                    {t("basedOnDishRatings", { count: ratingSummary.count })}
                  </Text>
                </View>
                <View className="flex-row items-center rounded-full bg-black px-3 py-2 dark:bg-white">
                  <StarIcon size={15} color={isDark ? "#000" : "#FFF"} weight="fill" />
                  <Text className="ml-1.5 font-bold text-white dark:text-black">
                    {ratingSummary.average.toFixed(1)}
                  </Text>
                </View>
              </View>

              {dish.reviewItems
                ?.filter((review) => !!review.text)
                .slice(0, 3)
                .map((review) => {
                  const author = review.reviewPost?.post?.author;
                  return (
                    <View key={review.id} className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                      <View className="flex-row items-center">
                        <Avatar uri={author?.avatarUrl} username={author?.username ?? "user"} size={28} />
                        <Text className="ml-2 flex-1 text-sm font-bold text-black dark:text-white">
                          @{author?.username ?? "user"}
                        </Text>
                        {!!review.rating && (
                          <Text className="text-sm font-bold text-black dark:text-white">
                            {review.rating}/10
                          </Text>
                        )}
                      </View>
                      <Text className="mt-2 leading-5 text-gray-600 dark:text-gray-300">
                        {review.text}
                      </Text>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={["top"]}
        pointerEvents="box-none"
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      >
        <View className="px-4 pt-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-black/45"
          >
            <CaretLeftIcon size={24} color="white" weight="bold" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
