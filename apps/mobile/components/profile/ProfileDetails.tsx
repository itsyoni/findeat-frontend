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
    <View className="mt-4 flex-row items-center gap-1.5 rounded-full bg-gray-100 px-3 py-2 dark:bg-gray-900">
      <UserCircleIcon size={15} color="#6B7280" />
      <Text className="text-sm text-gray-700 dark:text-gray-200">
        {pronouns}
      </Text>
    </View>
  );
}
