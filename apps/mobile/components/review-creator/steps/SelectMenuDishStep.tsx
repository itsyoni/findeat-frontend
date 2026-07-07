import { TextInput } from "@/components/common";
import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { Dish, Restaurant } from "@findeat/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  restaurant: Restaurant | null;
  onBack: () => void;
  onSelect: (dish: Dish) => void;
};

export default function SelectMenuDishStep({
  restaurant,
  onBack,
  onSelect,
}: Props) {
  const [fullRestaurant, setFullRestaurant] = useState<Restaurant | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRestaurant = useCallback(async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);

      const fullRestaurant = await api.restaurants.get(restaurant.id);
      setFullRestaurant(fullRestaurant);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  const filteredMenus = useMemo(() => {
    const menus = fullRestaurant?.menus ?? [];
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return menus;

    return menus
      .map((menu) => ({
        ...menu,
        items: menu.items.filter((dish) => {
          return (
            dish.name.toLowerCase().includes(cleanQuery) ||
            dish.description?.toLowerCase().includes(cleanQuery) ||
            dish.category?.toLowerCase().includes(cleanQuery)
          );
        }),
      }))
      .filter((menu) => menu.items.length > 0);
  }, [fullRestaurant, query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text className="font-bold text-black">← Back</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-3xl font-bold text-black">
          Choose from menu
        </Text>

        <TextInput
          className="mt-6 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
          placeholder="Search dishes..."
          value={query}
          onChangeText={setQuery}
        />

        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator />
          </View>
        )}

        {!loading && filteredMenus.length === 0 && (
          <View className="mt-10 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-8">
            <Text className="text-center font-bold text-black">
              No dishes found
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Try searching again or add the dish manually.
            </Text>
          </View>
        )}

        {!loading && (
          <View className="mt-8 gap-8">
            {filteredMenus.map((menu) => (
              <View key={menu.id}>
                <Text className="mb-3 text-xl font-bold text-black">
                  {menu.title}
                </Text>

                <View className="gap-3">
                  {menu.items.map((dish) => (
                    <TouchableOpacity
                      key={dish.id}
                      className="rounded-2xl border border-gray-200 bg-white p-3"
                      activeOpacity={0.85}
                      onPress={() => onSelect(dish)}
                    >
                      <View className="flex-row gap-3">
                        {dish.imageUrl ? (
                          <Image
                            source={{ uri: dish.imageUrl }}
                            className="h-16 w-16 rounded-xl bg-gray-100"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
                            <Text className="text-xl">🍽️</Text>
                          </View>
                        )}

                        <View className="flex-1">
                          <View className="flex-row justify-between gap-3">
                            <Text className="flex-1 font-bold text-black">
                              {dish.name}
                            </Text>

                            {dish.price != null && (
                              <Text className="font-bold text-black">
                                ₪{dish.price}
                              </Text>
                            )}
                          </View>

                          {!!dish.description && (
                            <Text
                              numberOfLines={2}
                              className="mt-1 text-sm text-gray-500"
                            >
                              {dish.description}
                            </Text>
                          )}

                          {!!dish.category && (
                            <Text className="mt-2 text-xs font-semibold text-gray-400">
                              {dish.category}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
