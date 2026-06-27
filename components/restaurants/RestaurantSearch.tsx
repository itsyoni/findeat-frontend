import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Text from "../AppText";
import TextInput from "../AppTextInput";

type Props = {
  selectedRestaurant: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
};

export default function RestaurantSearch({
  selectedRestaurant,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  async function searchRestaurants(text: string) {
    setQuery(text);

    if (!text.trim()) {
      setRestaurants([]);
      return;
    }

    const res = await api.get(`/restaurants/search?q=${text}`);
    setRestaurants(res.data);
  }

  if (selectedRestaurant) {
    return (
      <View className="mt-6 rounded-2xl border border-gray-200 p-4">
        <Text className="text-xs text-gray-400">Restaurant</Text>
        <Text className="mt-1 text-base font-bold text-black">
          {selectedRestaurant.name}
        </Text>

        {!!selectedRestaurant.city && (
          <Text className="mt-1 text-gray-500">{selectedRestaurant.city}</Text>
        )}

        <TouchableOpacity
          className="mt-3"
          onPress={() => {
            setQuery("");
            setRestaurants([]);
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

      {restaurants.map((restaurant) => (
        <TouchableOpacity
          key={restaurant.id}
          className="border-b border-gray-100 py-4"
          onPress={() => onSelect(restaurant)}
        >
          <Text className="font-bold text-black">{restaurant.name}</Text>
          {!!restaurant.city && (
            <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
