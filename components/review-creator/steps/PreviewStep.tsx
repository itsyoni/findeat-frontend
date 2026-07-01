import Text from "@/components/common/AppText";
import { CreateReviewDraft } from "@/types/review";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DishCard from "../components/DishCard";

type Props = {
  draft: CreateReviewDraft;
  loading: boolean;
  onBack: () => void;
  onPublish: () => void;
};

export default function PreviewStep({
  draft,
  loading,
  onBack,
  onPublish,
}: Props) {
  const restaurantName =
    draft.restaurant?.source === "FINDEAT"
      ? draft.restaurant.restaurant.name
      : draft.restaurant?.name;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text className="font-bold text-black">← Back</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-3xl font-bold text-black">Preview</Text>

        {!!restaurantName && (
          <Text className="mt-2 text-gray-500">📍 {restaurantName}</Text>
        )}

        {draft.coverImageUri && (
          <Image
            source={{ uri: draft.coverImageUri }}
            className="mt-6 h-80 w-full rounded-3xl bg-gray-100"
            resizeMode="cover"
          />
        )}

        <View className="mt-6 rounded-3xl border border-gray-200 p-4">
          {!!draft.overallRating && (
            <Text className="text-xl font-bold text-black">
              ⭐ {draft.overallRating}/10
            </Text>
          )}

          <View className="mt-4 gap-2">
            {!!draft.atmosphereRating && (
              <Text className="text-gray-700">
                Atmosphere: {draft.atmosphereRating}/10
              </Text>
            )}

            {!!draft.serviceRating && (
              <Text className="text-gray-700">
                Service: {draft.serviceRating}/10
              </Text>
            )}

            {!!draft.valueRating && (
              <Text className="text-gray-700">
                Value: {draft.valueRating}/10
              </Text>
            )}

            {draft.totalPrice != null && (
              <Text className="text-gray-700">Bill: ₪{draft.totalPrice}</Text>
            )}
          </View>

          {!!draft.summary && (
            <Text className="mt-4 text-base text-black">{draft.summary}</Text>
          )}
        </View>

        <Text className="mt-8 text-xl font-bold text-black">
          What I ordered
        </Text>

        <View className="mt-4 gap-4">
          {draft.items.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </View>

        <TouchableOpacity
          className={`mt-8 rounded-2xl py-4 ${
            loading ? "bg-gray-400" : "bg-black"
          }`}
          onPress={onPublish}
          disabled={loading}
        >
          <Text className="text-center font-bold text-white">
            {loading ? "Publishing..." : "Publish review"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
