import Text from "@/components/common/AppText";
import { View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";

export default function BusinessReviewsScreen() {
  return (
    <ThemedSafeAreaView>
      <View className="px-5 pt-6">
        <Text className="text-3xl font-bold text-black">Reviews</Text>
        <Text className="mt-2 text-gray-500">
          See what people are saying about your restaurant.
        </Text>

        <View className="mt-8 rounded-2xl bg-[#F5F4F5] p-5">
          <Text className="text-center font-semibold text-gray-500">
            No reviews yet.
          </Text>
        </View>
      </View>
    </ThemedSafeAreaView>
  );
}
