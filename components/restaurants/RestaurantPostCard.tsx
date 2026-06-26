import { Restaurant } from "@/types";
import { Image, Text, View } from "react-native";

type Props = {
  post: Restaurant["posts"][number];
};

export default function RestaurantPostCard({ post }: Props) {
  return (
    <View className="mt-4 rounded-2xl border border-gray-200 p-4">
      {!!post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="mb-3 h-48 w-full rounded-2xl bg-gray-100"
          resizeMode="cover"
        />
      )}

      <Text className="font-bold text-black">@{post.user.username}</Text>

      {!!post.description && (
        <Text className="mt-2 text-gray-700">{post.description}</Text>
      )}

      {post.rating != null && (
        <Text className="mt-2 font-bold text-black">⭐ {post.rating}/10</Text>
      )}

      <Text className="mt-3 text-gray-400">
        ❤️ {post._count.likes} · 💬 {post._count.comments}
      </Text>
    </View>
  );
}
