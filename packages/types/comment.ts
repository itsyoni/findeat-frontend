import { UserSummary } from "./user";

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: UserSummary;
};
