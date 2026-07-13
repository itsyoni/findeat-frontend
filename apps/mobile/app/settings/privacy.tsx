import Text from "@/components/common/AppText";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SettingsSection from "@/components/settings/SettingsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import { EyeIcon } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function PrivacySettingsScreen() {
  const { t } = useTranslation("settings");
  const { isDark } = useAppTheme();
  const { user, refreshUser } = useAuth();
  const [enabled, setEnabled] = useState(user?.showActivityStatus ?? true);
  const [saving, setSaving] = useState(false);
  const color = isDark ? "#FFF" : "#111";

  async function changeActivityStatus(nextEnabled: boolean) {
    if (saving) return;

    const previousEnabled = enabled;
    setEnabled(nextEnabled);
    setSaving(true);

    try {
      await api.users.updateMe({ showActivityStatus: nextEnabled });
      await refreshUser();
    } catch (error) {
      setEnabled(previousEnabled);
      console.error("Could not update activity status privacy", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
    >
      <SettingsHeader title={t("privacy")} />
      <SettingsSection title={t("activityStatus")}>
        <View className="flex-row items-center px-5 py-4">
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
            <EyeIcon size={22} color={color} />
          </View>

          <View className="mr-3 flex-1">
            <Text className="text-base text-black dark:text-white">
              {t("showActivityStatus")}
            </Text>
            <Text className="mt-0.5 text-sm text-gray-500">
              {t("showActivityStatusSubtitle")}
            </Text>
          </View>

          {saving ? (
            <ActivityIndicator color={color} />
          ) : (
            <Switch
              value={enabled}
              onValueChange={(value) => void changeActivityStatus(value)}
              trackColor={{ false: "#A09D97", true: "#FF5B35" }}
              thumbColor={enabled ? "#111111" : "#F4F3F4"}
            />
          )}
        </View>

        <Text className="px-5 pb-4 text-sm leading-5 text-gray-500">
          {t("activityStatusReciprocalHint")}
        </Text>
      </SettingsSection>
    </SafeAreaView>
  );
}
