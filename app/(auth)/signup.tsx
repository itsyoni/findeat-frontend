import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignupScreen() {
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !username.trim() ||
      !password.trim()
    ) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await signup(
        email.trim(),
        username.trim(),
        password,
        firstName.trim(),
        lastName.trim(),
      );
    } catch {
      Alert.alert("Error", "Could not create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-center text-3xl font-bold text-black">
        Join FindEat
      </Text>

      <Text className="mb-8 text-center text-gray-500">
        Create your personal account
      </Text>

      <View className="mb-4 flex-row gap-3">
        <TextInput
          className="flex-1 rounded-2xl border border-gray-300 px-4 py-4 text-base text-black"
          placeholder="First name"
          placeholderTextColor="#9CA3AF"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />

        <TextInput
          className="flex-1 rounded-2xl border border-gray-300 px-4 py-4 text-base text-black"
          placeholder="Last name"
          placeholderTextColor="#9CA3AF"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>

      <TextInput
        className="mb-4 rounded-2xl border border-gray-300 px-4 py-4 text-base text-black"
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        className="mb-4 rounded-2xl border border-gray-300 px-4 py-4 text-base text-black"
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="mb-6 rounded-2xl border border-gray-300 px-4 py-4 text-base text-black"
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="rounded-2xl bg-black py-4"
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-center text-base font-bold text-white">
          {loading ? "Creating account..." : "Sign up"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-5"
        onPress={() => router.push("/(auth)/restaurant-signup")}
      >
        <Text className="text-center font-semibold text-black">
          Business owner? Add your restaurant here
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-6"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-center text-gray-500">
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
