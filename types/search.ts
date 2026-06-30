export type SearchEntityType = "USER" | "RESTAURANT" | "DISH";

export type UserRelationship = "NONE" | "FOLLOWING" | "FOLLOWED_BY" | "FRIENDS";

export type SearchResultItem = {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  relationship?: UserRelationship;
};

export type RecentSearchItem = SearchResultItem;
