import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Profile } from "@findeat/types/profile";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { useState } from "react";

type Props = {
  memberships?: Profile["restaurantMemberships"];
};

export default function ProfileManagedRestaurants({ memberships }: Props) {
  const { t } = useTranslation("profile");
  const [expanded, setExpanded] = useState(false);

  if (!memberships?.length) return null;

  const roleLabels = {
    OWNER: t("ownerOf"),
    MANAGER: t("managerAt"),
    STAFF: t("staffAt"),
  } as const;

  const hasMultiple = memberships.length > 1;
  const allOwned = memberships.every((membership) => membership.role === "OWNER");

  const membershipRows = memberships.map((membership) => (
    <TouchableOpacity
      key={membership.restaurant.id}
      accessibilityRole="button"
      accessibilityLabel={`${roleLabels[membership.role]} ${membership.restaurant.name}`}
      className="min-w-[220px] max-w-full flex-row items-center self-center rounded-2xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950"
      onPress={() =>
        router.push({
          pathname: "/restaurants/[id]",
          params: { id: membership.restaurant.id },
        })
      }
    >
      <Avatar
        uri={membership.restaurant.logoUrl}
        username={membership.restaurant.name}
        size={36}
        fallbackType="restaurant"
      />

      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {roleLabels[membership.role]}
        </Text>
        <View className="mt-0.5 flex-row items-center">
          <Text
            className="shrink text-sm font-bold text-black dark:text-white"
            numberOfLines={1}
          >
            {membership.restaurant.name}
          </Text>
          <RestaurantBadge size={15} status={membership.restaurant.status} />
        </View>
      </View>

      <CaretRightIcon size={16} color="#9CA3AF" weight="bold" />
    </TouchableOpacity>
  ));

  if (!hasMultiple) {
    return <View className="mt-3 items-center px-5">{membershipRows}</View>;
  }

  return (
    <View className="mt-3 items-center gap-2.5 px-5">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-w-[250px] max-w-full flex-row items-center self-center rounded-2xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950"
        onPress={() => setExpanded((current) => !current)}
      >
        <View className="flex-row pr-1">
          {memberships.slice(0, 3).map((membership, index) => (
            <View
              key={membership.restaurant.id}
              style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 3 - index }}
              className="rounded-full border-2 border-white dark:border-gray-950"
            >
              <Avatar
                uri={membership.restaurant.logoUrl}
                username={membership.restaurant.name}
                size={34}
                fallbackType="restaurant"
              />
            </View>
          ))}
        </View>

        <View className="ml-2 min-w-0 flex-1">
          <Text className="text-sm font-bold text-black dark:text-white">
            {t(allOwned ? "ownerOfRestaurants" : "restaurantRoles", {
              count: memberships.length,
            })}
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
            {memberships.map((item) => item.restaurant.name).join(" · ")}
          </Text>
        </View>

        {expanded ? (
          <CaretUpIcon size={16} color="#9CA3AF" weight="bold" />
        ) : (
          <CaretDownIcon size={16} color="#9CA3AF" weight="bold" />
        )}
      </TouchableOpacity>

      {expanded && (
        <View className="items-center gap-2.5">
          {membershipRows}
        </View>
      )}
    </View>
  );
}
