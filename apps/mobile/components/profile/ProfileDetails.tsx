import Text from "@/components/common/AppText";
import type { Profile } from "@findeat/types";
import {
  CakeIcon,
  ForkKnifeIcon,
  PhoneIcon,
  UserCircleIcon,
  WarningIcon,
} from "phosphor-react-native";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

type Props = { profile: Profile };

type DetailChip = {
  key: string;
  text: string;
  kind?: "default" | "food" | "warning";
  icon?: React.ReactNode;
};

export default function ProfileDetails({ profile }: Props) {
  const { t, i18n } = useTranslation("profile");
  const chips: DetailChip[] = [];

  if (profile.showPronouns !== false && profile.pronouns) {
    chips.push({
      key: "pronouns",
      text: profile.pronouns,
      icon: <UserCircleIcon size={15} color="#6B7280" />,
    });
  }
  if (profile.showBirthday && profile.birthday) {
    chips.push({
      key: "birthday",
      text: new Intl.DateTimeFormat(
        i18n.language === "he" ? "he-IL" : "en-GB",
        { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
      ).format(new Date(profile.birthday)),
      icon: <CakeIcon size={15} color="#6B7280" />,
    });
  }
  if (profile.showPhoneNumber && profile.phoneNumber) {
    chips.push({
      key: "phone",
      text: profile.phoneNumber,
      icon: <PhoneIcon size={15} color="#6B7280" />,
    });
  }
  if (profile.showFoodPreferences !== false) {
    profile.foodPreferences?.forEach((item) =>
      chips.push({
        key: `food-${item}`,
        text: t(`profileOptions.${item}`),
        kind: "food",
        icon: <ForkKnifeIcon size={15} color="#D97706" weight="fill" />,
      }),
    );
  }
  if (profile.showFavoriteCuisines !== false) {
    profile.favoriteCuisines?.forEach((item) =>
      chips.push({ key: `cuisine-${item}`, text: item, kind: "food" }),
    );
  }
  if (profile.showDietaryRestrictions) {
    profile.dietaryRestrictions?.forEach((item) =>
      chips.push({
        key: `restriction-${item}`,
        text: t(`profileOptions.${item}`),
        kind: "warning",
        icon: <WarningIcon size={15} color="#DC2626" weight="fill" />,
      }),
    );
  }
  if (profile.showAllergies) {
    profile.allergies?.forEach((item) =>
      chips.push({
        key: `allergy-${item}`,
        text: t("allergyValue", { value: item }),
        kind: "warning",
        icon: <WarningIcon size={15} color="#DC2626" />,
      }),
    );
  }

  if (!chips.length) return null;

  return (
    <View className="mt-4 w-full">
      <Text weight="bold" className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("foodProfile")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      >
        {chips.map((chip) => (
          <View
            key={chip.key}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 ${
              chip.kind === "warning"
                ? "bg-red-50 dark:bg-red-950/40"
                : chip.kind === "food"
                  ? "bg-amber-50 dark:bg-amber-950/40"
                  : "bg-gray-100 dark:bg-gray-900"
            }`}
          >
            {chip.icon}
            <Text
              className={`text-sm ${
                chip.kind === "warning"
                  ? "text-red-800 dark:text-red-200"
                  : chip.kind === "food"
                    ? "text-amber-900 dark:text-amber-200"
                    : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {chip.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
