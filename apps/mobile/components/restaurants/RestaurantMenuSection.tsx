import { Restaurant } from "@findeat/types";
import { View } from "react-native";
import Text from "../common/AppText";
import DishCard from "./DishCard";
import { BookOpenIcon } from "phosphor-react-native";
import { useAppTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

type Props = {
  restaurant: Restaurant;
  featuredItems: Restaurant["menus"][number]["items"];
};

export default function RestaurantMenuSection({
  restaurant,
  featuredItems,
}: Props) {
  const { isDark } = useAppTheme();
  const { t } = useTranslation("restaurants");

  if (restaurant.menus.length === 0) {
    return (
      <View className="items-center justify-center py-16">
        <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 dark:border-gray-700">
          <BookOpenIcon size={28} color={isDark ? "#FFF" : "#111"} />
        </View>
        <Text className="mt-4 text-center text-gray-500">{t("noMenu")}</Text>
      </View>
    );
  }

  return (
    <View>
      {featuredItems.length > 0 && (
        <>
          <Text className="mt-6 text-xl font-bold text-black dark:text-white">
            {t("featuredDishes")}
          </Text>

          {featuredItems.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </>
      )}

      <Text className="mt-8 text-xl font-bold text-black dark:text-white">
        {t("menu")}
      </Text>

      {restaurant.menus.map((menu) => (
          <View key={menu.id} className="mt-5">
            <Text className="text-lg font-bold text-black dark:text-white">
              {menu.title}
            </Text>

            {!!menu.description && (
              <Text className="mt-1 text-gray-500">{menu.description}</Text>
            )}

            {menu.items.length === 0 ? (
              <Text className="mt-2 text-gray-500">{t("noDishes")}</Text>
            ) : (
              menu.items.map((item) => <DishCard key={item.id} item={item} />)
            )}
          </View>
        ))}
    </View>
  );
}
