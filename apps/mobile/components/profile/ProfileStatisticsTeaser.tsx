import Text from "@/components/common/AppText";
import DirectionalIcon from "@/components/common/icons/DirectionalIcon";
import { useAppTheme } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { ChartLineUpIcon, XIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Props = {
  onDismiss: () => void;
};

export default function ProfileStatisticsTeaser({ onDismiss }: Props) {
  const { t } = useTranslation("profile");
  const { isDark } = useAppTheme();

  return (
    <View
      className="mx-4 mb-4 flex-row items-center rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30"
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t("creatorInsights")}
        activeOpacity={0.82}
        onPress={() => router.push("/(profile)/statistics")}
        className="min-w-0 flex-1 flex-row items-center"
      >
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-400">
          <ChartLineUpIcon size={24} color="#171717" weight="bold" />
        </View>
        <View className="ml-3 min-w-0 flex-1">
          <View className="flex-row items-center">
            <Text className="shrink text-base font-bold text-black dark:text-white">
              {t("creatorInsights")}
            </Text>
            <View className="ml-2 rounded-full bg-black px-2 py-0.5 dark:bg-white">
              <Text className="text-[10px] font-black text-white dark:text-black">
                {t("pro")}
              </Text>
            </View>
          </View>
          <Text numberOfLines={2} className="mt-1 text-xs leading-4 text-amber-900/70 dark:text-amber-100/70">
            {t("creatorInsightsPromotionSubtitle")}
          </Text>
        </View>
        <DirectionalIcon
          direction="forward"
          variant="caret"
          size={19}
          color={isDark ? "#FDE68A" : "#92400E"}
          weight="bold"
        />
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t("dismissCreatorInsights")}
        hitSlop={10}
        onPress={onDismiss}
        className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-900/60"
      >
        <XIcon size={16} color={isDark ? "#FDE68A" : "#92400E"} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}
