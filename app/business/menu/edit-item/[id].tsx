import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditMenuItemScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    category?: string;
  }>();

  const [name, setName] = useState(params.name ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [price, setPrice] = useState(params.price ?? "");
  const [category, setCategory] = useState(params.category ?? "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(params.imageUrl);
  const [newImageUri, setNewImageUri] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewImageUri(result.assets[0].uri);
    }
  }

  async function saveDish() {
    if (!name.trim()) {
      Alert.alert("Missing name", "Dish name is required");
      return;
    }

    const parsedPrice = price.trim() ? Number(price) : null;

    if (price.trim() && Number.isNaN(parsedPrice)) {
      Alert.alert("Invalid price", "Price must be a number");
      return;
    }

    try {
      setLoading(true);

      let finalImageUrl = imageUrl;

      if (newImageUri) {
        finalImageUrl = await uploadImageToCloudinary(newImageUri);
      }

      await api.patch(`/business/menus/dishes/${params.id}`, {
        name: name.trim(),
        description: description.trim() || null,
        price: parsedPrice,
        category: category.trim() || null,
        imageUrl: finalImageUrl ?? null,
      });

      router.back();
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not update dish",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteDish() {
    Alert.alert("Delete dish", "Are you sure you want to delete this dish?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await api.delete(`/business/menus/dishes/${params.id}`);
            router.back();
          } catch (error: any) {
            console.error(error.response?.data ?? error);
            Alert.alert("Error", "Could not delete dish");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }

  const displayedImage = newImageUri ?? imageUrl;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <Text className="text-3xl font-bold text-black">Edit dish</Text>

          <TouchableOpacity
            className="mt-6 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-10"
            onPress={pickImage}
          >
            {displayedImage ? (
              <Image
                source={{ uri: displayedImage }}
                className="h-56 w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500">+ Add dish photo</Text>
            )}
          </TouchableOpacity>

          <TextInput
            className="mt-6 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Dish name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Price"
            placeholderTextColor="#9CA3AF"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Category optional"
            placeholderTextColor="#9CA3AF"
            value={category}
            onChangeText={setCategory}
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
            onPress={saveDish}
            disabled={loading}
          >
            <Text className="text-center font-bold text-white">
              {loading ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 rounded-2xl border border-red-300 py-4"
            onPress={deleteDish}
            disabled={loading}
          >
            <Text className="text-center font-bold text-red-500">
              Delete dish
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
