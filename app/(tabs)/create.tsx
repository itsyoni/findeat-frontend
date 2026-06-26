import RestaurantSearch from "@/components/restaurants/RestaurantSearch";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { Restaurant } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type PostType = "CONTENT" | "REVIEW";

export default function CreatePostScreen() {
  const { user } = useAuth();

  const isBusiness = user?.accountType === "BUSINESS";

  const [postType, setPostType] = useState<PostType>("CONTENT");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>();
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  useEffect(() => {
    if (isBusiness) {
      setPostType("CONTENT");
      setSelectedRestaurant(null);
      setRating("");
    }
  }, [isBusiness]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleCreatePost() {
    if (!description.trim()) {
      Alert.alert("Missing text", "Please write something");
      return;
    }

    if (!isBusiness && !selectedRestaurant) {
      Alert.alert("Missing restaurant", "Please choose a restaurant");
      return;
    }

    if (postType === "REVIEW" && !rating.trim()) {
      Alert.alert("Missing rating", "Please add a rating");
      return;
    }

    if (postType === "REVIEW") {
      const numericRating = Number(rating);

      if (
        Number.isNaN(numericRating) ||
        numericRating < 1 ||
        numericRating > 10
      ) {
        Alert.alert("Invalid rating", "Rating must be between 1 and 10");
        return;
      }
    }

    try {
      setLoading(true);

      let imageUrl: string | undefined;

      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }

      await api.post("/posts", {
        type: postType,
        description: description.trim(),
        imageUrl,
        rating: postType === "REVIEW" ? Number(rating) : undefined,
        restaurantId: isBusiness ? undefined : selectedRestaurant?.id,
      });

      setDescription("");
      setRating("");
      setImageUri(undefined);
      setSelectedRestaurant(null);

      router.replace({
        pathname: "/(tabs)",
        params: { refresh: Date.now().toString() },
      });
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not create post",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 40,
          }}
        >
          <Text className="text-3xl font-bold text-black">
            {isBusiness ? "New business post" : "New Post"}
          </Text>

          {!isBusiness && (
            <View className="mt-8 flex-row rounded-2xl bg-gray-100 p-1">
              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 ${
                  postType === "CONTENT" ? "bg-white" : ""
                }`}
                onPress={() => setPostType("CONTENT")}
              >
                <Text className="text-center font-bold text-black">
                  Content
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 rounded-xl py-3 ${
                  postType === "REVIEW" ? "bg-white" : ""
                }`}
                onPress={() => setPostType("REVIEW")}
              >
                <Text className="text-center font-bold text-black">Review</Text>
              </TouchableOpacity>
            </View>
          )}

          {isBusiness && (
            <View className="mt-8 rounded-2xl bg-[#F5F4F5] p-4">
              <Text className="font-bold text-black">Official content</Text>
              <Text className="mt-1 text-gray-500">
                Share updates, new dishes, offers, events, or behind-the-scenes
                content from your restaurant.
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="mt-6 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-12"
            onPress={pickImage}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="h-80 w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500">+ Add photo</Text>
            )}
          </TouchableOpacity>

          {!isBusiness && (
            <RestaurantSearch
              selectedRestaurant={selectedRestaurant}
              onSelect={setSelectedRestaurant}
            />
          )}

          {postType === "REVIEW" && !isBusiness && (
            <TextInput
              className="mt-6 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
              placeholder="Rating 1-10"
              placeholderTextColor="#9CA3AF"
              value={rating}
              onChangeText={setRating}
              keyboardType="decimal-pad"
            />
          )}

          <TextInput
            className="mt-6 min-h-40 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder={
              isBusiness
                ? "Share an update from your restaurant..."
                : postType === "CONTENT"
                  ? "Share something..."
                  : "Write your review..."
            }
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            className="mt-6 rounded-2xl bg-black py-4"
            onPress={handleCreatePost}
            disabled={loading}
          >
            <Text className="text-center font-bold text-white">
              {loading ? "Publishing..." : "Publish"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
