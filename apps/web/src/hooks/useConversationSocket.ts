import { useEffect } from "react";
import type { RestaurantMessage } from "@findeat/types";
import { io } from "socket.io-client";
import { API_URL } from "../lib/api";

type ConversationSocketOptions = {
  conversationId: string | null;
  userId: string;
  onConnected: () => void;
  onMessage: (message: RestaurantMessage) => void;
};

export function useConversationSocket({
  conversationId,
  userId,
  onConnected,
  onMessage,
}: ConversationSocketOptions) {
  useEffect(() => {
    if (!conversationId || !userId) return;

    const socket = io(API_URL, { auth: { userId } });

    socket.on("connect", () => {
      socket.emit("join_conversation", { conversationId });
      onConnected();
    });
    socket.on("receive_message", onMessage);

    return () => {
      socket.disconnect();
    };
  }, [conversationId, onConnected, onMessage, userId]);
}
