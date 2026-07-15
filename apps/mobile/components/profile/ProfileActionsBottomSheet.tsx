import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CameraIcon,
  FlagIcon,
  NotePencilIcon,
  ProhibitIcon,
  StorefrontIcon,
} from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  type: "USER" | "RESTAURANT";
  canClaim?: boolean;
  onClaim?: () => void;
  onCreateReview?: () => void;
  onCreateContent?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
};

export default function ProfileActionsBottomSheet({
  open,
  onClose,
  type,
  canClaim,
  onClaim,
  onCreateReview,
  onCreateContent,
  onBlock,
  onReport,
}: Props) {
  const { t } = useTranslation(["profile", "restaurants", "common"]);
  const isRestaurant = type === "RESTAURANT";

  return (
    <AppBottomSheet
      open={open}
      onClose={onClose}
      snapPoints={[isRestaurant ? (canClaim ? "62%" : "52%") : "38%"]}
    >
      <BottomSheetView className="flex-1 px-5 pb-7 pt-1">
        <Text className="text-xl font-bold text-black dark:text-white">
          {t(isRestaurant ? "restaurants:restaurantOptions" : "profile:profileOptions")}
        </Text>

        {isRestaurant && (
          <View className="mt-5 gap-3">
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onCreateReview}
              className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FFF4D6] dark:bg-amber-950/50">
                <NotePencilIcon size={22} color="#B7791F" weight="fill" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-black dark:text-white">
                  {t("restaurants:writeReview")}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {t("restaurants:writeReviewHint")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onCreateContent}
              className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/40">
                <CameraIcon size={22} color="#FF5B35" weight="fill" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-black dark:text-white">
                  {t("restaurants:createQuickPost")}
                </Text>
                <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {t("restaurants:createQuickPostHint")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={onReport}
          className={`${isRestaurant ? "mt-3" : "mt-5"} flex-row items-center rounded-2xl bg-gray-100 px-4 py-4 dark:bg-gray-800`}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-gray-900">
            <FlagIcon size={21} color="#EF4444" weight="fill" />
          </View>
          <Text className="ml-3 font-bold text-red-500">
            {t(isRestaurant ? "restaurants:reportRestaurant" : "profile:reportUser")}
          </Text>
        </TouchableOpacity>

        {!isRestaurant && (
          <TouchableOpacity
            onPress={onBlock}
            className="mt-3 flex-row items-center rounded-2xl bg-red-50 px-4 py-4 dark:bg-red-950/30"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-red-950/60">
              <ProhibitIcon size={21} color="#EF4444" weight="bold" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-red-500">
                {t("profile:blockUser")}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {t("profile:blockUserHint")}
              </Text>
            </View>
          </TouchableOpacity>
        )}

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
