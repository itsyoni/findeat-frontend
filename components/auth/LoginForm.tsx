import Text from "@/components/AppText";
import TextInput from "@/components/AppTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormData, loginSchema } from "@/lib/validation/auth";
import { EnvelopeSimpleIcon, LockIcon } from "phosphor-react-native";
import { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ZodError } from "zod";

type Props = {
  onSignup: () => void;
  onRestaurantSignup: () => void;
};

export default function LoginForm({ onSignup }: Props) {
  const { login } = useAuth();
  const passwordRef = useRef<RNTextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      const data: LoginFormData = loginSchema.parse({
        email,
        password,
      });

      setLoading(true);
      await login(data.email, data.password);
    } catch (error: any) {
      if (error instanceof ZodError) {
        Alert.alert("Invalid details", error.issues[0]?.message);
        return;
      }

      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Text weight="bold" className="text-center text-2xl text-[#212121]">
        Welcome Back!
      </Text>

      <Text className="mb-6 mt-1 text-center text-gray-500">
        Login to keep exploring dishes.
      </Text>

      <View className="gap-4">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<EnvelopeSimpleIcon size={20} color="#212121" />}
        />

        <TextInput
          ref={passwordRef}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          onSubmitEditing={Keyboard.dismiss}
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<LockIcon size={20} color="#212121" />}
        />

        <TouchableOpacity
          className="rounded-2xl bg-[#212121] py-4"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text weight="bold" className="text-center text-white">
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignup}>
          <Text className="text-center text-gray-500">
            {"Don't have an account? "}
            <Text weight="bold" className="text-[#212121]">
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
