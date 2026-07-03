import { UserRelationship } from "./profile";

export type SearchEntityType = "USER" | "RESTAURANT" | "DISH";

export type SearchResultItem = {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  relationship?: UserRelationship;
};

export type RecentSearchItem = SearchResultItem;
