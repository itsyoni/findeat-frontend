import { Restaurant } from "@findeat/types";
import { View } from "react-native";
import Text from "../common/AppText";
import RestaurantPostCard from "./RestaurantPostCard";

type Props = {
  posts: Restaurant["posts"];
  emptyText: string;
};

export default function RestaurantPostsSection({ posts, emptyText }: Props) {
  if (posts.length === 0) {
    return <Text className="mt-6 text-gray-500">{emptyText}</Text>;
  }

  return (
    <View className="pt-2">
      {posts.map((post) => (
        <RestaurantPostCard key={post.id} post={post} />
      ))}
    </View>
  );
}
