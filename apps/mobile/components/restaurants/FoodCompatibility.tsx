import Text from "@/components/common/AppText";
import type { DishCompatibility, Restaurant } from "@findeat/types";
import {
  CheckCircleIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

function humanizeTag(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function useFoodTagLabel() {
  const { t } = useTranslation("profile");
  return (tag: string) =>
    t(`profileOptions.${tag}`, { defaultValue: humanizeTag(tag) });
}

export function RestaurantCompatibilitySummary({
  compatibility,
}: {
  compatibility: Restaurant["compatibility"];
}) {
  const { t } = useTranslation("restaurants");
  const tagLabel = useFoodTagLabel();

  if (!compatibility) return null;
  const hasWarnings = compatibility.allergenWarnings.length > 0;
  const hasMatches =
    compatibility.dietaryMatches.length > 0 ||
    compatibility.cuisineMatches.length > 0;
  if (!hasWarnings && !hasMatches) return null;

  return (
    <View className="bg-surface px-5 pb-5 dark:bg-black">
      {hasWarnings && (
        <View className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <View className="flex-row items-center gap-2">
            <WarningCircleIcon size={21} color="#DC2626" weight="fill" />
            <Text className="flex-1 font-bold text-red-900 dark:text-red-100">
              {t("allergenWarningTitle")}
            </Text>
          </View>
          <Text className="mt-2 text-sm leading-5 text-red-800 dark:text-red-200">
            {t("restaurantAllergenWarning", {
              allergens: compatibility.allergenWarnings
                .map((match) => tagLabel(match.tag))
                .join(", "),
            })}
          </Text>
          <Text className="mt-2 text-xs leading-4 text-red-700/80 dark:text-red-300/80">
            {t("allergenDisclaimer")}
          </Text>
        </View>
      )}

      {hasMatches && (
        <View className={`${hasWarnings ? "mt-3" : ""} rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/35`}>
          <View className="flex-row items-center gap-2">
            <SparkleIcon size={19} color="#15803D" weight="fill" />
            <Text className="font-bold text-emerald-900 dark:text-emerald-100">
              {t("matchesYourProfile")}
            </Text>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {compatibility.dietaryMatches.map((match) => (
              <View key={`diet-${match.tag}`} className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2 dark:bg-emerald-950">
                <CheckCircleIcon size={14} color="#16A34A" weight="fill" />
                <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {t("hasOptions", { tag: tagLabel(match.tag) })}
                </Text>
              </View>
            ))}
            {compatibility.cuisineMatches.map((match) => (
              <View key={`cuisine-${match.tag}`} className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2 dark:bg-emerald-950">
                <SparkleIcon size={13} color="#16A34A" weight="fill" />
                <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {t("cuisineMatch", { tag: tagLabel(match.tag) })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

export function DishCompatibilityChips({
  compatibility,
  detailed = false,
}: {
  compatibility?: DishCompatibility;
  detailed?: boolean;
}) {
  const { t } = useTranslation("restaurants");
  const tagLabel = useFoodTagLabel();
  if (!compatibility) return null;

  const warningLabels = compatibility.allergenWarnings.map(tagLabel);
  const matchTags = [
    ...compatibility.dietaryMatches,
    ...compatibility.cuisineMatches,
  ];
  if (!warningLabels.length && !matchTags.length) return null;

  return (
    <View className={detailed ? "mt-5 gap-3" : "mt-2 flex-row flex-wrap gap-1.5"}>
      {!!warningLabels.length && (
        <View className={`${detailed ? "p-4" : "px-2 py-1"} flex-row items-center gap-1.5 rounded-2xl bg-red-100 dark:bg-red-950/60`}>
          <WarningCircleIcon size={detailed ? 20 : 13} color="#DC2626" weight="fill" />
          <Text className={`${detailed ? "flex-1 text-sm" : "text-xs"} font-bold text-red-800 dark:text-red-200`}>
            {t("dishContainsAllergens", { allergens: warningLabels.join(", ") })}
          </Text>
        </View>
      )}
      {matchTags.slice(0, detailed ? undefined : 2).map((tag) => (
        <View key={tag} className={`${detailed ? "px-3 py-2" : "px-2 py-1"} flex-row items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60`}>
          <CheckCircleIcon size={detailed ? 15 : 12} color="#16A34A" weight="fill" />
          <Text className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
            {tagLabel(tag)}
          </Text>
        </View>
      ))}
      {detailed && !!warningLabels.length && (
        <Text className="text-xs leading-4 text-gray-500">
          {t("allergenDisclaimer")}
        </Text>
      )}
    </View>
  );
}
