import Text from "@/components/common/AppText";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";

export default function BusinessDashboardScreen() {
  return (
    <ThemedSafeAreaView>
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-2xl font-bold text-black">
          Business dashboard moved to web
        </Text>

        <Text className="mt-3 text-center text-gray-500">
          Restaurant management will be available from the FindEat web
          dashboard.
        </Text>

        <TouchableOpacity
          className="mt-6 rounded-2xl bg-black px-6 py-4"
          onPress={() => router.back()}
        >
          <Text className="font-bold text-white">Go back</Text>
        </TouchableOpacity>
      </View>
    </ThemedSafeAreaView>
  );
}
