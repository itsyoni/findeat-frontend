import Text from "@/components/common/AppText";
import TextInput from "@/components/common/AppTextInput";
import RestaurantSearch from "@/components/restaurants/RestaurantSearch";

import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { ManagedRestaurant, SelectedRestaurant } from "@findeat/types";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

export default function CreateContentScreen() {
  const [description, setDescription] = useState("");
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

  async function getRestaurantId() {
    if (!selectedRestaurant) return undefined;

    if (selectedRestaurant.source === "FINDEAT") {
      return selectedRestaurant.restaurant.id;
    }

    const restaurant = await api.restaurants.fromGoogle({
      name: selectedRestaurant.name,
      address: selectedRestaurant.address,
      city: selectedRestaurant.city,
      latitude: selectedRestaurant.latitude,
      longitude: selectedRestaurant.longitude,
      googlePlaceId: selectedRestaurant.googlePlaceId,
    });

    return restaurant.id;
  }

  const loadManagedRestaurants = useCallback(async () => {
    try {
      const restaurants = await api.restaurants.mine();
      setManagedRestaurants(restaurants);
    } catch (error) {
      console.error(error);
    }
  }, []);

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

    const isPostingAsRestaurant = postingAs.type === "RESTAURANT";

    if (!isPostingAsRestaurant && !selectedRestaurant) {
      Alert.alert("Missing restaurant", "Please choose a restaurant");
      return;
    }

    try {
      setLoading(true);

      let imageUrl: string | undefined;

      if (imageUri) {
        imageUrl = await uploadImageToCloudinary(imageUri);
      }

      const restaurantId =
        postingAs.type === "USER" ? await getRestaurantId() : undefined;

      if (postingAs.type === "USER" && !restaurantId) {
        Alert.alert("Missing restaurant", "Please choose a restaurant");
        return;
      }

      const createdPost =
        postingAs.type === "RESTAURANT"
          ? await api.posts.createRestaurantPost(postingAs.restaurantId, {
              description: description.trim(),
              imageUrl,
            })
          : await api.posts.createContent({
              description: description.trim(),
              imageUrl,
              restaurantId,
            });

      setDescription("");
      setImageUri(undefined);
      setSelectedRestaurant(null);

      router.replace({
        pathname: "/(tabs)",
        params: {
          feed: createdPost.type,
          postId: createdPost.id,
          refresh: Date.now().toString(),
        },
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

  useEffect(() => {
    void loadManagedRestaurants();
  }, [loadManagedRestaurants]);

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
            New Content Post
          </Text>

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
                  onPress={() => setPostingAs({ type: "USER" })}
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

          <TextInput
            className="mt-6 min-h-40 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Share something..."
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
