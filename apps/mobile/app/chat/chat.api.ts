import { api } from "@/lib/api";

export default async function fetchConversations() {
  const response = await api.get("/chat/conversations");
  return response.data;
}

export async function fetchMessages(conversationId: string) {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );
  return response.data;
}

export async function sendConversationMessage(
  conversationId: string,
  payload: { content: string; clientId?: string },
) {
  const response = await api.post(
    `/chat/conversations/${conversationId}/messages`,
    payload,
  );
  return response.data;
}
