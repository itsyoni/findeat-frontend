import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { Menu } from "@/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BusinessMenuScreen() {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<Menu[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadBusiness();
    }, []),
  );

  async function loadBusiness() {
    try {
      const res = await api.get("/business/menus");
      setMenus(res.data);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="px-5 py-4">
        <Text className="text-3xl font-bold text-black">Menu & dishes</Text>
        <Text className="mt-2 text-gray-500">
          Manage the dishes people can review.
        </Text>

        <TouchableOpacity
          className="mt-5 rounded-2xl bg-black py-4"
          onPress={() => router.push("/business/menu/create")}
        >
          <Text className="text-center font-bold text-white">
            Add menu section
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menus}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-gray-500">
            No menu sections yet.
          </Text>
        }
        renderItem={({ item }) => (
          <View className="mb-4 rounded-2xl bg-[#F5F4F5] p-4">
            <Text className="text-xl font-bold text-black">{item.title}</Text>

            {!!item.description && (
              <Text className="mt-1 text-gray-500">{item.description}</Text>
            )}

            <Text className="mt-3 text-sm text-gray-500">
              {item.items.length} dishes
            </Text>

            <TouchableOpacity
              className="mt-4 rounded-xl bg-white py-3"
              onPress={() =>
                router.push({
                  pathname: "/business/menu/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text className="text-center font-bold text-black">
                Manage dishes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="mt-3 rounded-xl bg-white py-3"
              onPress={() =>
                router.push({
                  pathname: "/business/menu/edit-section/[id]",
                  params: {
                    id: item.id,
                    title: item.title,
                    description: item.description ?? "",
                    itemsCount: item.items.length.toString(),
                  },
                })
              }
            >
              <Text className="text-center font-bold text-black">
                Edit section
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
