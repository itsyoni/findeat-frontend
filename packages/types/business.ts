export type BusinessAccount = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
};

export type BusinessDashboardSection =
  | "overview"
  | "dashboard"
  | "menu"
  | "reviews"
  | "messages"
  | "notifications"
  | "profile"
  | "support"
  | "settings"
  | "admin";

export type AdminDashboardSection =
  | "claims"
  | "addresses"
  | "moderation"
  | "ownership"
  | "support"
  | "updates"
  | "admins"
  | "settings";
