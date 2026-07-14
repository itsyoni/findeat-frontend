import Avatar from "@/components/common/Avatar";
import Text from "@/components/common/AppText";
import { SkeletonList } from "@/components/common";
import TextInput from "@/components/common/inputs/AppTextInput";
import { useAppTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import type { SelectedRestaurant } from "@findeat/types";
import {
  CaretLeftIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantBadge from "./RestaurantBadge";

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant) => void;
  onBack: () => void;
};

export default function FullPageRestaurantPicker({
  selectedRestaurant,
  onSelect,
  onBack,
}: Props) {
  const { t } = useTranslation(["create", "restaurants"]);
  const { isDark } = useAppTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedRestaurant[]>([]);
  const [searching, setSearching] = useState(false);

  async function search(text: string) {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const response = await api.restaurants.search(text);
      setResults([
        ...(response.findeat ?? []).map((restaurant) => ({
          source: "FINDEAT" as const,
          restaurant,
        })),
        ...(response.google ?? []),
      ]);
    } catch (error) {
      console.error("restaurant search failed", error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function keyFor(item: SelectedRestaurant) {
    return item.source === "FINDEAT"
      ? `findeat-${item.restaurant.id}`
      : `google-${item.googlePlaceId}`;
  }

  function isSelected(item: SelectedRestaurant) {
    if (!selectedRestaurant || selectedRestaurant.source !== item.source) {
      return false;
    }

    return item.source === "FINDEAT" && selectedRestaurant.source === "FINDEAT"
      ? item.restaurant.id === selectedRestaurant.restaurant.id
      : item.source === "GOOGLE" && selectedRestaurant.source === "GOOGLE"
        ? item.googlePlaceId === selectedRestaurant.googlePlaceId
        : false;
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
    >
      <View className="flex-row items-center px-4 py-2">
        <TouchableOpacity
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <CaretLeftIcon
            size={25}
            color={isDark ? "#FFF" : "#171717"}
            weight="bold"
          />
        </TouchableOpacity>
        <View className="ml-2 flex-1">
          <Text className="text-xl font-bold text-black dark:text-white">
            {t("create:chooseRestaurant")}
          </Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            {t("create:chooseRestaurantBody")}
          </Text>
        </View>
      </View>

      <View className="px-5 py-3">
        <TextInput
          value={query}
          onChangeText={(text) => void search(text)}
          placeholder={t("restaurants:searchRestaurant")}
          autoFocus
          autoCorrect={false}
          leftIcon={<MagnifyingGlassIcon size={20} color="#9CA3AF" />}
          rightIcon={searching ? <ActivityIndicator size="small" /> : undefined}
          className="bg-gray-50 dark:bg-gray-900"
          style={{ paddingVertical: 12 }}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={keyFor}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}
        ListEmptyComponent={
          searching ? (
            <SkeletonList />
          ) : (
            <View className="flex-1 items-center justify-center px-8 pb-24">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                <StorefrontIcon size={35} color="#9CA3AF" weight="fill" />
              </View>
              <Text className="mt-4 text-center text-gray-500">
                {query.trim()
                  ? t("create:noRestaurantsFound")
                  : t("create:searchRestaurantPrompt")}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const restaurant =
            item.source === "FINDEAT" ? item.restaurant : item;
          const logoUrl =
            item.source === "FINDEAT" ? item.restaurant.logoUrl : null;
          const selected = isSelected(item);

          return (
            <TouchableOpacity
              onPress={() => onSelect(item)}
              className={`mb-2 flex-row items-center rounded-2xl border p-3 ${
                selected
                  ? "border-[#D6A92D] bg-amber-50 dark:bg-amber-950/30"
                  : "border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
              }`}
            >
              <Avatar
                uri={logoUrl}
                username={restaurant.name}
                size={50}
                fallbackType="restaurant"
              />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-black dark:text-white">
                    {restaurant.name}
                  </Text>
                  <RestaurantBadge
                    size={14}
                    claimed={
                      item.source === "FINDEAT" &&
                      item.restaurant.status === "CLAIMED"
                    }
                  />
                </View>
                {!!(restaurant.address || restaurant.city) && (
                  <Text numberOfLines={2} className="mt-1 text-sm text-gray-500">
                    {[restaurant.address, restaurant.city]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                )}
              </View>
              {selected && (
                <CheckCircleIcon size={25} color="#D6A92D" weight="fill" />
              )}
            </TouchableOpacity>
          );
        }}
      />

    </SafeAreaView>
  );
}
