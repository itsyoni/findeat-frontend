import { Post } from "@/types/post";
import { Image, Pressable, View } from "react-native";
import Text from "../AppText";

type Props = {
  posts: Post[];
  onPressPost: (postId: string) => void;
};

export default function ProfilePostGrid({ posts, onPressPost }: Props) {
  return (
    <View className="flex-row flex-wrap">
      {posts.map((post) => (
        <Pressable
          key={post.id}
          onPress={() => onPressPost(post.id)}
          className="aspect-square w-1/3 border border-white bg-gray-200"
        >
          {post.imageUrl ? (
            <Image
              source={{ uri: post.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-gray-900 px-2">
              <Text
                className="text-center text-xs text-white"
                numberOfLines={3}
              >
                {post.description}
              </Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}
