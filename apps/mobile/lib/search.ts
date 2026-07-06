import { api } from "@/lib/api";
import { SearchResultItem } from "@findeat/types/search";

function sortSearchResults(items: SearchResultItem[]) {
  const priority = {
    FRIENDS: 0,
    FOLLOWING: 1,
    FOLLOWED_BY: 2,
    NONE: 3,
  };

  return [...items].sort((a, b) => {
    if (a.type !== "USER" || b.type !== "USER") return 0;

    return (
      priority[a.relationship ?? "NONE"] - priority[b.relationship ?? "NONE"]
    );
  });
}

export async function searchFriends(
  query: string,
): Promise<SearchResultItem[]> {
  const users = await api.users.searchFriends(query);

  return users.map(
    (user): SearchResultItem => ({
      id: user.id,
      type: "USER",
      title: `@${user.username}`,
      subtitle: user.displayName ?? undefined,
      imageUrl: user.avatarUrl ?? null,
      relationship: "FRIENDS",
    }),
  );
}

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  const [users, restaurants] = await Promise.all([
    api.users.search(query),
    api.restaurants.searchFindEat(query),
  ]);

  const mappedUsers: SearchResultItem[] = users.map(
    (user): SearchResultItem => ({
      id: user.id,
      type: "USER",
      title: `@${user.username}`,
      subtitle: user.displayName ?? undefined,
      imageUrl: user.avatarUrl ?? null,
      relationship: user.relationship,
    }),
  );

  const mappedRestaurants: SearchResultItem[] = restaurants.map(
    (restaurant): SearchResultItem => ({
      id: restaurant.id,
      type: "RESTAURANT",
      title: restaurant.name,
      subtitle: restaurant.address ?? restaurant.city ?? undefined,
      imageUrl: restaurant.logoUrl ?? null,
    }),
  );

  return [...sortSearchResults(mappedUsers), ...mappedRestaurants];
}
