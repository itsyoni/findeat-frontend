import { api } from "@/lib/api";
import { Profile } from "@/types/profile";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BusinessDashboardScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const restaurant = profile?.businessRestaurant;

  useFocusEffect(
    useCallback(() => {
      loadBusiness();
    }, []),
  );

  async function loadBusiness() {
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-bold text-black">
            No business found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-3xl font-bold text-black">Manage business</Text>

        <Text className="mt-2 text-gray-500">{restaurant.name}</Text>

        <View className="mt-6 rounded-2xl bg-[#F5F4F5] p-4">
          <Text className="text-lg font-bold text-black">Restaurant info</Text>
          <Text className="mt-2 text-gray-500">{restaurant.address}</Text>
          <Text className="mt-1 text-gray-500">{restaurant.city}</Text>
        </View>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-[#F5F4F5] p-4">
            <Text className="text-2xl font-bold text-black">
              {restaurant.menus?.length ?? 0}
            </Text>
            <Text className="mt-1 text-gray-500">Menus</Text>
          </View>

          <View className="flex-1 rounded-2xl bg-[#F5F4F5] p-4">
            <Text className="text-2xl font-bold text-black">
              {profile.postsCount ?? 0}
            </Text>
            <Text className="mt-1 text-gray-500">Posts</Text>
          </View>
        </View>

        <TouchableOpacity
          className="mt-6 rounded-2xl bg-black py-4"
          onPress={() => router.push("/business/menu")}
        >
          <Text className="text-center font-bold text-white">
            Manage menu & dishes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 rounded-2xl bg-[#F5F4F5] py-4"
          onPress={() => router.push("/business/reviews")}
        >
          <Text className="text-center font-bold text-black">View reviews</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 rounded-2xl bg-[#F5F4F5] py-4"
          onPress={() => router.push("/business/analytics")}
        >
          <Text className="text-center font-bold text-black">Analytics</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
