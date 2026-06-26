import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BusinessAnalyticsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="px-5 pt-6">
        <Text className="text-3xl font-bold text-black">Analytics</Text>
        <Text className="mt-2 text-gray-500">
          Track performance, engagement, and customer activity.
        </Text>

        <View className="mt-8 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-[#F5F4F5] p-4">
            <Text className="text-2xl font-bold text-black">0</Text>
            <Text className="mt-1 text-gray-500">Views</Text>
          </View>

          <View className="flex-1 rounded-2xl bg-[#F5F4F5] p-4">
            <Text className="text-2xl font-bold text-black">0</Text>
            <Text className="mt-1 text-gray-500">Reviews</Text>
          </View>
        </View>

        <View className="mt-4 rounded-2xl bg-[#F5F4F5] p-5">
          <Text className="font-bold text-black">Coming soon</Text>
          <Text className="mt-2 text-gray-500">
            Later we’ll show popular dishes, review trends, saves, map opens,
            and profile visits.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
