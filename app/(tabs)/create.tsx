import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
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
  const [postType, setPostType] = useState<PostType>("CONTENT");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string>();

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

    if (postType === "REVIEW" && !rating.trim()) {
      Alert.alert("Missing rating", "Please add a rating");
      return;
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
      });

      setDescription("");
      setRating("");
      setImageUri(undefined);

      router.replace({
        pathname: "/(tabs)",
        params: { refresh: Date.now().toString() },
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create post");
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

          <View className="mt-8 flex-row rounded-2xl bg-gray-100 p-1">
            <TouchableOpacity
              className={`flex-1 rounded-xl py-3 ${
                postType === "CONTENT" ? "bg-white" : ""
              }`}
              onPress={() => setPostType("CONTENT")}
            >
              <Text className="text-center font-bold text-black">Content</Text>
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

          {postType === "REVIEW" && (
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
