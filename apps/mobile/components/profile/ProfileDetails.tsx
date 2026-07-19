import Text from "@/components/common/AppText";
import type { Profile } from "@findeat/types";
import { UserCircleIcon } from "phosphor-react-native";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { getProfileTagLabel } from "./ProfileTagPickerPage";

type Props = { profile: Profile };

export default function ProfileDetails({ profile }: Props) {
  const { t } = useTranslation("profile");
  if (profile.showPronouns === false || !profile.pronouns) return null;

  const pronouns = profile.pronouns
    .split(" · ")
    .map((item) => getProfileTagLabel(t, item))
    .join(" · ");

  return (
    <View className="max-w-40 shrink flex-row items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1.5 dark:bg-gray-900">
      <UserCircleIcon size={14} color="#6B7280" />
      <Text numberOfLines={1} className="shrink text-xs text-gray-700 dark:text-gray-200">
        {pronouns}
      </Text>
    </View>
  );
}
