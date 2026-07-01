import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import { ReviewDishDraft } from "@/types/review";
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
import { SafeAreaView } from "react-native-safe-area-context";
import PriceInput from "../components/PriceInput";
import RatingPicker from "../components/RatingPicker";

type Props = {
  onBack: () => void;
  onSave: (item: Omit<ReviewDishDraft, "id" | "order">) => void;
};

export default function AddDishStep({ onBack, onSave }: Props) {
  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState<number>();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
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
              <Text className="font-bold text-black">← Back</Text>
            </TouchableOpacity>

            <Text className="mt-6 text-3xl font-bold text-black">Add dish</Text>

            <TouchableOpacity
              className="mt-6 items-center justify-center rounded-3xl border border-gray-200 bg-gray-50 py-12"
              onPress={pickImage}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className="h-72 w-full rounded-3xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-gray-500">+ Add dish photo</Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 gap-6">
              <TextInput
                className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
                placeholder="Dish name"
                value={dishName}
                onChangeText={setDishName}
              />

              <PriceInput label="Price" value={price} onChange={setPrice} />

              <RatingPicker
                label="How was it?"
                value={rating}
                onChange={setRating}
              />

              <TextInput
                className="min-h-36 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
                placeholder="Tell people about this dish..."
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              className="mt-8 rounded-2xl bg-black py-4"
              onPress={handleSave}
            >
              <Text className="text-center font-bold text-white">
                Save dish
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
