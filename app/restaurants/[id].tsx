import Avatar from "@/components/Avatar";
import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  async function loadRestaurant() {
    try {
      const res = await api.get(`/restaurants/${id}`);
      setRestaurant(res.data);
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

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {restaurant.coverUrl ? (
        <Image
          source={{ uri: restaurant.coverUrl }}
          className="h-56 w-full bg-gray-100"
          resizeMode="cover"
        />
      ) : (
        <View className="h-56 w-full bg-gray-100" />
      )}

      <View className="px-6 pb-10">
        <View className="-mt-12">
          <Avatar
            uri={restaurant.avatarUrl}
            username={restaurant.name}
            size={96}
          />
        </View>

        <Text className="mt-4 text-3xl font-bold text-black">
          {restaurant.name}
        </Text>

        {!!restaurant.account?.username && (
          <Text className="mt-1 text-gray-500">
            @{restaurant.account.username}
          </Text>
        )}

        {!!restaurant.address && (
          <Text className="mt-4 text-gray-700">📍 {restaurant.address}</Text>
        )}

        {!!restaurant.city && (
          <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
        )}

        {!!restaurant.description && (
          <Text className="mt-5 text-base leading-6 text-gray-700">
            {restaurant.description}
          </Text>
        )}

        <Text className="mt-8 text-xl font-bold text-black">Menu</Text>

        {restaurant.menus.length === 0 ? (
          <Text className="mt-2 text-gray-500">No menu yet</Text>
        ) : (
          restaurant.menus.map((menu) => (
            <View key={menu.id} className="mt-4">
              <Text className="text-lg font-bold text-black">{menu.title}</Text>

              {menu.items.map((item) => (
                <View
                  key={item.id}
                  className="mt-3 rounded-2xl border border-gray-200 p-4"
                >
                  <Text className="font-bold text-black">{item.name}</Text>

                  {!!item.description && (
                    <Text className="mt-1 text-gray-500">
                      {item.description}
                    </Text>
                  )}

                  {item.price != null && (
                    <Text className="mt-2 font-bold text-black">
                      ₪{item.price}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        <Text className="mt-8 text-xl font-bold text-black">Posts</Text>

        {restaurant.posts.length === 0 ? (
          <Text className="mt-2 text-gray-500">No posts yet</Text>
        ) : (
          restaurant.posts.map((post) => (
            <View
              key={post.id}
              className="mt-4 rounded-2xl border border-gray-200 p-4"
            >
              {!!post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  className="mb-3 h-48 w-full rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
              )}

              <Text className="font-bold text-black">
                @{post.user.username}
              </Text>

              {!!post.description && (
                <Text className="mt-2 text-gray-700">{post.description}</Text>
              )}

              {post.rating != null && (
                <Text className="mt-2 font-bold text-black">
                  ⭐ {post.rating}/10
                </Text>
              )}

              <Text className="mt-3 text-gray-400">
                ❤️ {post._count.likes} · 💬 {post._count.comments}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
