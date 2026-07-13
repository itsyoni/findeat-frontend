import { api } from "@/lib/api";
import { sortSearchResults } from "@findeat/utils";
import type { SearchResultItem } from "@findeat/types";

export async function searchFriends(
  query: string,
): Promise<SearchResultItem[]> {
  const users = await api.users.searchFriends(query);

  return users.map((user) => ({
    id: user.id,
    type: "USER",
    title: user.displayName?.trim() || user.username,
    subtitle: `@${user.username}`,
    imageUrl: user.avatarUrl ?? null,
    relationship: "FRIENDS",
  }));
}

export async function getSuggestedFriends(): Promise<SearchResultItem[]> {
  const users = await api.users.suggestedFriends();
  return users.map((user) => ({
    id: user.id,
    type: "USER",
    title: user.displayName?.trim() || user.username,
    subtitle: `@${user.username}`,
    imageUrl: user.avatarUrl ?? null,
    relationship: "FRIENDS",
  }));
}

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  const [users, restaurants] = await Promise.all([
    api.users.search(query),
    api.restaurants.searchFindEat(query),
  ]);

  const mappedUsers: SearchResultItem[] = users.map((user) => ({
    id: user.id,
    type: "USER",
    title: user.displayName?.trim() || user.username,
    subtitle: `@${user.username}`,
    imageUrl: user.avatarUrl ?? null,
    relationship: user.relationship,
  }));

  const mappedRestaurants: SearchResultItem[] = restaurants.map(
    (restaurant) => ({
      id: restaurant.id,
      type: "RESTAURANT",
      title: restaurant.name,
      subtitle: restaurant.address ?? restaurant.city ?? undefined,
      imageUrl: restaurant.logoUrl ?? null,
    }),
  );

  return [...sortSearchResults(mappedUsers), ...mappedRestaurants];
}

export async function searchChatTargets(
  query: string,
): Promise<SearchResultItem[]> {
  const [users, restaurants] = await Promise.all([
    api.users.search(query),
    api.restaurants.searchFindEat(query),
  ]);

  const mappedUsers: SearchResultItem[] = users.map((user) => ({
    id: user.id,
    type: "USER",
    title: user.displayName?.trim() || user.username,
    subtitle: `@${user.username}`,
    imageUrl: user.avatarUrl ?? null,
    relationship: user.relationship,
  }));

  const claimedRestaurants: SearchResultItem[] = restaurants
    .filter((restaurant) => restaurant.status === "CLAIMED")
    .map((restaurant) => ({
      id: restaurant.id,
      type: "RESTAURANT",
      title: restaurant.name,
      subtitle: restaurant.address ?? restaurant.city ?? undefined,
      imageUrl: restaurant.logoUrl ?? null,
    }));

  return [...sortSearchResults(mappedUsers), ...claimedRestaurants];
}
