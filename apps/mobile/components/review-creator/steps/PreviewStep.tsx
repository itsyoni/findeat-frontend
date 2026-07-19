import Text from "@/components/common/AppText";
import { CreateReviewDraft } from "@findeat/types/review";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView } from "@/components/common";
import DishCard from "../components/DishCard";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import PostVisibilitySelector from "@/components/posts/PostVisibilitySelector";
import type { PostVisibility } from "@findeat/types";
import PostConnectionPicker from "@/components/posts/PostConnectionPicker";
import SaveDraftButton from "@/components/posts/SaveDraftButton";

type Props = {
  draft: CreateReviewDraft;
  loading: boolean;
  onBack: () => void;
  onPublish: () => void;
  onVisibilityChange: (visibility: PostVisibility) => void;
  onLinkedPostChange: (postId?: string) => void;
  onSaveDraft: () => void;
  savingDraft?: boolean;
};

export default function PreviewStep({
  draft,
  loading,
  onBack,
  onPublish,
  onVisibilityChange,
  onLinkedPostChange,
  onSaveDraft,
  savingDraft,
}: Props) {
  const restaurantName =
    draft.restaurant?.source === "FINDEAT"
      ? draft.restaurant.restaurant.name
      : draft.restaurant?.name;

  return (
    <ThemedSafeAreaView>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onBack}>
            <Text className="font-bold text-black dark:text-white">← Back</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <SaveDraftButton onPress={onSaveDraft} saving={savingDraft} />
            <Text className="text-sm font-semibold text-gray-400">4 of 4</Text>
          </View>
        </View>

        <Text className="mt-6 text-3xl font-bold text-black dark:text-white">
          Ready to share?
        </Text>

        <Text className="mt-2 text-gray-500">
          Check your review before publishing it.
        </Text>

        {!!restaurantName && (
          <View className="mt-2 flex-row items-center">
            <Text className="text-gray-500">{restaurantName}</Text>
            <RestaurantBadge />
          </View>
        )}

        {draft.coverImageUri && (
          <Image
            source={{ uri: draft.coverImageUri }}
            className="mt-6 h-80 w-full rounded-3xl bg-gray-100"
            resizeMode="cover"
          />
        )}

        <View className="mt-6 rounded-3xl bg-gray-50 p-5 dark:bg-gray-900">
          {!!draft.overallRating && (
            <Text className="text-xl font-bold text-black dark:text-white">
              ⭐ {draft.overallRating}/10
            </Text>
          )}

          <View className="mt-4 gap-2">
            {!!draft.atmosphereRating && (
              <Text className="text-gray-700 dark:text-gray-300">
                Atmosphere: {draft.atmosphereRating}/10
              </Text>
            )}

            {!!draft.serviceRating && (
              <Text className="text-gray-700 dark:text-gray-300">
                Service: {draft.serviceRating}/10
              </Text>
            )}

            {!!draft.valueRating && (
              <Text className="text-gray-700 dark:text-gray-300">
                Value: {draft.valueRating}/10
              </Text>
            )}

            {draft.totalPrice != null && (
              <Text className="text-gray-700 dark:text-gray-300">Bill: ₪{draft.totalPrice}</Text>
            )}
          </View>

          {!!draft.summary && (
            <Text className="mt-4 text-base text-black dark:text-white">
              {draft.summary}
            </Text>
          )}
        </View>

        {draft.items.length > 0 && (
          <>
            <Text className="mt-8 text-xl font-bold text-black dark:text-white">
              What I ordered
            </Text>

            <View className="mt-4 gap-4">
              {draft.items.map((item) => (
                <DishCard key={item.id} item={item} />
              ))}
            </View>
          </>
        )}

        <PostVisibilitySelector
          value={draft.visibility}
          onChange={onVisibilityChange}
        />

        <PostConnectionPicker
          restaurantId={
            draft.restaurant?.source === "FINDEAT"
              ? draft.restaurant.restaurant.id
              : undefined
          }
          candidateType="CONTENT"
          selectedPostId={draft.linkedPostId}
          onSelect={onLinkedPostChange}
        />

        <TouchableOpacity
          className={`mt-8 rounded-2xl py-4 ${
            loading ? "bg-gray-400" : "bg-black dark:bg-white"
          }`}
          onPress={onPublish}
          disabled={loading}
        >
          <Text className="text-center font-bold text-white dark:text-black">
            {loading ? "Publishing..." : "Publish review"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}
