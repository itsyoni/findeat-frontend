import { Post } from "@/types/post";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View className="mb-4 rounded-2xl border border-gray-200 p-4">
      <Text className="text-lg font-bold">{post.title}</Text>

      {!!post.description && (
        <Text className="mt-2 text-gray-600">{post.description}</Text>
      )}

      <Text className="mt-3 text-sm text-gray-400">@{post.user.username}</Text>

      <TouchableOpacity
        className="mt-3"
        onPress={() => onToggleLike(post.id, post.isLiked)}
      >
        <Text>
          {post.isLiked ? "❤️" : "🤍"} {post.likesCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onOpenComments(post.id)}>
        <Text>💬 {post.commentsCount}</Text>
      </TouchableOpacity>
    </View>
  );
}
