import Text from "@/components/common/AppText";
import { CreateReviewDraft } from "@findeat/types/review";
import * as ImagePicker from "expo-image-picker";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RatingPicker from "../components/RatingPicker";
import { TextInput } from "@/components/common";

type Props = {
  draft: CreateReviewDraft;
  onChange: (update: Partial<CreateReviewDraft>) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function CoverStep({ draft, onChange, onBack, onNext }: Props) {
  async function pickCoverImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      onChange({ coverImageUri: result.assets[0].uri });
    }
  }

  const canContinue =
    !!draft.summary.trim() &&
    !!draft.atmosphereRating &&
    !!draft.serviceRating &&
    !!draft.valueRating;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity onPress={onBack}>
          <Text className="font-bold text-black">← Back</Text>
        </TouchableOpacity>

        <Text className="mt-6 text-3xl font-bold text-black">
          Tell us about the meal
        </Text>

        <TouchableOpacity
          className="mt-6 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 py-12"
          onPress={pickCoverImage}
        >
          {draft.coverImageUri ? (
            <Image
              source={{ uri: draft.coverImageUri }}
              className="h-80 w-full rounded-3xl"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-gray-500">+ Add cover photo</Text>
          )}
        </TouchableOpacity>

        <View className="mt-8 gap-6">
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

          <TextInput
            className="min-h-36 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Tell people about your experience..."
            value={draft.summary}
            onChangeText={(summary) => onChange({ summary })}
            multiline
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`mt-8 rounded-2xl py-4 ${
            canContinue ? "bg-black" : "bg-gray-200"
          }`}
          disabled={!canContinue}
          onPress={onNext}
        >
          <Text
            className={`text-center font-bold ${
              canContinue ? "text-white" : "text-gray-400"
            }`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
