import { LoadingScreen } from "@/components/common";
import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { Dish } from "@findeat/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/contexts/ThemeContext";

export default function MenuItemScreen() {
  const { isDark } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api.menu
      .getDish(id)
      .then((dish) => {
        if (!cancelled) setDish(dish);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!dish) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text>Dish not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}
    >
      <ScrollView>
        {dish.imageUrl && (
          <Image
            source={{ uri: dish.imageUrl }}
            className="h-80 w-full bg-gray-100"
            resizeMode="cover"
          />
        )}

        <View className="p-6">
          <Text className="text-3xl font-bold text-black dark:text-white">
            {dish.name}
          </Text>

          {dish.price != null && (
            <Text className="mt-2 text-xl font-bold text-black dark:text-white">
              ₪{dish.price}
            </Text>
          )}

          {!!dish.category && (
            <Text className="mt-2 text-gray-500">{dish.category}</Text>
          )}

          {!!dish.description && (
            <Text className="mt-6 text-base text-gray-700 dark:text-gray-300">
              {dish.description}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
