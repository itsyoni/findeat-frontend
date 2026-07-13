import Text from "@/components/common/AppText";
import { CreateReviewDraft } from "@findeat/types/review";
import * as ImagePicker from "expo-image-picker";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedSafeAreaView , TextInput } from "@/components/common";
import RatingPicker from "../components/RatingPicker";
import { useTranslation } from "react-i18next";

type Props = {
  draft: CreateReviewDraft;
  onChange: (update: Partial<CreateReviewDraft>) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function CoverStep({ draft, onChange, onBack, onNext }: Props) {
  const { t } = useTranslation("create");
  const restaurantName =
    draft.restaurant?.source === "FINDEAT"
      ? draft.restaurant.restaurant.name
      : draft.restaurant?.name;

  async function pickCoverImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChange({ coverImageUri: result.assets[0].uri });
    }
  }

  const canContinue = !!draft.summary.trim() && !!draft.overallRating;

  return (
    <ThemedSafeAreaView>
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
          <Text className="text-sm font-semibold text-gray-400">2 of 4</Text>
        </View>

        <Text className="mt-6 text-3xl font-bold text-black dark:text-white">
          {restaurantName
            ? t("reviewExperienceTitle", { restaurantName })
            : t("reviewExperienceTitleFallback")}
        </Text>

        <Text className="mt-2 text-gray-500">
          Give the restaurant an overall score, then add as much detail as you want.
        </Text>

        <View className="mt-8">
          <RatingPicker
            label="Overall experience"
            value={draft.overallRating}
            onChange={(overallRating) => onChange({ overallRating })}
          />
        </View>

        <TextInput
          className="mt-7 min-h-28 rounded-2xl bg-gray-100 px-4 py-4 text-base text-black dark:bg-gray-900 dark:text-white"
          placeholder="What stood out? What should people know?"
          value={draft.summary}
          onChangeText={(summary) => onChange({ summary })}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          className="mt-5 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          onPress={pickCoverImage}
        >
          {draft.coverImageUri ? (
            <Image
              source={{ uri: draft.coverImageUri }}
              className="h-52 w-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="py-7 font-semibold text-gray-500">
              + Add a meal photo (optional)
            </Text>
          )}
        </TouchableOpacity>

        <View className="mt-8 rounded-3xl bg-gray-50 p-4 dark:bg-gray-900">
          <Text className="mb-1 text-lg font-bold text-black dark:text-white">
            More detail
          </Text>
          <Text className="mb-6 text-sm text-gray-500">
            These ratings are optional.
          </Text>
          <View className="gap-7">
          <RatingPicker
            label="Atmosphere"
            value={draft.atmosphereRating}
            onChange={(atmosphereRating) => onChange({ atmosphereRating })}
          />

          <RatingPicker
            label="Service"
            value={draft.serviceRating}
            onChange={(serviceRating) => onChange({ serviceRating })}
          />

          <RatingPicker
            label="Value"
            value={draft.valueRating}
            onChange={(valueRating) => onChange({ valueRating })}
          />

          </View>
        </View>

        <TouchableOpacity
          className={`mt-8 rounded-2xl py-4 ${
            canContinue ? "bg-black dark:bg-white" : "bg-gray-200 dark:bg-gray-800"
          }`}
          disabled={!canContinue}
          onPress={onNext}
        >
          <Text
            className={`text-center font-bold ${
              canContinue ? "text-white dark:text-black" : "text-gray-400"
            }`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}
