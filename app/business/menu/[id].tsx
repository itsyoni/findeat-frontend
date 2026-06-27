import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import { api } from "@/lib/api";
import { Menu } from "@/types";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ManageMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishPrice, setDishPrice] = useState("");

  const loadMenu = useCallback(async () => {
    if (!id) return;

    try {
      const res = await api.get(`/business/menus/${id}`);
      setMenu(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  async function addDish() {
    if (!dishName.trim()) {
      Alert.alert("Missing name", "Dish name is required");
      return;
    }

    const parsedPrice = dishPrice.trim() ? Number(dishPrice) : undefined;

    if (dishPrice.trim() && Number.isNaN(parsedPrice)) {
      Alert.alert("Invalid price", "Price must be a number");
      return;
    }

    try {
      setCreating(true);

      await api.post(`/business/menus/${id}/dishes`, {
        name: dishName.trim(),
        description: dishDescription.trim() || undefined,
        price: parsedPrice,
      });

      setDishName("");
      setDishDescription("");
      setDishPrice("");

      await loadMenu();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not add dish");
    } finally {
      setCreating(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadMenu();
    }, [loadMenu]),
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!menu) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-lg font-bold text-black">Menu not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <FlatList
        data={menu.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        ListHeaderComponent={
          <View>
            <Text className="text-3xl font-bold text-black">{menu.title}</Text>

            {!!menu.description && (
              <Text className="mt-2 text-gray-500">{menu.description}</Text>
            )}

            <View className="mt-6 rounded-2xl bg-[#F5F4F5] p-4">
              <Text className="text-lg font-bold text-black">Add dish</Text>

              <TextInput
                className="mt-4 rounded-2xl bg-white px-4 py-4 text-base text-black"
                placeholder="Dish name"
                placeholderTextColor="#9CA3AF"
                value={dishName}
                onChangeText={setDishName}
              />

              <TextInput
                className="mt-3 rounded-2xl bg-white px-4 py-4 text-base text-black"
                placeholder="Price"
                placeholderTextColor="#9CA3AF"
                value={dishPrice}
                onChangeText={setDishPrice}
                keyboardType="numeric"
              />

              <TextInput
                className="mt-3 min-h-24 rounded-2xl bg-white px-4 py-4 text-base text-black"
                placeholder="Description optional"
                placeholderTextColor="#9CA3AF"
                value={dishDescription}
                onChangeText={setDishDescription}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                className="mt-4 rounded-2xl bg-black py-4"
                onPress={addDish}
                disabled={creating}
              >
                <Text className="text-center font-bold text-white">
                  {creating ? "Adding..." : "Add dish"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="mt-8 mb-4 text-xl font-bold text-black">
              Dishes
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text className="text-center text-gray-500">No dishes yet.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            className="mb-3 rounded-2xl bg-[#F5F4F5] p-4"
            onPress={() =>
              router.push({
                pathname: "/business/menu/edit-item/[id]",
                params: {
                  id: item.id,
                  name: item.name,
                  description: item.description ?? "",
                  price: item.price?.toString() ?? "",
                  imageUrl: item.imageUrl ?? "",
                  category: item.category ?? "",
                  isAvailable: item.isAvailable.toString(),
                  isFeatured: item.isFeatured.toString(),
                },
              })
            }
          >
            <View className="flex-row gap-4">
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="h-20 w-20 rounded-2xl bg-gray-200"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-2xl bg-white">
                  <Text className="text-2xl">🍽️</Text>
                </View>
              )}

              <View className="flex-1">
                <View className="flex-row justify-between gap-3">
                  <Text className="flex-1 text-lg font-bold text-black">
                    {item.name}
                  </Text>

                  {typeof item.price === "number" && (
                    <Text className="font-bold text-black">₪{item.price}</Text>
                  )}
                </View>

                {!!item.category && (
                  <Text className="mt-1 text-xs font-semibold text-gray-400">
                    {item.category}
                  </Text>
                )}

                {!!item.description && (
                  <Text className="mt-2 text-sm leading-5 text-gray-600">
                    {item.description}
                  </Text>
                )}

                {!item.isAvailable && <Text>Unavailable</Text>}
                {item.isFeatured && <Text>Featured</Text>}

                <Text className="mt-3 text-xs font-semibold text-gray-400">
                  Tap to edit
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
