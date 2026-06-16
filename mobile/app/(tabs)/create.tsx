import { api } from "@/lib/api";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CreatePostScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreatePost() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title");
      return;
    }

    try {
      setLoading(true);

      await api.post("/posts", {
        title: title.trim(),
        description: description.trim() || undefined,
      });

      setTitle("");
      setDescription("");

      router.replace({
        pathname: "/(tabs)",
        params: { refresh: Date.now().toString() },
      });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not create post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="text-3xl font-bold text-black">Create Post</Text>

      <TextInput
        className="mt-8 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Title"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        className="mt-4 min-h-32 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Description"
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
    </View>
  );
}
