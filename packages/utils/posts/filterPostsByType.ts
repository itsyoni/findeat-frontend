import type { PostType } from "@findeat/types";

export function filterPostsByType<T extends { type: PostType }>(
  posts: T[] | undefined,
  type: PostType,
) {
  return posts?.filter((post) => post.type === type) ?? [];
}
