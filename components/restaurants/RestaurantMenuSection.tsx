import { Restaurant } from "@/types";
import { View } from "react-native";
import Text from "../AppText";
import DishCard from "./DishCard";

type Props = {
  restaurant: Restaurant;
  featuredItems: Restaurant["menus"][number]["items"];
};

export default function RestaurantMenuSection({
  restaurant,
  featuredItems,
}: Props) {
  return (
    <View>
      {featuredItems.length > 0 && (
        <>
          <Text className="mt-6 text-xl font-bold text-black">
            Featured dishes
          </Text>

          {featuredItems.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </>
      )}

      <Text className="mt-8 text-xl font-bold text-black">Menu</Text>

      {restaurant.menus.length === 0 ? (
        <Text className="mt-2 text-gray-500">No menu yet</Text>
      ) : (
        restaurant.menus.map((menu) => (
          <View key={menu.id} className="mt-5">
            <Text className="text-lg font-bold text-black">{menu.title}</Text>

            {!!menu.description && (
              <Text className="mt-1 text-gray-500">{menu.description}</Text>
            )}

            {menu.items.length === 0 ? (
              <Text className="mt-2 text-gray-500">No dishes yet</Text>
            ) : (
              menu.items.map((item) => <DishCard key={item.id} item={item} />)
            )}
          </View>
        ))
      )}
    </View>
  );
}
