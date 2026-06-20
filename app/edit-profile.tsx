import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");
      setAvatarUrl(res.data.avatarUrl ?? null);
      setUsername(res.data.username ?? "");
      setBio(res.data.bio ?? "");
    } catch (error) {
      console.error(error);
    }
  }

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert("Missing username", "Username cannot be empty");
      return;
    }

    try {
      setLoading(true);

      let finalAvatarUrl = avatarUrl;

      if (newAvatarUri) {
        finalAvatarUrl = await uploadImageToCloudinary(newAvatarUri);
      }

      await api.patch("/users/me", {
        username: username.trim(),
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl,
      });

      setAvatarUrl(finalAvatarUrl);
      setNewAvatarUri(null);

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile");
    } finally {
      setLoading(false);
    }
  }

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    setNewAvatarUri(result.assets[0].uri);
  }

  return (
    <View className="flex-1 bg-white px-5">
      <TouchableOpacity onPress={pickAvatar} className="items-center ">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="h-24 w-24 rounded-full"
          />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-full bg-black">
            <Text className="text-3xl font-bold text-white">
              {username.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <Text className="mt-3 font-semibold text-black">
          Change profile photo
        </Text>
      </TouchableOpacity>

      <Text className="mt-8 mb-2 text-sm font-semibold text-gray-500">
        Username
      </Text>

      <TextInput
        className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <Text className="mt-5 mb-2 text-sm font-semibold text-gray-500">Bio</Text>

      <TextInput
        className="min-h-32 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Tell people about yourself..."
        placeholderTextColor="#9CA3AF"
        value={bio}
        onChangeText={setBio}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        className="mt-6 rounded-2xl bg-black py-4"
        onPress={saveProfile}
        disabled={loading}
      >
        <Text className="text-center font-bold text-white">
          {loading ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-3 rounded-2xl border border-red-300 py-4"
        onPress={() =>
          Alert.alert("Logout", "Are you sure you want to logout?", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Logout",
              style: "destructive",
              onPress: logout,
            },
          ])
        }
      >
        <Text className="text-center font-bold text-red-500">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
