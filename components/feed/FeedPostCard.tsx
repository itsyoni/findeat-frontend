import Avatar from "@/components/Avatar";
import { Post } from "@/types/post";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  post: Post;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
};

export default function FeedPostCard({
  post,
  onToggleLike,
  onOpenComments,
}: Props) {
  return (
    <View className="mb-6 border-b border-gray-100 bg-white pb-6">
      <View className="mb-3 flex-row items-center gap-3 px-4">
        <Avatar
          uri={post.user.avatarUrl}
          username={post.user.username}
          size={42}
        />

        <View>
          <Text className="font-bold text-black">@{post.user.username}</Text>
          <Text className="text-xs text-gray-400">Content post</Text>
          {!!post.restaurant && (
            <Text className="text-xs text-gray-500">
              📍 {post.restaurant.name}
              {post.restaurant.city ? ` · ${post.restaurant.city}` : ""}
            </Text>
          )}
          {post.type === "REVIEW" && post.rating != null && (
            <Text className="mt-2 text-lg font-bold text-black">
              ⭐ {post.rating}/10
            </Text>
          )}
        </View>
      </View>

      {!!post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="h-96 w-full bg-gray-100"
          resizeMode="cover"
        />
      )}

      <View className="px-4 pt-3">
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => onToggleLike(post.id, post.isLiked)}>
            <Text className="text-xl">
              {post.isLiked ? "❤️" : "🤍"} {post.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onOpenComments(post.id)}>
            <Text className="text-xl">💬 {post.commentsCount}</Text>
          </TouchableOpacity>
        </View>

        {!!post.title && (
          <Text className="mt-3 text-base font-bold text-black">
            {post.title}
          </Text>
        )}

        {!!post.description && (
          <Text className="mt-1 text-gray-700">{post.description}</Text>
        )}
      </View>
    </View>
  );
}
