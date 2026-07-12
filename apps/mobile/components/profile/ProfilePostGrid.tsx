import { Post } from "@findeat/types/post";
import { Image, Pressable, View } from "react-native";
import Text from "../common/AppText";

type Props = {
  posts: Post[];
  onPressPost: (postId: string) => void;
};

function getPostImage(post: Post) {
  if (post.type === "REVIEW") {
    return post.reviewPost?.coverImageUrl ?? null;
  }

  return post.contentPost?.imageUrl ?? null;
}

function getPostText(post: Post) {
  if (post.type === "REVIEW") {
    return post.reviewPost?.summary ?? null;
  }

  return post.contentPost?.description ?? null;
}

export default function ProfilePostGrid({ posts, onPressPost }: Props) {
  return (
    <View className="flex-row flex-wrap">
      {posts.map((post) => {
        const imageUrl = getPostImage(post);
        const text = getPostText(post);

        return (
          <Pressable
            key={post.id}
            onPress={() => onPressPost(post.id)}
            className="aspect-square w-1/3 border border-white bg-gray-200"
          >
            {imageUrl ? (
              <>
                <Image
                  source={{ uri: imageUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />

                {post.type === "REVIEW" && (
                  <>
                    <View className="absolute inset-0 bg-[#0000004D]" />

                    <View className="absolute right-2 top-2 rounded-full bg-[#00000099] px-3 py-1">
                      <Text className="text-xs font-bold text-white">
                        ⭐ {post.reviewPost?.overallRating}
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <View className="h-full w-full items-center justify-center bg-gray-900 px-2">
                <Text
                  className="text-center text-xs text-white"
                  numberOfLines={3}
                >
                  {text}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
