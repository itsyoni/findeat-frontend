import Text from "@/components/common/AppText";
import TextInput from "@/components/common/AppTextInput";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { SignupFormData, signupSchema } from "@/lib/validation/auth";
import { getErrorMessage } from "@findeat/utils/index";
import { AtIcon, EnvelopeSimpleIcon, LockIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";

type Props = {
  onLogin: () => void;
  onRestaurantSignup: () => void;
};

export default function SignupForm({ onLogin, onRestaurantSignup }: Props) {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [availability, setAvailability] = useState<{
    usernameAvailable: boolean | null;
    emailAvailable: boolean | null;
  }>({
    usernameAvailable: null,
    emailAvailable: null,
  });
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    try {
      const data: SignupFormData = signupSchema.parse({
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword,
      });

      if (availability.usernameAvailable === false) {
        Alert.alert("Invalid details", "Username is already taken");
        return;
      }

      if (availability.emailAvailable === false) {
        Alert.alert("Invalid details", "Email is already registered");
        return;
      }

      setLoading(true);

      await signup(
        data.email,
        data.username,
        data.password,
        `${data.firstName} ${data.lastName}`.trim(),
      );
    } catch (error) {
      if (error instanceof ZodError) {
        Alert.alert("Invalid details", error.issues[0]?.message);
        return;
      }

      Alert.alert("Error", getErrorMessage(error, "Could not create account"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!username.trim() && !email.trim()) {
        setAvailability({
          usernameAvailable: null,
          emailAvailable: null,
        });
        return;
      }

      try {
        const availability = await api.auth.checkAvailability({
          username: username.trim() || undefined,
          email: email.trim() || undefined,
        });

        setAvailability(availability);
      } catch {
        setAvailability({
          usernameAvailable: null,
          emailAvailable: null,
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, email]);

  return (
    <View>
      <Text weight="bold" className="text-2xl text-[#212121] text-center">
        Create account
      </Text>

      <Text className="mb-6 mt-1 text-gray-500 text-center">
        Join now and start discovering.
      </Text>

      <View className="gap-4">
        <View className="flex-row gap-3">
          <TextInput
            useBottomSheetInput
            placeholder="First name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            className="flex-1 border-0 bg-[#f8f8f8]"
          />

          <TextInput
            useBottomSheetInput
            placeholder="Last name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            className="flex-1 border-0 bg-[#f8f8f8]"
          />
        </View>
        <TextInput
          useBottomSheetInput
          placeholder="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text.replace(/[^a-zA-Z0-9_]/g, ""));
          }}
          autoCapitalize="none"
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<AtIcon size={20} color="#212121" />}
        />

        {availability.usernameAvailable === false && (
          <Text className="-mt-3 text-sm text-red-500">
            Username is already taken
          </Text>
        )}

        <TextInput
          useBottomSheetInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<EnvelopeSimpleIcon size={20} color="#212121" />}
        />

        {availability.emailAvailable === false && (
          <Text className="-mt-3 text-sm text-red-500">
            Email is already registered
          </Text>
        )}

        <TextInput
          useBottomSheetInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<LockIcon size={20} color="#212121" />}
        />

        <TextInput
          useBottomSheetInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<LockIcon size={20} color="#212121" />}
        />

        <TouchableOpacity
          className="rounded-2xl bg-[#212121] py-4"
          onPress={handleSignup}
          disabled={loading}
        >
          <Text weight="bold" className="text-center text-white">
            {loading ? "Creating account..." : "Create account"}
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
