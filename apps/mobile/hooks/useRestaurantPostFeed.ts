import { api } from "@/lib/api";
import type { FeedPage, RestaurantPostSection } from "@findeat/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useRestaurantPostFeed(
  restaurantId: string | undefined,
  section: RestaurantPostSection | undefined,
  anchorId?: string,
) {
  return useInfiniteQuery<FeedPage>({
    queryKey: ["restaurant-post-feed", restaurantId, section, anchorId],
    queryFn: ({ pageParam }) =>
      api.restaurants.postFeed(
        restaurantId!,
        section!,
        pageParam as string | undefined,
        pageParam ? undefined : anchorId,
      ),
    initialPageParam: undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: !!restaurantId && !!section,
  });
}
