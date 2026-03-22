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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
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
      console.log("Login failed:", error?.response?.data || error.message);

      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      Alert.alert(
        "Login failed",
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
              <Text className="mt-3 text-base text-black/70">Welcome back</Text>
            </View>

            <View className="gap-4">
              <View className="w-full rounded-full bg-white px-5 py-4">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-base text-black"
                />
              </View>

              <View className="w-full rounded-full bg-white px-5 py-4">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-base text-black"
                />
              </View>

              <ThemedButton
                className="w-full rounded-full bg-black py-4"
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-base font-semibold text-white">
                  {loading ? "Logging In..." : "Log In"}
                </Text>
              </ThemedButton>
            </View>

            <View className="mt-6 flex-row items-center justify-center">
              <Text className="text-black/70">Don’t have an account? </Text>
              <ThemedButton
                className="bg-transparent p-0 min-h-0"
                onPress={() => router.push("/auth/register")}
              >
                <Text className="text-black font-semibold">Sign Up</Text>
              </ThemedButton>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
