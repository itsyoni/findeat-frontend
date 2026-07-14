import Text from "@/components/common/AppText";
import { Dish } from "@findeat/types";
import { ReviewDishDraft } from "@findeat/types/review";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemedSafeAreaView, AppButton, TextInput } from "@/components/common";
import PriceInput from "../components/PriceInput";
import RatingPicker from "../components/RatingPicker";
import { useTranslation } from "react-i18next";

type Props = {
  selectedDish: Dish | null;
  onBack: () => void;
  onSave: (item: Omit<ReviewDishDraft, "id" | "order">) => void;
};

export default function AddDishDetailsStep({
  selectedDish,
  onBack,
  onSave,
}: Props) {
  const { t } = useTranslation("create");
  const isFromMenu = !!selectedDish;

  const [dishName, setDishName] = useState(selectedDish?.name ?? "");
  const [price, setPrice] = useState<number | undefined>(
    selectedDish?.price ?? undefined,
  );
  const [imageUri, setImageUri] = useState<string>();
  const [rating, setRating] = useState<number>();
  const [text, setText] = useState("");

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  function handleSave() {
    if (isFromMenu && selectedDish) {
      onSave({
        menuItemId: selectedDish.id,
        menuItemName: selectedDish.name,
        menuItemPrice: selectedDish.price,
        imageUri,
        fallbackImageUrl: selectedDish.imageUrl,
        rating,
        text: text.trim() || undefined,
      });

      return;
    }

    onSave({
      customDishName: dishName.trim() || undefined,
      customPrice: price,
      imageUri,
      rating,
      text: text.trim() || undefined,
    });
  }

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
            }}
          >
            <TouchableOpacity onPress={onBack}>
              <Text className="font-bold text-black dark:text-white">
                ← Back
              </Text>
            </TouchableOpacity>

            <Text className="mt-6 text-3xl font-bold text-black dark:text-white">
              {isFromMenu
                ? t("addDishTitle", { dishName: selectedDish.name })
                : t("addCustomDish")}
            </Text>

            <Text className="mt-2 leading-5 text-gray-500 dark:text-gray-400">
              {t("dishPhotoFirstHint")}
            </Text>

            <View className="mt-7 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <TouchableOpacity
                className="items-center justify-center"
                onPress={pickImage}
              >
                {imageUri ? (
                  <View className="w-full">
                    <Image
                      source={{ uri: imageUri }}
                      className="h-64 w-full"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-3 right-3 rounded-full bg-black/65 px-4 py-2">
                      <Text className="text-sm font-bold text-white">
                        {t("changePhoto")}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View className="items-center px-6 py-12">
                    <Text className="text-2xl">＋</Text>
                    <Text className="mt-2 font-bold text-black dark:text-white">
                      {t("addDishPhoto")}
                    </Text>
                    <Text className="mt-1 text-center text-sm text-gray-500">
                      {t("dishPhotoOptionalHint")}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {selectedDish?.imageUrl && (
                <View className="flex-row items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                  <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                    {imageUri
                      ? t("yourDishPhotoSelected")
                      : t("menuDishPhotoFallbackHint")}
                  </Text>
                  {imageUri && (
                    <TouchableOpacity onPress={() => setImageUri(undefined)}>
                      <Text className="font-bold text-black dark:text-white">
                        {t("useMenuPhoto")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View className="mt-7 gap-6 rounded-3xl bg-gray-50 p-5 dark:bg-gray-900">
              {!isFromMenu && (
                <TextInput
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-black dark:border-gray-700 dark:bg-black dark:text-white"
                  placeholder={t("dishNameOptional")}
                  value={dishName}
                  onChangeText={setDishName}
                />
              )}

              {isFromMenu ? (
                <View>
                  <Text className="mb-3 font-bold text-black dark:text-white">
                    {t("menuDish")}
                  </Text>
                  <View className="rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-black">
                    <Text className="text-base font-bold text-black dark:text-white">
                      {selectedDish.name}
                    </Text>
                    <Text className="mt-1 text-sm text-gray-500">
                      {price != null ? `₪${price}` : t("noPrice")}
                    </Text>
                  </View>
                </View>
              ) : (
                <PriceInput
                  label={t("priceOptional")}
                  value={price}
                  onChange={setPrice}
                />
              )}

              <RatingPicker
                label={t("dishRatingOptional")}
                value={rating}
                onChange={setRating}
              />

              <TextInput
                className="min-h-24 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base text-black dark:border-gray-700 dark:bg-black dark:text-white"
                placeholder={t("dishNoteOptional")}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
              />
            </View>

            <AppButton title={t("saveDish")} onPress={handleSave} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
