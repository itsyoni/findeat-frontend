import { useAuth } from "@/contexts/AuthContext";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import * as ImagePicker from "expo-image-picker";
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
} from "react-native";

export default function RestaurantSignupScreen() {
  const { signupWithRestaurant } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [logoUri, setLogoUri] = useState<string>();
  const [coverUri, setCoverUri] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function pickLogo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) setLogoUri(result.assets[0].uri);
  }

  async function pickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) setCoverUri(result.assets[0].uri);
  }

  async function handleSignup() {
    if (
      !email.trim() ||
      !username.trim() ||
      !password.trim() ||
      !restaurantName.trim()
    ) {
      Alert.alert("Missing details", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const avatarUrl = logoUri
        ? await uploadImageToCloudinary(logoUri)
        : undefined;

      const coverUrl = coverUri
        ? await uploadImageToCloudinary(coverUri)
        : undefined;

      await signupWithRestaurant({
        email: email.trim(),
        username: username.trim(),
        password,
        restaurantName: restaurantName.trim(),
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        avatarUrl,
        coverUrl,
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create business account");
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
          <Text className="text-3xl font-bold text-black">
            Add your restaurant
          </Text>

          <Text className="mt-2 text-gray-500">
            Create a business profile for your restaurant.
          </Text>

          <TextInput
            className="mt-8 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Business email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Restaurant username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            className="mt-6 h-28 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50"
            onPress={pickLogo}
          >
            {logoUri ? (
              <Image
                source={{ uri: logoUri }}
                className="h-full w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500">+ Add logo</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 h-44 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50"
            onPress={pickCover}
          >
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                className="h-full w-full rounded-2xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500">+ Add cover</Text>
            )}
          </TouchableOpacity>

          <TextInput
            className="mt-6 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Restaurant name"
            placeholderTextColor="#9CA3AF"
            value={restaurantName}
            onChangeText={setRestaurantName}
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="City"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />

          <TextInput
            className="mt-4 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Address"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
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
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-center font-bold text-white">
              {loading ? "Creating..." : "Create business account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
