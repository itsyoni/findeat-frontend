import Text from "@/components/common/AppText";
import Tabs from "@/components/common/Tabs";
import RestaurantHeader from "@/components/restaurants/RestaurantHeader";
import RestaurantMenuSection from "@/components/restaurants/RestaurantMenuSection";
import RestaurantPostsSection from "@/components/restaurants/RestaurantPostsSection";
import { api } from "@/lib/api";
import { Restaurant } from "@findeat/types";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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

  const loadRestaurant = useCallback(async () => {
    try {
      const restaurant = await api.restaurants.get(id);
      setRestaurant(restaurant);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  async function toggleFollow() {
    if (!restaurant) return;

    const wasFollowing = restaurant.isFollowing;

    setRestaurant((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !wasFollowing,
            followersCount: prev.followersCount + (wasFollowing ? -1 : 1),
          }
        : prev,
    );

    try {
      if (wasFollowing) {
        await api.restaurants.unfollow(restaurant.id);
      } else {
        await api.restaurants.follow(restaurant.id);
      }
    } catch {
      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: wasFollowing,
              followersCount: prev.followersCount + (wasFollowing ? 1 : -1),
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

    await api.restaurants.visited(restaurant.id);

    updateRestaurantStatus({
      visited: true,
      wantToTry: false,
    });
  }

  async function toggleFavorite() {
    if (!restaurant) return;

    const isFavorite = restaurant.userRestaurant?.favorite === true;

    if (isFavorite) {
      await api.restaurants.removeFavorite(restaurant.id);
      updateRestaurantStatus({ favorite: false });
    } else {
      await api.restaurants.favorite(restaurant.id);
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
      await api.restaurants.startClaim(restaurant.id);

      setRestaurant((prev) =>
        prev
          ? {
              ...prev,
              status: "PENDING",
            }
          : prev,
      );

      Alert.alert(
        "Request sent",
        "Your request was sent. We’ll review it soon.",
      );
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not send request",
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
      {restaurant.status !== "CLAIMED" && (
        <View className="px-6 pt-4">
          <TouchableOpacity
            onPress={claimRestaurant}
            className="rounded-2xl border border-[#F7D786] bg-[#FFFBEA] px-4 py-4"
          >
            <Text className="mt-1 text-center text-sm text-gray-600">
              Request access to manage this restaurant.
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
