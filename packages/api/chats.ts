import { Chat, Message, SendMessagePayload } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createChatsApi(api: AxiosInstance) {
  return {
    async list() {
      const { data } = await api.get<Chat[]>("/chats");
      return data;
    },

    async findRestaurantConversation(restaurantId: string) {
      const { data } = await api.get<Chat[]>("/chats");
      return (
        data.find(
          (chat) =>
            chat.type === "RESTAURANT" &&
            chat.restaurantId === restaurantId,
        ) ?? null
      );
    },

    async sendDirectMessage(userId: string, content: string) {
      const { data } = await api.post(`/chats/direct/${userId}/messages`, {
        content,
      });

      return data;
    },

    async sendRestaurantMessage(restaurantId: string, content: string) {
      const { data } = await api.post(
        `/chats/restaurants/${restaurantId}/messages`,
        { content },
      );

      return data;
    },

    async createGroup(payload: { title: string; participantIds: string[] }) {
      const { data } = await api.post("/chats/groups", payload);
      return data;
    },

    async addMembers(conversationId: string, participantIds: string[]) {
      const { data } = await api.post(`/chats/${conversationId}/members`, {
        participantIds,
      });

      return data;
    },

    async get(id: string) {
      const { data } = await api.get<Chat>(`/chats/${id}`);
      return data;
    },

    async messages(id: string) {
      const { data } = await api.get<Message[]>(`/chats/${id}/messages`);
      return data;
    },

    async sendMessage(id: string, payload: SendMessagePayload) {
      const { data } = await api.post<Message>(
        `/chats/${id}/messages`,
        payload,
      );
      return data;
    },

    async deleteMessage(id: string, messageId: string, scope: "me" | "everyone") {
      const { data } = await api.delete<{
        messageId: string;
        scope: "me" | "everyone";
        deletedAt?: string;
      }>(`/chats/${id}/messages/${messageId}`, { params: { scope } });
      return data;
    },

    async startDirectConversation(userId: string) {
      const { data } = await api.post<{ id: string }>(`/chats/start/${userId}`);

      return data;
    },
  };
}
