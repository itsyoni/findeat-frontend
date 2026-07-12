import type { UserRelationship } from "@findeat/types";
import type { SearchEntityType } from "@findeat/types";

export function isFollowingRelationship(
  relationship?: UserRelationship | null,
) {
  return relationship === "FOLLOWING" || relationship === "FRIENDS";
}

export function isFriendRelationship(relationship?: UserRelationship | null) {
  return relationship === "FRIENDS";
}

export function getRelationshipButtonText(
  relationship?: UserRelationship | null,
) {
  switch (relationship) {
    case "FRIENDS":
      return "Friends";
    case "FOLLOWING":
      return "Following";
    case "FOLLOWED_BY":
      return "Follow back";
    default:
      return "Follow";
  }
}

export function getRelationshipButtonColor(
  relationship?: UserRelationship | null,
) {
  switch (relationship) {
    case "FRIENDS":
      return "bg-[#F7D786]";
    case "FOLLOWING":
      return "bg-gray-900 dark:bg-gray-100";
    default:
      return "bg-black dark:bg-white";
  }
}

export function getRelationshipLabel(relationship?: UserRelationship | null) {
  switch (relationship) {
    case "FRIENDS":
      return "Friend";
    case "FOLLOWING":
      return "Following";
    case "FOLLOWED_BY":
      return "Follows you";
    default:
      return undefined;
  }
}

export function getNextRelationshipAfterToggle(
  relationship?: UserRelationship | null,
): UserRelationship {
  if (relationship === "FRIENDS") return "FOLLOWED_BY";
  if (relationship === "FOLLOWING") return "NONE";

  return "FOLLOWING";
}

export function getSearchEntityLabel(type: SearchEntityType) {
  switch (type) {
    case "USER":
      return "User";
    case "RESTAURANT":
      return "Restaurant";
    case "DISH":
      return "Dish";
  }
}
