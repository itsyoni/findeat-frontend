import type { SearchResultItem } from "@findeat/types";

const priority = {
  FRIENDS: 0,
  FOLLOWING: 1,
  FOLLOWED_BY: 2,
  NONE: 3,
};

export function sortSearchResults(items: SearchResultItem[]) {
  return [...items].sort((a, b) => {
    if (a.type !== "USER" || b.type !== "USER") return 0;

    return (
      priority[a.relationship ?? "NONE"] - priority[b.relationship ?? "NONE"]
    );
  });
}
