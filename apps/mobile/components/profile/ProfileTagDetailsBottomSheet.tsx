import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import useSettingsDirection from "@/components/settings/useSettingsDirection";
import type { ProfileTagKey } from "@findeat/types";
import { PROFILE_TAG_THRESHOLDS } from "@findeat/types";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { CheckCircleIcon, LockKeyIcon, TagIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Props = {
  tag: ProfileTagKey | null;
  onClose: () => void;
  progress?: number;
  threshold?: number;
  unlocked?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  selecting?: boolean;
};

export default function ProfileTagDetailsBottomSheet({
  tag,
  onClose,
  progress,
  threshold,
  unlocked = true,
  selected = false,
  onSelect,
  selecting = false,
}: Props) {
  const { t } = useTranslation(["settings", "profile"]);
  const { rowStyle, textStyle } = useSettingsDirection();
  const goal = tag ? threshold ?? PROFILE_TAG_THRESHOLDS[tag] : 0;
  const currentProgress = unlocked ? goal : Math.min(progress ?? 0, goal);
  const percentage = goal > 0 ? Math.min(100, (currentProgress / goal) * 100) : 0;

  return (
    <AppBottomSheet open={Boolean(tag)} onClose={onClose} snapPoints={["58%"]}>
      {tag ? (
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
          <View className="items-center">
            <View className={`items-center justify-center rounded-full ${unlocked ? "bg-amber-100 dark:bg-amber-950" : "bg-gray-100 dark:bg-gray-800"}`} style={{ width: 72, height: 72 }}>
              {unlocked ? (
                <TagIcon size={34} color="#D97706" weight="fill" />
              ) : (
                <LockKeyIcon size={30} color="#9CA3AF" weight="fill" />
              )}
            </View>
            <Text className="mt-4 text-center text-2xl font-black text-black dark:text-white">
              {t(`profile:profileTags.${tag}.name`)}
            </Text>
            <View className={`mt-2 flex-row items-center rounded-full px-3 py-1.5 ${unlocked ? "bg-green-100 dark:bg-green-950" : "bg-gray-100 dark:bg-gray-800"}`} style={rowStyle}>
              {unlocked ? (
                <CheckCircleIcon size={15} color="#16A34A" weight="fill" />
              ) : (
                <LockKeyIcon size={14} color="#9CA3AF" weight="fill" />
              )}
              <Text className={`text-xs font-bold ${unlocked ? "text-green-700 dark:text-green-300" : "text-gray-500"}`} style={{ marginStart: 6 }}>
                {t(unlocked ? "settings:tagUnlocked" : "settings:tagLocked")}
              </Text>
            </View>
          </View>

          <View className="mt-5 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800" style={rowStyle}>
            <Text className="text-sm font-black text-black dark:text-white" style={textStyle}>
              {t("settings:whatThisTagMeans")}
            </Text>
            <Text className="mt-1.5 text-sm leading-5 text-gray-500 dark:text-gray-400" style={textStyle}>
              {t(`profile:profileTags.${tag}.description`, { count: goal })}
            </Text>
          </View>

          <View className="mt-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-950" style={rowStyle}>
            <Text className="text-sm font-black text-amber-950 dark:text-amber-100" style={textStyle}>
              {t("settings:howToUnlockTag")}
            </Text>
            <Text className="mt-1.5 text-sm leading-5 text-amber-900/70 dark:text-amber-200/70" style={textStyle}>
              {t(`profile:profileTagUnlockInstructions.${tag}`, { count: goal })}
            </Text>
            <View className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <View className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
            </View>
            <Text className="mt-1.5 text-xs font-bold text-amber-800 dark:text-amber-300" style={textStyle}>
              {t("settings:tagProgress", { progress: currentProgress, threshold: goal })}
            </Text>
          </View>

          {unlocked && onSelect ? (
            <TouchableOpacity
              disabled={selected || selecting}
              onPress={onSelect}
              className={`mt-4 items-center rounded-2xl px-5 py-3.5 ${selected ? "bg-gray-200 dark:bg-gray-800" : "bg-black dark:bg-white"}`}
            >
              <Text className={`font-bold ${selected ? "text-gray-500" : "text-white dark:text-black"}`}>
                {t(selected ? "settings:tagShowingOnProfile" : selecting ? "settings:selectingTag" : "settings:showTagOnProfile")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </BottomSheetScrollView>
      ) : null}
    </AppBottomSheet>
  );
}
