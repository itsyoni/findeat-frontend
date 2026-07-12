import { TouchableOpacity } from "react-native";
import Text from "../common/AppText";
import { useTranslation } from "react-i18next";

type Props = {
  isFollowing: boolean;
  onPress: () => void;
  className?: string;
};

export default function RestaurantFollowButton({
  isFollowing,
  onPress,
  className,
}: Props) {
  const { t } = useTranslation("restaurants");
  return (
    <TouchableOpacity
      className={`${className ?? "mt-5 w-44"} rounded-xl py-3 ${
        isFollowing ? "bg-gray-100 dark:bg-gray-800" : "bg-black dark:bg-white"
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-center font-bold ${
          isFollowing
            ? "text-black dark:text-white"
            : "text-white dark:text-black"
        }`}
      >
        {isFollowing ? t("following") : t("follow")}
      </Text>
    </TouchableOpacity>
  );
}
