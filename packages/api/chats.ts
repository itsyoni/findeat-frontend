import type { AxiosInstance } from "axios";

export function createChatsApi(api: AxiosInstance) {
  return {
    async list() {
      const { data } = await api.get("/chats");
      return data;
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
      const { data } = await api.get(`/chats/${id}`);
      return data;
    },

    async messages(id: string) {
      const { data } = await api.get(`/chats/${id}/messages`);
      return data;
    },

    async sendMessage(id: string, content: string) {
      const { data } = await api.post(`/chats/${id}/messages`, { content });
      return data;
    },

    async startDirectConversation(userId: string) {
      const { data } = await api.post<{ id: string }>(`/chats/start/${userId}`);

      return data;
    },
  };
}
