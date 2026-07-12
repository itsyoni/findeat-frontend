import { api } from "@/lib/api";
import type { FeedPage, Post, PostType } from "@findeat/types";
import type { UserRestaurant } from "@findeat/types";
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

const feedPageSize = 10;

export const feedQueryKey = (type: PostType) => ["feed", type] as const;

export function useFeed(type: PostType, enabled = true) {
  return useInfiniteQuery({
    queryKey: feedQueryKey(type),
    queryFn: ({ pageParam }) =>
      api.posts.feed(type, {
        cursor: pageParam,
        limit: feedPageSize,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
    staleTime: 2 * 60 * 1_000,
    gcTime: 30 * 60 * 1_000,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}

export function updatePostInFeedCache(
  queryClient: QueryClient,
  updatePost: (post: Post) => Post | null,
) {
  queryClient.setQueriesData<InfiniteData<FeedPage>>(
    { queryKey: ["feed"] },
    (current) => {
      if (!current) return current;

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.flatMap((post) => {
            const updated = updatePost(post);
            return updated ? [updated] : [];
          }),
        })),
      };
    },
  );
}

export function updateRestaurantStatusInFeedCache(
  queryClient: QueryClient,
  restaurantId: string,
  status: Partial<UserRestaurant>,
) {
  updatePostInFeedCache(queryClient, (post) => {
    if (post.restaurant?.id !== restaurantId) return post;

    const currentStatus = post.restaurant.userSaves?.[0];
    const nextStatus = {
      id: currentStatus?.id ?? "",
      wantToTry: currentStatus?.wantToTry ?? false,
      visited: currentStatus?.visited ?? false,
      favorite: currentStatus?.favorite ?? false,
      ...currentStatus,
      ...status,
    };
    const wasSaved = !!(
      currentStatus?.wantToTry ||
      currentStatus?.visited ||
      currentStatus?.favorite
    );
    const isSaved = !!(
      nextStatus.wantToTry ||
      nextStatus.visited ||
      nextStatus.favorite
    );

    return {
      ...post,
      restaurantSavesCount: Math.max(
        0,
        (post.restaurantSavesCount ?? 0) +
          (wasSaved === isSaved ? 0 : isSaved ? 1 : -1),
      ),
      restaurant: {
        ...post.restaurant,
        userSaves: [nextStatus],
      },
    };
  });
}

export function prependPostToFeedCache(
  queryClient: QueryClient,
  post: Post,
) {
  queryClient.setQueryData<InfiniteData<FeedPage>>(
    feedQueryKey(post.type),
    (current) => {
      if (!current) {
        return {
          pages: [{ items: [post], nextCursor: null }],
          pageParams: [undefined],
        };
      }

      const [firstPage, ...remainingPages] = current.pages;

      return {
        ...current,
        pages: [
          {
            ...firstPage,
            items: [post, ...firstPage.items.filter((item) => item.id !== post.id)],
          },
          ...remainingPages,
        ],
      };
    },
  );
}
