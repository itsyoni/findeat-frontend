import Text from "@/components/common/AppText";
import { useAuth } from "@/contexts/AuthContext";
import { LoginFormData, loginSchema } from "@/lib/validation/auth";
import { getErrorMessage } from "@findeat/utils";
import { EnvelopeSimpleIcon, LockIcon } from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Keyboard, TouchableOpacity, View } from "react-native";
import { ZodError } from "zod";
import { TextInput } from "../common";

type Props = {
  onSignup: () => void;
  onRestaurantSignup: () => void;
};

export default function LoginForm({ onSignup }: Props) {
  const { t } = useTranslation("auth");
  const { login } = useAuth();

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
    } catch (error) {
      if (error instanceof ZodError) {
        Alert.alert(t("invalidDetails"), error.issues[0]?.message);
        return;
      }

      Alert.alert(
        t("common:error"),
        getErrorMessage(error, t("invalidEmailOrPassword")),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Text weight="bold" className="text-center text-2xl text-[#212121]">
        {t("welcomeBack")}
      </Text>

      <Text className="mb-6 mt-1 text-center text-gray-500">
        {t("loginSubtitle")}
      </Text>

      <View className="gap-4">
        <TextInput
          useBottomSheetInput
          placeholder={t("email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          submitBehavior="blurAndSubmit"
          onSubmitEditing={Keyboard.dismiss}
          className="border-0 bg-[#f8f8f8]"
          leftIcon={<EnvelopeSimpleIcon size={20} color="#212121" />}
        />

        <TextInput
          useBottomSheetInput
          placeholder={t("password")}
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
            {loading ? t("loggingIn") : t("login")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignup}>
          <Text className="text-center text-gray-500">
            {t("dontHaveAccount")}
            <Text weight="bold" className="text-[#212121]">
              {t("signUp")}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
