import type { SearchResultItem } from "@findeat/types";

const priority = {
  FRIENDS: 0,
  FOLLOWING: 1,
  REQUESTED: 2,
  FOLLOWED_BY: 3,
  NONE: 4,
};

export function sortSearchResults(items: SearchResultItem[]) {
  return [...items].sort((a, b) => {
    if (a.type !== "USER" || b.type !== "USER") return 0;

    return (
      priority[a.relationship ?? "NONE"] - priority[b.relationship ?? "NONE"]
    );
  });
}
