import { UserRelationship } from "./profile";

export type ConnectionUser = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  relationship: UserRelationship;
};

export type ConnectionItem = {
  id: string;
  follower?: ConnectionUser;
  following?: ConnectionUser;
};
