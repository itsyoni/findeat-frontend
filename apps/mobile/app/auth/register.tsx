import { useState } from "react";
import {
  Text,
  View,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { Icon } from "@/components/Icon";
import ArrowLongLeft from "@/assets/icons/ArrowLongLeft.svg";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ThemedInput } from "@/components/ThemedInput";

export default function RegisterScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    } else if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      const { accessToken, user } = response.data;

      await signIn({
        user,
        token: accessToken,
      });

      router.replace("/");
    } catch (error: any) {
      console.log(
        "Registration failed:",
        error?.response?.data || error.message,
      );

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      Alert.alert(
        "Registration failed",
        Array.isArray(message) ? message[0] : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: "#F7D786", flex: 1 }}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-8 pt-2 pb-6">
          <View className="w-full items-start">
            <ThemedButton
              className="bg-transparent p-0 min-h-0"
              onPress={() => router.back()}
            >
              <Icon Icon={ArrowLongLeft} size={34} color="black" />
            </ThemedButton>
          </View>

          <View className="flex-1 justify-center">
            <View className="mb-10 items-center">
              <Text className="text-black text-6xl font-bold">FINDEAT</Text>
              <Text className="mt-3 text-base text-black/70">
                Nice to meet you!
              </Text>
            </View>

            <View className="gap-4">
              <ThemedInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor="#888"
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-base text-[#212121]"
              />

              <ThemedInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-base text-[#212121]"
              />

              <ThemedInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="text-base text-[#212121]"
              />

              <ThemedInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#888"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="text-base text-[#212121]"
              />

              <ThemedButton
                className="w-full rounded-full bg-black py-4"
                onPress={handleRegister}
                disabled={loading}
              >
                <Text className="text-base font-semibold text-white">
                  {loading ? "Registering..." : "Register"}
                </Text>
              </ThemedButton>
            </View>

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="text-black/70">Already have an account? </Text>
              <ThemedButton
                className="bg-transparent p-0 min-h-0"
                onPress={() => router.push("/auth/login")}
              >
                <Text className="text-black font-semibold">Log In</Text>
              </ThemedButton>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
