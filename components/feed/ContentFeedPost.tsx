import Avatar from "@/components/Avatar";
import { Post } from "@/types/post";
import { Image, Text, TouchableOpacity, View } from "react-native";

type Props = {
  post: Post;
  height: number;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
};

export default function ContentFeedPost({
  post,
  height,
  onToggleLike,
  onOpenComments,
}: Props) {
  return (
    <View style={{ height }} className="bg-black">
      {post.imageUrl ? (
        <Image
          source={{ uri: post.imageUrl }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center bg-gray-900">
          <Text className="px-8 text-center text-2xl font-bold text-white">
            {post.description}
          </Text>
        </View>
      )}

      <View className="absolute bottom-8 left-4 right-20">
        <View className="mb-3 flex-row items-center gap-3">
          <Avatar
            uri={post.user.avatarUrl}
            username={post.user.username}
            size={42}
          />

          <Text className="font-bold text-white">@{post.user.username}</Text>
        </View>

        {!!post.description && (
          <Text className="text-base text-white">{post.description}</Text>
        )}
      </View>

      <View className="absolute bottom-10 right-4 items-center gap-5">
        <TouchableOpacity onPress={() => onToggleLike(post.id, post.isLiked)}>
          <Text className="text-3xl">{post.isLiked ? "❤️" : "🤍"}</Text>
          <Text className="text-center text-xs font-bold text-white">
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onOpenComments(post.id)}>
          <Text className="text-3xl">💬</Text>
          <Text className="text-center text-xs font-bold text-white">
            {post.commentsCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
