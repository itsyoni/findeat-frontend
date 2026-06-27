import Avatar from "@/components/Avatar";
import { Post } from "@/types/post";
import { router } from "expo-router";
import { ChatCircleIcon, HeartIcon, ShareIcon } from "phosphor-react-native";
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
  const isBusinessPost = post.user.accountType === "BUSINESS";

  return (
    <View style={{ height }}>
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
        <TouchableOpacity
          className="mb-3 flex-row items-center gap-3"
          activeOpacity={0.8}
          onPress={() => {
            if (post.user.accountType === "BUSINESS" && post.restaurant) {
              router.push({
                pathname: "/restaurants/[id]",
                params: { id: post.restaurant.id },
              });
            } else {
              router.push({
                pathname: "/users/[id]",
                params: { id: post.user.id },
              });
            }
          }}
        >
          <Avatar
            uri={post.user.avatarUrl}
            username={post.user.username}
            size={42}
          />

          <View>
            <Text className="font-bold text-white">@{post.user.username}</Text>

            {isBusinessPost && (
              <Text className="mt-1 text-xs font-semibold text-[#F7D786]">
                Official restaurant
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {!!post.restaurant?.name && (
          <Text className="mb-2 text-sm font-semibold text-white">
            📍 {post.restaurant.name}
          </Text>
        )}

        {!!post.description && (
          <Text className="text-base text-white">{post.description}</Text>
        )}
      </View>

      <View className="absolute bottom-10 right-4 items-center gap-5">
        <TouchableOpacity onPress={() => onToggleLike(post.id, post.isLiked)}>
          <HeartIcon
            weight={post.isLiked ? "fill" : "regular"}
            color={post.isLiked ? "red" : "white"}
            size={35}
          />
          <Text className="text-center text-lg text-white">
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onOpenComments(post.id)}>
          <ChatCircleIcon weight="regular" color="white" size={35} />
          <Text className="text-center text-lg text-white">
            {post.commentsCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <ShareIcon weight="regular" color="white" size={35} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
