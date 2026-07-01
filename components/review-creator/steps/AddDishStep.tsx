import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import { api } from "@/lib/api";
import { Dish, Restaurant } from "@/types";
import { ReviewDishDraft } from "@/types/review";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
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
  restaurant: Restaurant | null;
  onBack: () => void;
  onSave: (item: Omit<ReviewDishDraft, "id" | "order">) => void;
};

export default function AddDishStep({ restaurant, onBack, onSave }: Props) {
  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState<number>();
  const [imageUri, setImageUri] = useState<string>();
  const [rating, setRating] = useState<number>();
  const [text, setText] = useState("");
  const [fullRestaurant, setFullRestaurant] = useState<Restaurant | null>(null);
  const menuItems =
    fullRestaurant?.menus?.flatMap((menu) => menu.items ?? []) ?? [];
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [mode, setMode] = useState<"MENU" | "CUSTOM">(
    menuItems.length > 0 ? "MENU" : "CUSTOM",
  );

  useEffect(() => {
    async function loadRestaurant() {
      if (!restaurant?.id) return;

      const res = await api.get(`/restaurants/${restaurant.id}`);
      setFullRestaurant(res.data);
    }

    loadRestaurant();
  }, [restaurant?.id]);

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
    if (mode === "MENU") {
      if (!selectedDish) {
        Alert.alert("Missing dish", "Please choose a dish from the menu");
        return;
      }

      onSave({
        menuItemId: selectedDish.id,
        menuItemName: selectedDish.name,
        menuItemPrice: selectedDish.price,
        imageUri,
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
              {menuItems.length > 0 && (
                <View className="flex-row rounded-2xl bg-gray-100 p-1">
                  <TouchableOpacity
                    className={`flex-1 rounded-xl py-3 ${
                      mode === "MENU" ? "bg-white" : ""
                    }`}
                    onPress={() => setMode("MENU")}
                  >
                    <Text className="text-center font-bold text-black">
                      From menu
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 rounded-xl py-3 ${
                      mode === "CUSTOM" ? "bg-white" : ""
                    }`}
                    onPress={() => setMode("CUSTOM")}
                  >
                    <Text className="text-center font-bold text-black">
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {mode === "MENU" ? (
                <View className="gap-3">
                  {menuItems.map((dish) => {
                    const isSelected = selectedDish?.id === dish.id;

                    return (
                      <TouchableOpacity
                        key={dish.id}
                        className={`rounded-2xl border p-4 ${
                          isSelected
                            ? "border-black bg-black"
                            : "border-gray-200 bg-white"
                        }`}
                        onPress={() => setSelectedDish(dish)}
                      >
                        <View className="flex-row justify-between gap-3">
                          <View className="flex-1">
                            <Text
                              className={`font-bold ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              {dish.name}
                            </Text>

                            {!!dish.description && (
                              <Text
                                className={`mt-1 text-sm ${
                                  isSelected ? "text-white/70" : "text-gray-500"
                                }`}
                              >
                                {dish.description}
                              </Text>
                            )}
                          </View>

                          {dish.price != null && (
                            <Text
                              className={`font-bold ${
                                isSelected ? "text-white" : "text-black"
                              }`}
                            >
                              ₪{dish.price}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <>
                  <TextInput
                    className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
                    placeholder="Dish name"
                    value={dishName}
                    onChangeText={setDishName}
                  />

                  <PriceInput label="Price" value={price} onChange={setPrice} />
                </>
              )}

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
