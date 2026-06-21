import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="mb-2 text-center text-3xl font-bold text-black">
        FindEat
      </Text>

      <Text className="mb-8 text-center text-gray-500">
        Login to your account
      </Text>

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
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-center text-base font-bold text-white">
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4">
        <Text className="text-center text-gray-500">Forgot password?</Text>
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
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text className="text-center text-gray-500">
          {"Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
