import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import { Profile } from "@findeat/types/profile";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Membership = Profile["restaurantMemberships"][number];

type Props = {
  memberships?: Profile["restaurantMemberships"];
};

export default function ProfileManagedRestaurants({ memberships }: Props) {
  const { t } = useTranslation("profile");
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!memberships?.length) return null;

  const roleLabels = {
    OWNER: t("ownerOf"),
    MANAGER: t("managerAt"),
    STAFF: t("staffAt"),
  } as const;

  const allOwned = memberships.every((membership) => membership.role === "OWNER");
  const summary = t(allOwned ? "ownerOfRestaurants" : "restaurantRoles", {
    count: memberships.length,
  });

  const openRestaurant = (membership: Membership) => {
    setSheetOpen(false);
    requestAnimationFrame(() => {
      router.push({
        pathname: "/restaurants/[id]",
        params: { id: membership.restaurant.id },
      });
    });
  };

  const renderMembership = ({ item }: { item: Membership }) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${roleLabels[item.role]} ${item.restaurant.name}`}
      className="mx-5 flex-row items-center border-b border-gray-100 py-3.5 dark:border-gray-800"
      onPress={() => openRestaurant(item)}
    >
      <Avatar
        uri={item.restaurant.logoUrl}
        username={item.restaurant.name}
        size={46}
        fallbackType="restaurant"
      />

      <View className="ml-3 min-w-0 flex-1">
        <View className="flex-row items-center">
          <Text
            className="shrink text-base font-bold text-black dark:text-white"
            numberOfLines={1}
          >
            {item.restaurant.name}
          </Text>
          <RestaurantBadge size={16} status={item.restaurant.status} />
        </View>
        <Text className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          {roleLabels[item.role]}
          {item.restaurant.city ? ` · ${item.restaurant.city}` : ""}
        </Text>
      </View>

      <CaretRightIcon size={17} color="#9CA3AF" weight="bold" />
    </TouchableOpacity>
  );

  if (memberships.length === 1) {
    const membership = memberships[0];

    return (
      <View className="mt-3 items-center px-5">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${roleLabels[membership.role]} ${membership.restaurant.name}`}
          className="min-w-[220px] max-w-full flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950"
          onPress={() => openRestaurant(membership)}
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
      </View>
    );
  }

  const hiddenLogoCount = Math.max(0, memberships.length - 3);

  return (
    <>
      <View className="mt-3 items-center px-5">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${summary}. ${t("viewRestaurants")}`}
          className="max-w-full flex-row items-center self-center rounded-full bg-gray-100 py-2 pl-2 pr-3 dark:bg-gray-900"
          onPress={() => setSheetOpen(true)}
        >
          <View className="flex-row pr-1">
            {memberships.slice(0, 3).map((membership, index) => (
              <View
                key={membership.restaurant.id}
                style={{ marginLeft: index === 0 ? 0 : -9, zIndex: 3 - index }}
                className="rounded-full border-2 border-gray-100 dark:border-gray-900"
              >
                <Avatar
                  uri={membership.restaurant.logoUrl}
                  username={membership.restaurant.name}
                  size={30}
                  fallbackType="restaurant"
                />
              </View>
            ))}
            {hiddenLogoCount > 0 && (
              <View className="-ml-2 h-[34px] min-w-[34px] items-center justify-center rounded-full border-2 border-gray-100 bg-gray-300 px-1 dark:border-gray-900 dark:bg-gray-700">
                <Text className="text-[10px] font-bold text-gray-700 dark:text-gray-100">
                  +{hiddenLogoCount}
                </Text>
              </View>
            )}
          </View>

          <Text
            className="ml-2 min-w-0 shrink text-sm font-bold text-black dark:text-white"
            numberOfLines={1}
          >
            {summary}
          </Text>
          <CaretRightIcon size={15} color="#9CA3AF" weight="bold" />
        </TouchableOpacity>
      </View>

      <AppBottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        snapPoints={["58%"]}
      >
        <BottomSheetView className="px-5 pb-2 pt-1">
          <Text className="text-center text-xl font-bold text-black dark:text-white">
            {t("managedRestaurantsTitle")}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            {summary}
          </Text>
        </BottomSheetView>
        <BottomSheetFlatList
          data={memberships}
          keyExtractor={(item: Membership) => item.restaurant.id}
          renderItem={renderMembership}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </AppBottomSheet>
    </>
  );
}
