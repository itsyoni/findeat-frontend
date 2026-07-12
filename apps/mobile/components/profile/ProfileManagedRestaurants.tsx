import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { Profile } from "@findeat/types/profile";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";

type Props = {
  memberships?: Profile["restaurantMemberships"];
};

export default function ProfileManagedRestaurants({ memberships }: Props) {
  if (!memberships?.length) return null;

  return (
    <View className="mt-3 items-center gap-2">
      {memberships.map((membership) => (
        <TouchableOpacity
          key={membership.restaurant.id}
          className="flex-row items-center self-center rounded-full bg-[#F5F4F5] py-2"
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
            size={24}
            fallbackType="restaurant"
          />

          <View className="ml-2 flex-row items-center">
            <Text className="rounded-full bg-[#F7D786] px-2 py-0.5 text-xs font-bold text-black">
              {membership.role}
            </Text>

            <Text className="ml-2 text-sm font-semibold text-black">
              {membership.restaurant.name}
            </Text>
            <RestaurantBadge size={14} status={membership.restaurant.status} />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
