import Text from "@/components/common/AppText";
import FormInput from "@/components/forms/FormInput";
import { useAppTheme } from "@/contexts/ThemeContext";
import { Switch, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

export type ProfileDetailsDraft = {
  phoneNumber: string;
  birthday: string;
  pronouns: string;
  allergies: string;
  foodPreferences: string[];
  dietaryRestrictions: string[];
  favoriteCuisines: string;
  showPhoneNumber: boolean;
  showBirthday: boolean;
  showPronouns: boolean;
  showAllergies: boolean;
  showFoodPreferences: boolean;
  showDietaryRestrictions: boolean;
  showFavoriteCuisines: boolean;
};

export const EMPTY_PROFILE_DETAILS: ProfileDetailsDraft = {
  phoneNumber: "",
  birthday: "",
  pronouns: "",
  allergies: "",
  foodPreferences: [],
  dietaryRestrictions: [],
  favoriteCuisines: "",
  showPhoneNumber: false,
  showBirthday: false,
  showPronouns: true,
  showAllergies: false,
  showFoodPreferences: true,
  showDietaryRestrictions: false,
  showFavoriteCuisines: true,
};

const FOOD_PREFERENCES = [
  "VEGAN",
  "VEGETARIAN",
  "PESCATARIAN",
  "KOSHER",
  "HALAL",
] as const;

const DIETARY_RESTRICTIONS = [
  "GLUTEN_FREE",
  "LACTOSE_FREE",
  "NUT_FREE",
  "SHELLFISH_FREE",
  "LOW_SODIUM",
  "DIABETIC_FRIENDLY",
] as const;

type Props = {
  value: ProfileDetailsDraft;
  onChange: (value: ProfileDetailsDraft) => void;
};

export default function ProfileDetailsEditor({ value, onChange }: Props) {
  const { t } = useTranslation("profile");
  const { isDark } = useAppTheme();
  const update = <K extends keyof ProfileDetailsDraft>(
    key: K,
    nextValue: ProfileDetailsDraft[K],
  ) => onChange({ ...value, [key]: nextValue });

  function toggleList(key: "foodPreferences" | "dietaryRestrictions", item: string) {
    const current = value[key];
    update(
      key,
      current.includes(item)
        ? current.filter((currentItem) => currentItem !== item)
        : [...current, item],
    );
  }

  return (
    <View>
      <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
        {t("foodProfileHint")}
      </Text>

      <FormInput
        label={t("phoneNumber")}
        value={value.phoneNumber}
        onChangeText={(text) => update("phoneNumber", text)}
        placeholder={t("phoneNumberPlaceholder")}
        keyboardType="phone-pad"
      />
      <VisibilityToggle
        value={value.showPhoneNumber}
        onChange={(nextValue) => update("showPhoneNumber", nextValue)}
      />

      <FormInput
        label={t("birthday")}
        value={value.birthday}
        onChangeText={(text) => update("birthday", text)}
        placeholder={t("birthdayPlaceholder")}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      <VisibilityToggle
        value={value.showBirthday}
        onChange={(nextValue) => update("showBirthday", nextValue)}
      />

      <FormInput
        label={t("pronouns")}
        value={value.pronouns}
        onChangeText={(text) => update("pronouns", text)}
        placeholder={t("pronounsPlaceholder")}
        maxLength={40}
      />
      <VisibilityToggle
        value={value.showPronouns}
        onChange={(nextValue) => update("showPronouns", nextValue)}
      />

      <ChoiceField
        label={t("foodPreferences")}
        options={FOOD_PREFERENCES}
        selected={value.foodPreferences}
        onToggle={(item) => toggleList("foodPreferences", item)}
      />
      <VisibilityToggle
        value={value.showFoodPreferences}
        onChange={(nextValue) => update("showFoodPreferences", nextValue)}
      />

      <ChoiceField
        label={t("dietaryRestrictions")}
        options={DIETARY_RESTRICTIONS}
        selected={value.dietaryRestrictions}
        onToggle={(item) => toggleList("dietaryRestrictions", item)}
      />
      <VisibilityToggle
        value={value.showDietaryRestrictions}
        onChange={(nextValue) => update("showDietaryRestrictions", nextValue)}
      />

      <FormInput
        label={t("allergies")}
        value={value.allergies}
        onChangeText={(text) => update("allergies", text)}
        placeholder={t("commaSeparatedPlaceholder")}
      />
      <VisibilityToggle
        value={value.showAllergies}
        onChange={(nextValue) => update("showAllergies", nextValue)}
      />

      <FormInput
        label={t("favoriteCuisines")}
        value={value.favoriteCuisines}
        onChangeText={(text) => update("favoriteCuisines", text)}
        placeholder={t("favoriteCuisinesPlaceholder")}
      />
      <VisibilityToggle
        value={value.showFavoriteCuisines}
        onChange={(nextValue) => update("showFavoriteCuisines", nextValue)}
      />

      <Text className="mt-5 text-xs leading-5 text-gray-400">
        {t("allergySafetyNotice")}
      </Text>
    </View>
  );

  function VisibilityToggle({
    value: isVisible,
    onChange: setVisible,
  }: {
    value: boolean;
    onChange: (value: boolean) => void;
  }) {
    return (
      <View className="mt-2 flex-row items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          {t("showOnProfile")}
        </Text>
        <Switch
          value={isVisible}
          onValueChange={setVisible}
          trackColor={{ false: isDark ? "#374151" : "#D1D5DB", true: "#F6C445" }}
          thumbColor={isVisible ? "#FFFFFF" : isDark ? "#9CA3AF" : "#FFFFFF"}
        />
      </View>
    );
  }

  function ChoiceField({
    label,
    options,
    selected,
    onToggle,
  }: {
    label: string;
    options: readonly string[];
    selected: string[];
    onToggle: (value: string) => void;
  }) {
    return (
      <View className="mt-5">
        <Text className="mb-3 text-sm text-gray-500" weight="bold">
          {label}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <TouchableOpacity
                key={option}
                onPress={() => onToggle(option)}
                className={`rounded-full border px-4 py-2.5 ${
                  isSelected
                    ? "border-amber-400 bg-amber-100 dark:bg-amber-900/50"
                    : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                }`}
              >
                <Text className="text-sm text-black dark:text-white">
                  {t(`profileOptions.${option}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
}
