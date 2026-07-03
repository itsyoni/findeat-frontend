import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import FormInput from "@/components/forms/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { Profile } from "@findeat/types/profile";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";

export default function EditProfileScreen() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      setDisplayName(data.displayName ?? "");
      setCoverUrl(data.coverUrl ?? null);
      setEmail(data.email ?? "");
    } catch (error) {
      console.error(error);
    }
  }

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert("Missing username", "Username cannot be empty");
      return;
    }

    if (!displayName.trim()) {
      Alert.alert("Missing display name", "Display name cannot be empty");
      return;
    }

    let finalCoverUrl = coverUrl;

    if (newCoverUri) {
      finalCoverUrl = await uploadImageToCloudinary(newCoverUri);
    }

    try {
      setLoading(true);

      let finalAvatarUrl = avatarUrl;

      if (newAvatarUri) {
        finalAvatarUrl = await uploadImageToCloudinary(newAvatarUri);
      }

      await api.patch("/users/me", {
        displayName: displayName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl,
        coverUrl: finalCoverUrl,
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
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
        <TouchableOpacity
          onPress={() => pickImage([3, 1], setNewCoverUri)}
          className="mt-6 h-40 overflow-hidden rounded-3xl bg-gray-100"
        >
          {newCoverUri || coverUrl ? (
            <Image
              source={{ uri: newCoverUri ?? coverUrl ?? "" }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-gray-500">+ Add cover photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={pickAvatar} className={"mt-8 items-center"}>
          <Avatar uri={displayedAvatar} username={username} size={96} />

          <Text className="mt-3 font-semibold text-black">
            {"Change profile photo"}
          </Text>
        </TouchableOpacity>

        <SectionTitle title={"Account"} />

        <FormInput
          label="Display name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
        />

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

        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <FormInput
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="Leave empty to keep current password"
          isPassword
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
