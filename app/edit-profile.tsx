import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import FormInput from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { Profile } from "@/types/profile";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);

  const { logout, refreshUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const displayedAvatar = newAvatarUri || avatarUrl;

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");
      const data: Profile = res.data;

      setAvatarUrl(data.avatarUrl ?? null);
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
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

      await refreshUser();
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update profile");
    } finally {
      setLoading(false);
    }
  }

  async function pickImage(
    aspect: [number, number],
    onSelect: (uri: string) => void,
  ) {
    async function openCamera() {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Camera access is required.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelect(result.assets[0].uri);
      }
    }

    async function openLibrary() {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission required", "Photo library access is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect,
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelect(result.assets[0].uri);
      }
    }

    async function removeProfilePicture() {
      try {
        const res = await api.delete("/users/me/avatar");

        setAvatarUrl(res.data.avatarUrl);
        setNewAvatarUri(null);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not remove profile picture.");
      }
    }

    Alert.alert("Choose image", "Where would you like to get the image from?", [
      {
        text: "Take Photo",
        onPress: openCamera,
      },
      {
        text: "Choose From Library",
        onPress: openLibrary,
      },
      {
        text: "Remove Profile Picture",
        style: "destructive",
        onPress: removeProfilePicture,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  }

  async function pickAvatar() {
    await pickImage([1, 1], setNewAvatarUri);
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-5 pb-10">
        <TouchableOpacity onPress={pickAvatar} className={"mt-8 items-center"}>
          <Avatar uri={displayedAvatar} username={username} size={96} />

          <Text className="mt-3 font-semibold text-black">
            {"Change profile photo"}
          </Text>
        </TouchableOpacity>

        <SectionTitle title={"Account"} />

        <FormInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
        />

        <FormInput
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder={"Tell people about yourself..."}
          multiline
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
              { text: "Cancel", style: "cancel" },
              { text: "Logout", style: "destructive", onPress: logout },
            ])
          }
        >
          <Text className="text-center font-bold text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="mt-8 mb-3 text-xl font-bold text-black">{title}</Text>
  );
}
