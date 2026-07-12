import Text from "@/components/common/AppText";
import { Dish } from "@findeat/types";
import { ReviewDishDraft } from "@findeat/types/review";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemedSafeAreaView , AppButton, TextInput } from "@/components/common";
import PriceInput from "../components/PriceInput";
import RatingPicker from "../components/RatingPicker";

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

    if (!dishName.trim()) {
      Alert.alert("Missing dish name", "Please enter the dish name");
      return;
    }

    onSave({
      customDishName: dishName.trim(),
      customPrice: price,
      imageUri,
      rating,
      text: text.trim() || undefined,
    });
  }

  const displayedImage = imageUri;

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
              {isFromMenu ? "Rate this dish" : "Add custom dish"}
            </Text>

            {isFromMenu && (
              <Text className="mt-2 text-gray-500">
                This dish is linked to the restaurant menu.
              </Text>
            )}

            <TouchableOpacity
              className="mt-6 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 py-12"
              onPress={pickImage}
            >
              {displayedImage ? (
                <Image
                  source={{ uri: displayedImage }}
                  className="h-72 w-full rounded-3xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-500">+ Add dish photo</Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 gap-6">
              <TextInput
                className={`rounded-2xl border border-gray-200 px-4 py-4 text-base text-black ${
                  isFromMenu
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-900"
                }`}
                placeholder="Dish name"
                value={dishName}
                onChangeText={setDishName}
                editable={!isFromMenu}
              />

              {isFromMenu ? (
                <View>
                  <Text className="mb-3 font-bold text-black dark:text-white">
                    Price
                  </Text>
                  <View className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-4">
                    <Text className="text-base text-gray-500">
                      {price != null ? `₪${price}` : "No price"}
                    </Text>
                  </View>
                </View>
              ) : (
                <PriceInput label="Price" value={price} onChange={setPrice} />
              )}

              <RatingPicker
                label="How was it?"
                value={rating}
                onChange={setRating}
              />

              <TextInput
                className="min-h-36 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black dark:border-gray-700 dark:text-white"
                placeholder="Tell people about this dish..."
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
              />
            </View>

            <AppButton title="Save dish" onPress={handleSave} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
