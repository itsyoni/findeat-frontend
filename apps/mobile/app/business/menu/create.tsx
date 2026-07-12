import { AppButton, TextInput , ThemedSafeAreaView } from "@/components/common";
import Text from "@/components/common/AppText";
import { api } from "@/lib/api";
import { getErrorMessage } from "@findeat/utils";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";

export default function CreateMenuScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function createMenu() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Menu title is required");
      return;
    }

    try {
      setLoading(true);

      await api.menu.createMenu({
        title: title.trim(),
        description: description.trim() || undefined,
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", getErrorMessage(error, "Could not create menu"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedSafeAreaView>
      <KeyboardAvoidingView
        className="flex-1 px-5 pt-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text className="text-3xl font-bold text-black">Add menu section</Text>

        <Text className="mt-2 text-gray-500">
          Example: Breakfast, Burgers, Desserts, Drinks.
        </Text>

        <TextInput
          className="mt-8 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
          placeholder="Menu title"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="mt-4 min-h-28 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
          placeholder="Description optional"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <AppButton
          title={loading ? "Creating..." : "Create menu"}
          onPress={createMenu}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
