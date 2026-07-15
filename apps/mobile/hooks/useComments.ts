import { api } from "@/lib/api";
import type { Comment } from "@findeat/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useComments(postId?: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadedPostId, setLoadedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const requestIdRef = useRef(0);
  const likingIdsRef = useRef(new Set<string>());
  const pinningRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!postId) return;

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const nextComments = await api.posts.comments(postId);

      if (requestId !== requestIdRef.current) return;

      setComments(nextComments);
      setLoadedPostId(postId);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [postId]);

  const addComment = useCallback(
    async (content: string, replyToId?: string): Promise<void> => {
      const trimmedContent = content.trim();

      if (!postId || !trimmedContent) return;

      try {
        setSubmitting(true);

        const newComment = await api.posts.addComment(
          postId,
          trimmedContent,
          replyToId,
        );

        setComments((previousComments) => [...previousComments, newComment]);

        setLoadedPostId(postId);
      } catch (error) {
        console.error("Failed to add comment", error);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [postId],
  );

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;
    const currentPostId = postId;
    const requestId = ++requestIdRef.current;

    async function fetchComments() {
      try {
        const nextComments = await api.posts.comments(currentPostId);

        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        setComments(nextComments);
        setLoadedPostId(currentPostId);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load comments", error);
        }
      }
    }

    void fetchComments();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const toggleCommentLike = useCallback(
    async (comment: Comment) => {
      if (!postId || likingIdsRef.current.has(comment.id)) return;
      likingIdsRef.current.add(comment.id);
      const nextIsLiked = !comment.isLiked;
      setComments((current) =>
        current.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                isLiked: nextIsLiked,
                likesCount: Math.max(0, item.likesCount + (nextIsLiked ? 1 : -1)),
              }
            : item,
        ),
      );

      try {
        const result = nextIsLiked
          ? await api.posts.likeComment(postId, comment.id)
          : await api.posts.unlikeComment(postId, comment.id);
        setComments((current) =>
          current.map((item) =>
            item.id === comment.id ? { ...item, ...result } : item,
          ),
        );
      } catch (error) {
        setComments((current) =>
          current.map((item) => item.id === comment.id ? comment : item),
        );
        throw error;
      } finally {
        likingIdsRef.current.delete(comment.id);
      }
    },
    [postId],
  );

  const deleteComment = useCallback(
    async (comment: Comment) => {
      if (!postId) return null;
      const result = await api.posts.deleteComment(postId, comment.id);
      setComments((current) =>
        current.filter(
          (item) => item.id !== comment.id && item.parentId !== comment.id,
        ),
      );
      return result;
    },
    [postId],
  );

  const togglePinnedComment = useCallback(
    async (comment: Comment) => {
      if (!postId || !comment.canPin || pinningRef.current) return;
      pinningRef.current = true;
      const wasPinned = comment.isPinned;
      setComments((current) =>
        current.map((item) => ({
          ...item,
          isPinned: wasPinned ? false : item.id === comment.id,
        })),
      );
      try {
        if (wasPinned) {
          await api.posts.unpinComment(postId, comment.id);
        } else {
          await api.posts.pinComment(postId, comment.id);
        }
      } catch (error) {
        setComments((current) =>
          current.map((item) =>
            item.id === comment.id ? comment : item,
          ),
        );
        await refresh();
        throw error;
      } finally {
        pinningRef.current = false;
      }
    },
    [postId, refresh],
  );

  const visibleComments = postId && loadedPostId === postId ? comments : [];

  return {
    comments: visibleComments,
    loading,
    submitting,
    refresh,
    addComment,
    toggleCommentLike,
    deleteComment,
    togglePinnedComment,
  };
}
