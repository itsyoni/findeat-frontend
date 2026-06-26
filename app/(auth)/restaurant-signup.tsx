import AddressAutocomplete, {
  SelectedAddress,
} from "@/components/AddressAutocomplete";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Alert,
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
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [mapboxId, setMapboxId] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (
      !email.trim() ||
      !username.trim() ||
      !password.trim() ||
      !restaurantName.trim() ||
      !address.trim() ||
      !city.trim() ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !mapboxId
    ) {
      Alert.alert("Missing details", "Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      await signupWithRestaurant({
        email: email.trim(),
        username: username.trim(),
        password,
        restaurantName: restaurantName.trim(),
        city: city.trim(),
        address: address.trim(),
        description: description.trim() || undefined,
        latitude,
        longitude,
        mapboxId,
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not create business account",
      );
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

          <TextInput
            className="mt-6 rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
            placeholder="Restaurant name"
            placeholderTextColor="#9CA3AF"
            value={restaurantName}
            onChangeText={setRestaurantName}
          />

          <AddressAutocomplete
            onSelect={(selected: SelectedAddress) => {
              setAddress(selected.address);
              setCity(selected.city ?? "");
              setLatitude(selected.latitude);
              setLongitude(selected.longitude);
              setMapboxId(selected.id);
            }}
          />

          {!!address && (
            <Text className="mt-2 text-sm text-gray-500">
              Selected: {address}
            </Text>
          )}

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
