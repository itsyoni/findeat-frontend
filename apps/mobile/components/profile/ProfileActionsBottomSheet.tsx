import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { FlagIcon, StorefrontIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  type: "USER" | "RESTAURANT";
  canClaim?: boolean;
  onClaim?: () => void;
};

export default function ProfileActionsBottomSheet({
  open,
  onClose,
  type,
  canClaim,
  onClaim,
}: Props) {
  const { t } = useTranslation(["profile", "restaurants", "common"]);
  const isRestaurant = type === "RESTAURANT";

  return (
    <AppBottomSheet open={open} onClose={onClose} snapPoints={[canClaim ? "34%" : "25%"]}>
      <BottomSheetView className="flex-1 px-5 pb-7 pt-1">
        <Text className="text-xl font-bold text-black dark:text-white">
          {t(isRestaurant ? "restaurants:restaurantOptions" : "profile:profileOptions")}
        </Text>

        <TouchableOpacity className="mt-5 flex-row items-center rounded-2xl bg-gray-100 px-4 py-4 dark:bg-gray-800">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900">
            <FlagIcon size={21} color="#EF4444" weight="fill" />
          </View>
          <Text className="ml-3 font-bold text-red-500">
            {t(isRestaurant ? "restaurants:reportRestaurant" : "profile:reportUser")}
          </Text>
        </TouchableOpacity>

        {canClaim && (
          <TouchableOpacity
            onPress={onClaim}
            className="mt-3 flex-row items-center rounded-2xl bg-orange-50 px-4 py-4 dark:bg-orange-950/30"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950/60">
              <StorefrontIcon size={21} color="#EA580C" weight="fill" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-orange-600 dark:text-orange-400">
                {t("restaurants:claimRestaurant")}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500">
                {t("restaurants:claimRestaurantHint")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </BottomSheetView>
    </AppBottomSheet>
  );
}
