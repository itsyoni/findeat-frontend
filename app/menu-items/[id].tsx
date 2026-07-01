import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { Dish } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MenuItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDish();
  }, [id]);

  async function loadDish() {
    try {
      const res = await api.get(`/menu-items/${id}`);
      setDish(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Dish not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        {dish.imageUrl && (
          <Image
            source={{ uri: dish.imageUrl }}
            className="h-80 w-full bg-gray-100"
            resizeMode="cover"
          />
        )}

        <View className="p-6">
          <Text className="text-3xl font-bold text-black">{dish.name}</Text>

          {dish.price != null && (
            <Text className="mt-2 text-xl font-bold text-black">
              ₪{dish.price}
            </Text>
          )}

          {!!dish.category && (
            <Text className="mt-2 text-gray-500">{dish.category}</Text>
          )}

          {!!dish.description && (
            <Text className="mt-6 text-base text-gray-700">
              {dish.description}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
