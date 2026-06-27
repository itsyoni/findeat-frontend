import AddressAutocomplete, {
  SelectedAddress,
} from "@/components/AddressAutocomplete";
import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import { useAuth } from "@/contexts/AuthContext";
import {
  RestaurantSignupFormData,
  restaurantSignupSchema,
} from "@/lib/validation/auth";
import {
  EnvelopeSimpleIcon,
  LockIcon,
  StorefrontIcon,
  UserIcon,
} from "phosphor-react-native";
import { useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";

type Props = {
  onLogin: () => void;
};

export default function RestaurantSignupForm({ onLogin }: Props) {
  const { signupWithRestaurant } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [mapboxId, setMapboxId] = useState<string>();

  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {
      const data: RestaurantSignupFormData = restaurantSignupSchema.parse({
        email,
        username,
        password,
        restaurantName,
        city,
        address,
        bio,
        latitude,
        longitude,
        mapboxId,
      });

      setLoading(true);

      await signupWithRestaurant({
        email: data.email,
        username: data.username,
        password: data.password,
        restaurantName: data.restaurantName,
        city: data.city,
        address: data.address,
        bio: data.bio || undefined,
        latitude: data.latitude,
        longitude: data.longitude,
        mapboxId: data.mapboxId,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        Alert.alert("Invalid details", error.issues[0]?.message);
        return;
      }

      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not create business account",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Text weight="bold" className="text-2xl text-[#212121]">
        Add your restaurant
      </Text>

      <Text className="mb-6 mt-1 text-gray-500">
        Create a business profile for your restaurant.
      </Text>

      <View className="gap-4">
        <TextInput
          placeholder="Business email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<EnvelopeSimpleIcon size={20} color="#212121" />}
        />

        <TextInput
          placeholder="Restaurant username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<UserIcon size={20} color="#212121" />}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<LockIcon size={20} color="#212121" />}
        />

        <TextInput
          placeholder="Restaurant name"
          value={restaurantName}
          onChangeText={setRestaurantName}
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<StorefrontIcon size={20} color="#212121" />}
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
          <Text className="text-sm text-gray-500">Selected: {address}</Text>
        )}

        <TextInput
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          textAlignVertical="top"
          className="min-h-32 border-0 bg-[#f8f8f8]"
        />

        <TouchableOpacity
          className="rounded-2xl bg-[#212121] py-4"
          onPress={handleSignup}
          disabled={loading}
        >
          <Text weight="bold" className="text-center text-white">
            {loading ? "Creating..." : "Create business account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogin}>
          <Text className="text-center text-gray-500">
            {"Already have an account? "}
            <Text weight="bold" className="text-[#212121]">
              Login
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
