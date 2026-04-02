import { useState } from "react";
import {
  Text,
  View,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { Icon } from "@/components/Icon";
import ArrowLongLeft from "@/assets/icons/ArrowLongLeft.svg";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { ThemedInput } from "@/components/ThemedInput";
import User from "@/assets/icons/UserOutline.svg";
import Email from "@/assets/icons/EnvelopeOutline.svg";
import Lock from "@/assets/icons/LockClosedSolid.svg";

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
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        username: username.trim(),
        displayName: username.trim(),
        email: email.trim(),
        password,
      });

      await signIn({
        token: response.data.accessToken,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ backgroundColor: "#F7D786", flex: 1 }}>
        <StatusBar barStyle="dark-content" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-8 pt-2 pb-6">
              <View className="w-full items-start">
                <ThemedButton
                  className="bg-transparent p-0 min-h-0"
                  onPress={() => router.back()}
                >
                  <Icon Icon={ArrowLongLeft} size={34} color="#212121" />
                </ThemedButton>
              </View>

              <View className="mt-8 items-center">
                <Text className="text-[#212121] text-6xl font-bold">
                  FINDEAT
                </Text>
                <Text className="mt-3 text-base text-[#212121]/70">
                  Nice to meet you!
                </Text>
              </View>

              <View className="mt-10 gap-4">
                <ThemedInput
                  icon={User}
                  iconSize={20}
                  iconColor="#F7D786"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="#888"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-[#f5f5f5] text-base text-[#212121]"
                />
                <ThemedInput
                  icon={Email}
                  iconSize={20}
                  iconColor="#F7D786"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-[#f5f5f5] text-base text-[#212121]"
                />
                <ThemedInput
                  icon={Lock}
                  iconSize={20}
                  iconColor="#F7D786"
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
                  icon={Lock}
                  iconSize={20}
                  iconColor="#F7D786"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-base text-[#212121]"
                />
              </View>

              <View className="mt-8">
                <ThemedButton
                  className="w-full rounded-xl bg-[#212121] py-4"
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text className="text-2xl font-cabinet-extrabold text-white">
                    {loading ? "Signing up..." : "Sign Up"}
                  </Text>
                </ThemedButton>
              </View>

              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-[#212121]/70">
                  Already have an account?{" "}
                </Text>
                <ThemedButton
                  className="bg-transparent p-0 min-h-0"
                  onPress={() => router.push("/auth/login")}
                >
                  <Text className="text-[#212121] font-semibold">Log In</Text>
                </ThemedButton>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
