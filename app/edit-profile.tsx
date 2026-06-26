import Avatar from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { Profile } from "@/types/profile";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDescription, setRestaurantDescription] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantWebsite, setRestaurantWebsite] = useState("");
  const [restaurantInstagram, setRestaurantInstagram] = useState("");

  const [loading, setLoading] = useState(false);

  const { logout, refreshUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [newCoverUri, setNewCoverUri] = useState<string | null>(null);

  const displayedAvatar = newAvatarUri || avatarUrl;
  const displayedCover = newCoverUri || coverUrl;

  const isBusiness = profile?.accountType === "BUSINESS";

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/users/me");
      const data: Profile = res.data;

      setProfile(data);

      setAvatarUrl(data.avatarUrl ?? null);
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");

      if (data.accountType === "BUSINESS" && data.businessRestaurant) {
        setRestaurantName(data.businessRestaurant.name ?? "");
        setRestaurantDescription(data.businessRestaurant.description ?? "");
        setRestaurantAddress(data.businessRestaurant.address ?? "");
        setRestaurantCity(data.businessRestaurant.city ?? "");
        setRestaurantPhone(data.businessRestaurant.phone ?? "");
        setRestaurantWebsite(data.businessRestaurant.website ?? "");
        setRestaurantInstagram(data.businessRestaurant.instagram ?? "");
        setCoverUrl(data.businessRestaurant.coverUrl ?? null);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function saveProfile() {
    if (!username.trim()) {
      Alert.alert("Missing username", "Username cannot be empty");
      return;
    }

    if (isBusiness && !restaurantName.trim()) {
      Alert.alert("Missing restaurant name", "Restaurant name cannot be empty");
      return;
    }

    try {
      setLoading(true);

      let finalAvatarUrl = avatarUrl;
      let finalCoverUrl = coverUrl;

      if (newAvatarUri) {
        finalAvatarUrl = await uploadImageToCloudinary(newAvatarUri);
      }

      if (newCoverUri) {
        finalCoverUrl = await uploadImageToCloudinary(newCoverUri);
      }

      await api.patch("/users/me", {
        username: username.trim(),
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl,
      });

      if (isBusiness) {
        await api.patch("/restaurants/me", {
          name: restaurantName.trim(),
          description: restaurantDescription.trim() || null,
          address: restaurantAddress.trim() || null,
          city: restaurantCity.trim() || null,
          phone: restaurantPhone.trim() || null,
          website: restaurantWebsite.trim() || null,
          instagram: restaurantInstagram.trim() || null,
          coverUrl: finalCoverUrl,
        });
      }

      await refreshUser();
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

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri);
    }
  }

  async function pickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewCoverUri(result.assets[0].uri);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {isBusiness && (
        <TouchableOpacity onPress={pickCover}>
          {displayedCover ? (
            <Image
              source={{ uri: displayedCover }}
              className="h-48 w-full bg-gray-100"
              resizeMode="cover"
            />
          ) : (
            <View className="h-48 w-full items-center justify-center bg-gray-100">
              <Text className="font-semibold text-gray-500">
                Add restaurant cover
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <View className="px-5 pb-10">
        <TouchableOpacity
          onPress={pickAvatar}
          className={isBusiness ? "-mt-12 items-center" : "mt-8 items-center"}
        >
          <Avatar
            uri={displayedAvatar}
            username={isBusiness ? restaurantName || username : username}
            size={96}
          />

          <Text className="mt-3 font-semibold text-black">
            {isBusiness ? "Change restaurant photo" : "Change profile photo"}
          </Text>
        </TouchableOpacity>

        <SectionTitle title={isBusiness ? "Business account" : "Account"} />

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
          placeholder={
            isBusiness
              ? "Short intro for your restaurant..."
              : "Tell people about yourself..."
          }
          multiline
        />

        {isBusiness && (
          <>
            <SectionTitle title="Restaurant details" />

            <FormInput
              label="Restaurant name"
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Restaurant name"
            />

            <FormInput
              label="Description"
              value={restaurantDescription}
              onChangeText={setRestaurantDescription}
              placeholder="Tell people about the restaurant..."
              multiline
            />

            <FormInput
              label="Address"
              value={restaurantAddress}
              onChangeText={setRestaurantAddress}
              placeholder="Address"
            />

            <FormInput
              label="City"
              value={restaurantCity}
              onChangeText={setRestaurantCity}
              placeholder="City"
            />

            <FormInput
              label="Phone"
              value={restaurantPhone}
              onChangeText={setRestaurantPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
            />

            <FormInput
              label="Website"
              value={restaurantWebsite}
              onChangeText={setRestaurantWebsite}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />

            <FormInput
              label="Instagram"
              value={restaurantInstagram}
              onChangeText={setRestaurantInstagram}
              placeholder="@restaurant"
              autoCapitalize="none"
            />
          </>
        )}

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

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "url";
}) {
  return (
    <>
      <Text className="mt-5 mb-2 text-sm font-semibold text-gray-500">
        {label}
      </Text>

      <TextInput
        className={`rounded-2xl border border-gray-200 px-4 py-4 text-base text-black ${
          multiline ? "min-h-32" : ""
        }`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
      />
    </>
  );
}
