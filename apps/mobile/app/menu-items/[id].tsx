import { LoadingScreen } from "@/components/common";
import Avatar from "@/components/common/Avatar";
import Text from "@/components/common/AppText";
import { useAppTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { Dish } from "@findeat/types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon, ForkKnifeIcon, StarIcon } from "phosphor-react-native";
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
        if (!cancelled) {
          const details = nextDish as DishDetails;
          const createdAt = details.createdAt
            ? new Date(details.createdAt).getTime()
            : null;
          const isNew =
            details.isNew ??
            (createdAt != null &&
              Date.now() - createdAt <= 30 * 24 * 60 * 60 * 1000);

          setDish({ ...details, isNew });
        }
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
      average:
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      count: ratings.length,
    };
  }, [dish?.reviewItems]);

  const writtenReviews = useMemo(
    () =>
      dish?.reviewItems
        ?.filter((review) => !!review.text?.trim())
        .slice(0, 3) ?? [],
    [dish?.reviewItems],
  );

  const isNewDish = dish?.isNew === true;

  if (loading) return <LoadingScreen variant="detail" />;

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas px-6 dark:bg-black">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
          <ForkKnifeIcon size={28} color={isDark ? "#FFF" : "#111"} />
        </View>
        <Text className="mt-4 text-xl font-bold text-black dark:text-white">
          {t("dishNotFound")}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 rounded-full bg-black px-5 py-3 dark:bg-white"
        >
          <Text className="font-bold text-white dark:text-black">
            {t("goBack")}
          </Text>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: isDark ? "#000" : "#FFF",
        }}
      >
        {dish.imageUrl ? (
          <Image
            source={{ uri: dish.imageUrl }}
            className="h-96 w-full bg-gray-100 dark:bg-gray-900"
            resizeMode="cover"
          />
        ) : (
          <View className="h-96 w-full items-center justify-center bg-amber-50 dark:bg-gray-900">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white dark:bg-gray-800">
              <ForkKnifeIcon
                size={40}
                color={isDark ? "#D1D5DB" : "#9A6B42"}
                weight="fill"
              />
            </View>
          </View>
        )}

        <View className="-mt-8 min-h-[430px] rounded-t-[34px] bg-white px-5 pb-16 pt-8 dark:bg-black">
          <View className="flex-row items-start justify-between gap-5">
            <Text className="min-w-0 flex-1 text-3xl font-bold leading-9 text-black dark:text-white">
              {dish.name}
            </Text>
            {dish.price != null && (
              <View className="rounded-full bg-brand-soft px-4 py-2 dark:bg-orange-950/50">
                <Text className="text-xl font-bold text-brand dark:text-orange-300">
                  ₪{dish.price}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-5 flex-row flex-wrap gap-2">
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
            {isNewDish && (
              <View className="rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-950">
                <Text className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {t("newDish")}
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

          <View className="mt-6 flex-row items-center rounded-3xl border border-line bg-soft p-4 dark:border-gray-800 dark:bg-gray-900">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-soft dark:bg-orange-950/60">
              <StarIcon
                size={23}
                color={isDark ? "#FDBA74" : "#FF5B35"}
                weight="fill"
              />
            </View>
            <View className="ml-3 min-w-0 flex-1">
              <Text className="text-xl font-bold text-black dark:text-white">
                {ratingSummary ? ratingSummary.average.toFixed(1) : "—"}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {ratingSummary
                  ? t("basedOnDishRatings", { count: ratingSummary.count })
                  : t("noDishRatings")}
              </Text>
            </View>
            {!!dish.menu?.title && (
              <View className="max-w-32 rounded-2xl bg-white px-3 py-2 dark:bg-black">
                <Text
                  numberOfLines={2}
                  className="text-right text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  {dish.menu.title}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-5 rounded-3xl border border-line bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-soft dark:bg-gray-800">
                <ForkKnifeIcon
                  size={18}
                  color={isDark ? "#E5E7EB" : "#171717"}
                  weight="fill"
                />
              </View>
              <Text className="ml-3 text-lg font-bold text-black dark:text-white">
                {t("aboutDish")}
              </Text>
            </View>
            <Text className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
              {dish.description || t("noDishDescription")}
            </Text>
          </View>

          {writtenReviews.length > 0 && (
            <View className="mt-8">
              <Text className="text-xl font-bold text-black dark:text-white">
                {t("dishReviews")}
              </Text>
              <View className="mt-3 gap-3">
                {writtenReviews.map((review) => {
                  const author = review.reviewPost?.post?.author;

                  return (
                    <View
                      key={review.id}
                      className="rounded-3xl border border-line bg-soft p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <View className="flex-row items-center">
                        <Avatar
                          uri={author?.avatarUrl}
                          username={author?.username ?? "user"}
                          size={34}
                        />
                        <Text className="ml-3 flex-1 text-sm font-bold text-black dark:text-white">
                          @{author?.username ?? "user"}
                        </Text>
                        {!!review.rating && (
                          <View className="flex-row items-center rounded-full bg-white px-2.5 py-1.5 dark:bg-black">
                            <StarIcon
                              size={13}
                              color={isDark ? "#FDBA74" : "#FF5B35"}
                              weight="fill"
                            />
                            <Text className="ml-1 text-sm font-bold text-black dark:text-white">
                              {review.rating}/10
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="mt-3 leading-6 text-gray-600 dark:text-gray-300">
                        {review.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
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
