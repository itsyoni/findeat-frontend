import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import RestaurantSearch, {
  SelectedRestaurant,
} from "@/components/restaurants/RestaurantSearch";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { ManagedRestaurant } from "@/types";
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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type PostType = "CONTENT" | "REVIEW";

export default function CreatePostScreen() {
  const [postType, setPostType] = useState<PostType>("CONTENT");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>();
  const [managedRestaurants, setManagedRestaurants] = useState<
    ManagedRestaurant[]
  >([]);
  const [postingAs, setPostingAs] = useState<
    { type: "USER" } | { type: "RESTAURANT"; restaurantId: string }
  >({ type: "USER" });
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<SelectedRestaurant | null>(null);

  useEffect(() => {
    loadManagedRestaurants();
  }, []);

  async function loadManagedRestaurants() {
    try {
      const res = await api.get("/restaurants/me");
      setManagedRestaurants(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function getRestaurantId() {
    if (!selectedRestaurant) return undefined;

    if (selectedRestaurant.source === "FINDEAT") {
      return selectedRestaurant.restaurant.id;
    }

    const res = await api.post("/restaurants/from-google", {
      name: selectedRestaurant.name,
      address: selectedRestaurant.address,
      city: selectedRestaurant.city,
      latitude: selectedRestaurant.latitude,
      longitude: selectedRestaurant.longitude,
      googlePlaceId: selectedRestaurant.googlePlaceId,
    });

    return res.data.id as string;
  }

  async function handleCreatePost() {
    if (!description.trim()) {
      Alert.alert("Missing text", "Please write something");
      return;
    }

    const isPostingAsRestaurant = postingAs.type === "RESTAURANT";

    if (!isPostingAsRestaurant && !selectedRestaurant) {
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

      if (postingAs.type === "RESTAURANT") {
        await api.post(`/posts/restaurants/${postingAs.restaurantId}/posts`, {
          type: "CONTENT",
          description: description.trim(),
          imageUrl,
        });
      } else {
        const restaurantId = await getRestaurantId();

        if (!restaurantId) {
          Alert.alert("Missing restaurant", "Please choose a restaurant");
          return;
        }

        await api.post("/posts", {
          type: postType,
          description: description.trim(),
          imageUrl,
          rating: postType === "REVIEW" ? Number(rating) : undefined,
          restaurantId,
        });
      }

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
          <Text className="text-3xl font-bold text-black">New Post</Text>

          {managedRestaurants.length > 0 && (
            <View className="mt-6">
              <Text className="mb-2 text-sm font-bold text-gray-500">
                Posting as
              </Text>

              <View className="gap-3">
                <TouchableOpacity
                  className={`rounded-2xl border px-4 py-4 ${
                    postingAs.type === "USER"
                      ? "border-black bg-black"
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => {
                    setPostingAs({ type: "USER" });
                    setPostType("CONTENT");
                  }}
                >
                  <Text
                    className={`font-bold ${
                      postingAs.type === "USER" ? "text-white" : "text-black"
                    }`}
                  >
                    My personal profile
                  </Text>
                </TouchableOpacity>

                {managedRestaurants.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    className={`rounded-2xl border px-4 py-4 ${
                      postingAs.type === "RESTAURANT" &&
                      postingAs.restaurantId === restaurant.id
                        ? "border-black bg-black"
                        : "border-gray-200 bg-white"
                    }`}
                    onPress={() => {
                      setPostingAs({
                        type: "RESTAURANT",
                        restaurantId: restaurant.id,
                      });
                      setPostType("CONTENT");
                      setRating("");
                      setSelectedRestaurant(null);
                    }}
                  >
                    <Text
                      className={`font-bold ${
                        postingAs.type === "RESTAURANT" &&
                        postingAs.restaurantId === restaurant.id
                          ? "text-white"
                          : "text-black"
                      }`}
                    >
                      {restaurant.name}
                    </Text>

                    <Text
                      className={`mt-1 text-sm ${
                        postingAs.type === "RESTAURANT" &&
                        postingAs.restaurantId === restaurant.id
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      Official restaurant post
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {postingAs.type === "USER" && (
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

          {postingAs.type === "USER" && (
            <RestaurantSearch
              selectedRestaurant={selectedRestaurant}
              onSelect={setSelectedRestaurant}
            />
          )}

          {postingAs.type === "USER" && postType === "REVIEW" && (
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
              postType === "CONTENT"
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
