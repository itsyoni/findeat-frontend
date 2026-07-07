import { api } from "@/lib/api";
import type { Comment } from "@findeat/types";
import { useCallback, useEffect, useState } from "react";

export function useComments(postId?: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      return;
    }

    try {
      setLoading(true);

      const comments = await api.posts.comments(postId);
      setComments(comments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(
    async (content: string) => {
      if (!postId || !content.trim()) return;

      await api.posts.addComment(postId, content.trim());
      await loadComments();
    },
    [postId, loadComments],
  );

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    refresh: loadComments,
    addComment,
  };
}
