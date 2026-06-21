import { Post } from "@/types/post";
import { FlatList } from "react-native";
import ContentFeedPost from "./ContentFeedPost";

type Props = {
  posts: Post[];
  height: number;
  refreshing: boolean;
  onRefresh: () => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenComments: (postId: string) => void;
};

export default function ContentFeedList({
  posts,
  height,
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
      decelerationRate="fast"
      renderItem={({ item }) => (
        <ContentFeedPost
          post={item}
          height={height}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
        />
      )}
    />
  );
}
