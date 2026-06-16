import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");

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

      await api.patch("/users/me", {
        username: username.trim(),
        bio: bio.trim() || null,
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white px-6 pt-20">
      <Text className="text-3xl font-bold text-black">Edit Profile</Text>

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
