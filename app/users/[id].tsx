import Text from "@/components/AppText";
import { api } from "@/lib/api";
import { Profile } from "@/types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const res = await api.get(`/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function onRefresh() {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  }

  async function toggleFollow() {
    if (!user) return;

    try {
      if (user.isFollowing) {
        await api.delete(`/users/${user.id}/follow`);
      } else {
        await api.post(`/users/${user.id}/follow`);
      }

      await loadUser();
    } catch (error) {
      console.error(error);
    }
  }

  async function startChat() {
    if (!user) return;

    try {
      const res = await api.post(`/chats/start/${user.id}`);

      router.push({
        pathname: "/chats/[id]",
        params: { id: res.data.id },
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingRight: 10,
              }}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)");
                }
              }}
            >
              <CaretLeftIcon size={24} color="black" />
              <Text className="text-lg text-black">Back</Text>
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-white">
        <FlatList
          refreshing={refreshing}
          onRefresh={onRefresh}
          data={user.posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
          }}
          ListHeaderComponent={
            <View>
              {user.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="h-20 w-20 rounded-full"
                />
              ) : (
                <View className="h-20 w-20 items-center justify-center rounded-full bg-black">
                  <Text className="text-3xl font-bold text-white">
                    {user.username?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}

              <Text className="mt-5 text-3xl font-bold text-black">
                @{user.username}
              </Text>

              <Text className="mt-2 text-gray-500">{user.email}</Text>

              <View className="mt-6 flex-row">
                <View className="mr-8">
                  <Text className="text-xl font-bold">{user.posts.length}</Text>
                  <Text className="text-gray-500">Posts</Text>
                </View>

                <TouchableOpacity
                  className="mr-8"
                  onPress={() =>
                    router.push({
                      pathname: "/users/connections",
                      params: { id: user.id, type: "followers" },
                    })
                  }
                >
                  <Text className="text-xl font-bold">
                    {user.followersCount}
                  </Text>
                  <Text className="text-gray-500">Followers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/users/connections",
                      params: { id: user.id, type: "following" },
                    })
                  }
                >
                  <Text className="text-xl font-bold">
                    {user.followingCount}
                  </Text>
                  <Text className="text-gray-500">Following</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="mt-6 rounded-2xl bg-black py-4"
                onPress={toggleFollow}
              >
                <Text className="text-center font-bold text-white">
                  {user.isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-3 rounded-2xl border border-gray-200 py-4"
                onPress={startChat}
              >
                <Text className="text-center font-bold text-black">
                  Message
                </Text>
              </TouchableOpacity>

              <Text className="mt-8 mb-4 text-xl font-bold">Posts</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-4 rounded-2xl border border-gray-200 p-4">
              <Text className="text-lg font-bold">{item.title}</Text>

              {!!item.description && (
                <Text className="mt-2 text-gray-600">{item.description}</Text>
              )}
            </View>
          )}
        />
      </View>
    </>
  );
}
