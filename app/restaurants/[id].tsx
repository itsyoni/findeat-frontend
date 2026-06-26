import Tabs from "@/components/Tabs";
import RestaurantHeader from "@/components/restaurants/RestaurantHeader";
import RestaurantMenuSection from "@/components/restaurants/RestaurantMenuSection";
import RestaurantPostsSection from "@/components/restaurants/RestaurantPostsSection";
import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

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
