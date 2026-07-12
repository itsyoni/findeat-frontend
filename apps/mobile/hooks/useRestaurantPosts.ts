import { api } from '@/lib/api';
import type { RestaurantPostSection, RestaurantPostsPage } from '@findeat/types';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useRestaurantPosts(
  restaurantId: string | undefined,
  section: RestaurantPostSection,
  enabled = true,
) {
  return useInfiniteQuery<RestaurantPostsPage>({
    queryKey: ['restaurant-posts', restaurantId, section],
    queryFn: ({ pageParam }) =>
      api.restaurants.posts(restaurantId!, section, pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    enabled: enabled && !!restaurantId,
  });
}
