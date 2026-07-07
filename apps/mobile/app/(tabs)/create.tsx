import Text from "@/components/common/AppText";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreatePostScreen() {
  const { t } = useTranslation("create");

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-8">
      <Text className="text-3xl font-bold text-black">{t("title")}</Text>

      <View className="mt-8 gap-4">
        <TouchableOpacity
          className="rounded-3xl bg-black p-6"
          onPress={() => router.push("/create/content")}
        >
          <Text className="text-xl font-bold text-white">
            {t("contentPost")}
          </Text>

          <Text className="mt-2 text-white/70">{t("contentPostSubtitle")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="rounded-3xl bg-[#F7D786] p-6"
          onPress={() => router.push("/create/review")}
        >
          <Text className="text-xl font-bold text-black">{t("review")}</Text>

          <Text className="mt-2 text-black/60">{t("reviewSubtitle")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
