export type RecentSearchItem = {
  id: string;
  type: "user" | "restaurant" | "dish";
  title: string;
  avatarUrl?: string | null;
  subtitle?: string;
};
