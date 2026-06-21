import { Post } from "@/types/post";
import { Dimensions, FlatList } from "react-native";
import ContentFeedPost from "./ContentFeedPost";

const { height } = Dimensions.get("window");

type Props = {
  posts: Post[];
  refreshing: boolean;
  onRefresh: () => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
};

export default function ContentFeedList({
  posts,
  refreshing,
  onRefresh,
  onToggleLike,
  onOpenComments,
}: Props) {
  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height - 120}
      decelerationRate="fast"
      renderItem={({ item }) => (
        <ContentFeedPost
          post={item}
          height={height - 120}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
        />
      )}
    />
  );
}
