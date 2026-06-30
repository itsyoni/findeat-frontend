import { api } from "@/lib/api";
import { SearchResultItem } from "@/types/search";

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
  const res = await api.get(
    `/users/friends/search?q=${encodeURIComponent(query)}`,
  );

  return res.data.map((user: any) => ({
    id: user.id,
    type: "USER",
    title: `@${user.username}`,
    subtitle: user.displayName,
    imageUrl: user.avatarUrl,
    relationship: "FRIENDS",
  }));
}

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  const [usersRes, restaurantsRes] = await Promise.all([
    api.get(`/users/search?q=${encodeURIComponent(query)}`),
    api.get(`/restaurants/search/findeat?q=${encodeURIComponent(query)}`),
  ]);

  const users: SearchResultItem[] = usersRes.data.map((user: any) => ({
    id: user.id,
    type: "USER",
    title: `@${user.username}`,
    subtitle: user.displayName,
    imageUrl: user.avatarUrl,
    relationship: user.relationship,
  }));

  const restaurants: SearchResultItem[] = restaurantsRes.data.map(
    (restaurant: any) => ({
      id: restaurant.id,
      type: "RESTAURANT",
      title: restaurant.name,
      subtitle: restaurant.address || restaurant.city,
      imageUrl: restaurant.logoUrl,
    }),
  );

  return [...sortSearchResults(users), ...restaurants];
}
