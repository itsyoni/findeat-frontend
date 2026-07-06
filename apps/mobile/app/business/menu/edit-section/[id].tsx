import Text from "@/components/common/AppText";
import TextInput from "@/components/common/AppTextInput";
import { api } from "@/lib/api";
import { getErrorMessage } from "@findeat/utils";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditMenuSectionScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title?: string;
    description?: string;
    itemsCount?: string;
  }>();

  const [title, setTitle] = useState(params.title ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [loading, setLoading] = useState(false);

  const itemsCount = Number(params.itemsCount ?? 0);

  async function saveSection() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Section title is required");
      return;
    }

    try {
      setLoading(true);

      await api.menu.updateMenu(params.id, {
        title: title.trim(),
        description: description.trim() || null,
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", getErrorMessage(error, "Could not update section"));
    } finally {
      setLoading(false);
    }
  }

  async function deleteSection() {
    if (itemsCount > 0) {
      Alert.alert(
        "Cannot delete section",
        "Delete all dishes in this section before deleting it.",
      );
      return;
    }

    Alert.alert(
      "Delete section",
      "Are you sure you want to delete this menu section?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              await api.menu.deleteMenu(params.id);

              router.back();
            } catch (error) {
              console.error(error);
              Alert.alert(
                "Error",
                getErrorMessage(error, "Could not delete section"),
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text className="text-3xl font-bold text-black">Edit section</Text>

          <TextInput
            className="mt-8 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Section title"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            className="mt-4 min-h-32 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Description optional"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            className="mt-6 rounded-2xl bg-black py-4"
            onPress={saveSection}
            disabled={loading}
          >
            <Text className="text-center font-bold text-white">
              {loading ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 rounded-2xl border border-red-300 py-4"
            onPress={deleteSection}
            disabled={loading}
          >
            <Text className="text-center font-bold text-red-500">
              Delete section
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
