import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "../AppText";
import TextInput from "../AppTextInput";

export type GoogleRestaurantSuggestion = {
  source: "GOOGLE";
  googlePlaceId: string;
  name: string;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type SelectedRestaurant =
  | {
      source: "FINDEAT";
      restaurant: Restaurant;
    }
  | GoogleRestaurantSuggestion;

type SearchResponse = {
  findeat: Restaurant[];
  google: GoogleRestaurantSuggestion[];
};

type Props = {
  selectedRestaurant: SelectedRestaurant | null;
  onSelect: (restaurant: SelectedRestaurant) => void;
};

export default function RestaurantSearch({
  selectedRestaurant,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [findeatRestaurants, setFindeatRestaurants] = useState<Restaurant[]>(
    [],
  );
  const [googleRestaurants, setGoogleRestaurants] = useState<
    GoogleRestaurantSuggestion[]
  >([]);

  async function searchRestaurants(text: string) {
    setQuery(text);

    if (!text.trim()) {
      setFindeatRestaurants([]);
      setGoogleRestaurants([]);
      return;
    }

    const res = await api.get<SearchResponse>(
      `/restaurants/search?q=${encodeURIComponent(text)}`,
    );

    setFindeatRestaurants(res.data.findeat ?? []);
    setGoogleRestaurants(res.data.google ?? []);
  }

  const selectedName =
    selectedRestaurant?.source === "FINDEAT"
      ? selectedRestaurant.restaurant.name
      : selectedRestaurant?.name;

  const selectedCity =
    selectedRestaurant?.source === "FINDEAT"
      ? selectedRestaurant.restaurant.city
      : selectedRestaurant?.city;

  const selectedAddress =
    selectedRestaurant?.source === "FINDEAT"
      ? selectedRestaurant.restaurant.address
      : selectedRestaurant?.address;

  if (selectedRestaurant) {
    return (
      <View className="mt-6 rounded-2xl border border-gray-200 p-4">
        <Text className="text-xs text-gray-400">Restaurant</Text>

        <Text className="mt-1 text-base font-bold text-black">
          {selectedName}
        </Text>

        {!!selectedCity && (
          <Text className="mt-1 text-gray-500">{selectedCity}</Text>
        )}

        {!!selectedAddress && (
          <Text className="mt-1 text-gray-500">{selectedAddress}</Text>
        )}

        {selectedRestaurant.source === "GOOGLE" && (
          <Text className="mt-2 text-xs text-gray-400">
            This restaurant will be added to FindEat only after publishing.
          </Text>
        )}

        <TouchableOpacity
          className="mt-3"
          onPress={() => {
            setQuery("");
            setFindeatRestaurants([]);
            setGoogleRestaurants([]);
          }}
        >
          <Text className="font-bold text-black">Change</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <TextInput
        className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Search restaurant..."
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={searchRestaurants}
      />

      {findeatRestaurants.length > 0 && (
        <Text className="mt-4 text-xs font-bold text-gray-400">FindEat</Text>
      )}

      {findeatRestaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          className="border-b border-gray-100 py-4"
          onPress={() =>
            onSelect({
              source: "FINDEAT",
              restaurant,
            })
          }
        >
          <Text className="font-bold text-black">{restaurant.name}</Text>

          {!!restaurant.city && (
            <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
          )}

          {!!restaurant.address && (
            <Text className="mt-1 text-gray-500">{restaurant.address}</Text>
          )}
        </TouchableOpacity>
      ))}

      {googleRestaurants.length > 0 && (
        <Text className="mt-4 text-xs font-bold text-gray-400">
          Google Places
        </Text>
      )}

      {googleRestaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.googlePlaceId}
          className="border-b border-gray-100 py-4"
          onPress={() => onSelect(restaurant)}
        >
          <Text className="font-bold text-black">{restaurant.name}</Text>

          {!!restaurant.address && (
            <Text className="mt-1 text-gray-500">{restaurant.address}</Text>
          )}

          <Text className="mt-1 text-xs text-gray-400">
            Will be added only after publishing
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
