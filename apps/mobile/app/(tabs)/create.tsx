import Text from "@/components/common/AppText";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePostScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-8">
      <Text className="text-3xl font-bold text-black">Create</Text>

      <View className="mt-8 gap-4">
        <TouchableOpacity
          className="rounded-3xl bg-black p-6"
          onPress={() => router.push("/create/content")}
        >
          <Text className="text-xl font-bold text-white">Content post</Text>
          <Text className="mt-2 text-white/70">
            Share a photo, video, or quick food moment.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-3xl bg-[#F7D786] p-6"
          onPress={() => router.push("/create/review")}
        >
          <Text className="text-xl font-bold text-black">Review</Text>
          <Text className="mt-2 text-black/60">
            Rate the restaurant and the dishes you tried.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
