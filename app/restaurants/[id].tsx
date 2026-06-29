import Text from "@/components/AppText";
import Tabs from "@/components/Tabs";
import RestaurantHeader from "@/components/restaurants/RestaurantHeader";
import RestaurantMenuSection from "@/components/restaurants/RestaurantMenuSection";
import RestaurantPostsSection from "@/components/restaurants/RestaurantPostsSection";
import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type RestaurantTab = "CONTENT" | "REVIEWS" | "MENU";

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeTab, setActiveTab] = useState<RestaurantTab>("CONTENT");
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

  async function toggleFollow() {
    if (!restaurant?.account?.id) return;

    const wasFollowing = restaurant.isFollowing;

    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !wasFollowing,
            followersCount: wasFollowing
              ? prev.followersCount - 1
              : prev.followersCount + 1,
          }
        : prev,
    );

    try {
      if (wasFollowing) {
        await api.delete(`/users/${restaurant.account.id}/follow`);
      } else {
        await api.post(`/users/${restaurant.account.id}/follow`);
      }
    } catch (error) {
      console.error(error);

      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: wasFollowing,
              followersCount: wasFollowing
                ? prev.followersCount + 1
                : prev.followersCount - 1,
            }
          : prev,
      );
    }
  }

  async function updateRestaurantStatus(
    nextStatus: Partial<Restaurant["userRestaurant"]>,
  ) {
    if (!restaurant) return;

    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            userRestaurant: {
              id: prev.userRestaurant?.id ?? "",
              wantToTry: prev.userRestaurant?.wantToTry ?? false,
              visited: prev.userRestaurant?.visited ?? false,
              favorite: prev.userRestaurant?.favorite ?? false,
              ...nextStatus,
            },
          }
        : prev,
    );
  }

  async function markVisited() {
    if (!restaurant) return;

    await api.post(`/restaurants/${restaurant.id}/visited`);

    updateRestaurantStatus({
      visited: true,
      wantToTry: false,
    });
  }

  async function toggleFavorite() {
    if (!restaurant) return;

    const isFavorite = restaurant.userRestaurant?.favorite === true;

    if (isFavorite) {
      await api.delete(`/restaurants/${restaurant.id}/favorite`);
      updateRestaurantStatus({ favorite: false });
    } else {
      await api.post(`/restaurants/${restaurant.id}/favorite`);
      updateRestaurantStatus({
        favorite: true,
        visited: true,
        wantToTry: false,
      });
    }
  }

  async function claimRestaurant() {
    if (!restaurant) return;

    try {
      await api.post(`/restaurants/${restaurant.id}/claim`, {
        evidenceText: "Claim requested from restaurant profile",
      });

      Alert.alert(
        "Request sent",
        "Your claim request was sent. We’ll review it soon.",
      );
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not send claim request",
      );
    }
  }

  const featuredItems = useMemo(() => {
    if (!restaurant) return [];

    return restaurant.menus
      .flatMap((menu) => menu.items)
      .filter((item) => item.isFeatured);
  }, [restaurant]);

  const contentPosts = useMemo(() => {
    return restaurant?.posts.filter((post) => post.type === "CONTENT") ?? [];
  }, [restaurant]);

  const reviewPosts = useMemo(() => {
    return restaurant?.posts.filter((post) => post.type === "REVIEW") ?? [];
  }, [restaurant]);

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
      <RestaurantHeader restaurant={restaurant} onToggleFollow={toggleFollow} />
      {!restaurant.account && (
        <View className="px-6 pt-4">
          <TouchableOpacity
            onPress={claimRestaurant}
            className="rounded-2xl border border-gray-200 bg-[#F5F4F5] px-4 py-4"
          >
            <Text className="text-center font-bold text-black">
              Claim this restaurant
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              Are you the owner? Request access to manage this profile.
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="px-6 py-4">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={markVisited}
            className={`flex-1 rounded-full px-4 py-3 ${
              restaurant.userRestaurant?.visited
                ? "bg-green-600"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                restaurant.userRestaurant?.visited ? "text-white" : "text-black"
              }`}
            >
              Visited
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            className={`flex-1 rounded-full px-4 py-3 ${
              restaurant.userRestaurant?.favorite ? "bg-red-500" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center font-bold ${
                restaurant.userRestaurant?.favorite
                  ? "text-white"
                  : "text-black"
              }`}
            >
              Favorite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { label: "Content", value: "CONTENT" },
          { label: "Reviews", value: "REVIEWS" },
          { label: "Menu", value: "MENU" },
        ]}
      />

      <View className="px-6 pb-10">
        {activeTab === "CONTENT" && (
          <RestaurantPostsSection
            posts={contentPosts}
            emptyText="No content yet"
          />
        )}

        {activeTab === "REVIEWS" && (
          <RestaurantPostsSection
            posts={reviewPosts}
            emptyText="No reviews yet"
          />
        )}

        {activeTab === "MENU" && (
          <RestaurantMenuSection
            restaurant={restaurant}
            featuredItems={featuredItems}
          />
        )}
      </View>
    </ScrollView>
  );
}
