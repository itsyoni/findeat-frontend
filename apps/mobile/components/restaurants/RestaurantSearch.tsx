import Avatar from "@/components/common/Avatar";
import Text from "@/components/common/AppText";
import TextInput from "@/components/common/inputs/AppTextInput";
import { useAppTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import type {
  GoogleRestaurantSuggestion,
  Restaurant,
  SelectedRestaurant,
} from "@findeat/types";
import {
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import RestaurantBadge from "./RestaurantBadge";

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant | null) => void;
};

export default function RestaurantSearch({ selectedRestaurant, onSelect }: Props) {
  const { t } = useTranslation("restaurants");
  const { isDark } = useAppTheme();
  const [query, setQuery] = useState("");
  const [findeatRestaurants, setFindeatRestaurants] = useState<Restaurant[]>([]);
  const [googleRestaurants, setGoogleRestaurants] = useState<GoogleRestaurantSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  function clearResults() {
    setQuery("");
    setFindeatRestaurants([]);
    setGoogleRestaurants([]);
  }

  async function searchRestaurants(text: string) {
    setQuery(text);
    if (!text.trim()) {
      clearResults();
      setSearching(false);
      return;
    }

    try {
      setSearching(true);
      const results = await api.restaurants.search(text);
      setFindeatRestaurants(results.findeat ?? []);
      setGoogleRestaurants(results.google ?? []);
    } catch (error) {
      console.error("restaurant search failed", error);
      setFindeatRestaurants([]);
      setGoogleRestaurants([]);
    } finally {
      setSearching(false);
    }
  }

  function select(restaurant: SelectedRestaurant) {
    onSelect(restaurant);
    clearResults();
  }

  const hasResults = findeatRestaurants.length > 0 || googleRestaurants.length > 0;
  const resultsCount = findeatRestaurants.length + googleRestaurants.length;

  if (selectedRestaurant) {
    const restaurant = selectedRestaurant.source === "FINDEAT"
      ? selectedRestaurant.restaurant
      : selectedRestaurant;
    const logoUrl = selectedRestaurant.source === "FINDEAT"
      ? selectedRestaurant.restaurant.logoUrl
      : null;

    return (
      <View className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 dark:border-gray-700 dark:bg-gray-900">
        <View className="flex-row items-center">
          <Avatar uri={logoUrl} username={restaurant.name} size={40} fallbackType="restaurant" />
          <View className="ml-3 flex-1">
            <View className="flex-row items-center">
              <Text numberOfLines={1} className="flex-shrink font-bold text-black dark:text-white">
                {restaurant.name}
              </Text>
              <RestaurantBadge
                size={14}
                claimed={
                  selectedRestaurant.source === "FINDEAT" &&
                  selectedRestaurant.restaurant.status === "CLAIMED"
                }
              />
            </View>
            {!!(restaurant.address || restaurant.city) && (
              <Text numberOfLines={1} className="mt-1 text-sm text-gray-500">
                {[restaurant.address, restaurant.city].filter(Boolean).join(", ")}
              </Text>
            )}
          </View>
          <CheckCircleIcon size={20} color="#22C55E" weight="fill" />
          <TouchableOpacity
            onPress={() => {
              onSelect(null);
              clearResults();
            }}
            className="ml-1.5 h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800"
          >
            <XIcon size={17} color="#6B7280" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ zIndex: hasResults ? 1000 : 1, elevation: hasResults ? 20 : 0 }}>
      <TextInput
        className="rounded-xl border-gray-200 bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900"
        style={{ paddingVertical: 11, fontSize: 15 }}
        placeholder={t("searchRestaurant")}
        value={query}
        onChangeText={(text) => void searchRestaurants(text)}
        autoCorrect={false}
        leftIcon={<MagnifyingGlassIcon size={20} color="#9CA3AF" />}
        rightIcon={searching ? <ActivityIndicator size="small" /> : undefined}
      />

      {hasResults && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 56,
            height: Math.min(resultsCount * 68, 288),
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderColor: isDark ? "#374151" : "#E5E7EB",
            borderWidth: 1,
            zIndex: 1000,
            elevation: 20,
            shadowColor: "#000",
            shadowOpacity: 0.16,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
          }}
        >
          {findeatRestaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.id}
              onPress={() => select({ source: "FINDEAT", restaurant })}
              className={`flex-row items-center px-3 py-3 ${
                index < findeatRestaurants.length - 1 || googleRestaurants.length > 0
                  ? "border-b border-gray-100 dark:border-gray-800"
                  : ""
              }`}
            >
              <Avatar uri={restaurant.logoUrl} username={restaurant.name} size={43} fallbackType="restaurant" />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-black dark:text-white">{restaurant.name}</Text>
                  <RestaurantBadge size={13} status={restaurant.status} />
                </View>
                {!!(restaurant.address || restaurant.city) && (
                  <Text numberOfLines={1} className="mt-1 text-xs text-gray-500">
                    {restaurant.address ?? restaurant.city}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {googleRestaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.googlePlaceId}
              onPress={() => select(restaurant)}
              className={`flex-row items-center px-3 py-3 ${
                index < googleRestaurants.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
              }`}
            >
              <Avatar username={restaurant.name} size={43} fallbackType="restaurant" />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-black dark:text-white">{restaurant.name}</Text>
                  <RestaurantBadge size={13} claimed={false} />
                </View>
                {!!restaurant.address && (
                  <Text numberOfLines={1} className="mt-1 text-xs text-gray-500">{restaurant.address}</Text>
                )}
                <Text className="mt-1 text-[11px] text-gray-400">{t("addedAfterPublishing")}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
