import AsyncStorage from "@react-native-async-storage/async-storage";

export type ChatDraft = {
  content: string;
  updatedAt: string;
};

function prefix(userId: string) {
  return `findeat_chat_draft_${userId}_`;
}

function key(userId: string, conversationKey: string) {
  return `${prefix(userId)}${conversationKey}`;
}

export async function loadChatDraft(userId: string, conversationKey: string) {
  const value = await AsyncStorage.getItem(key(userId, conversationKey));
  return value ? (JSON.parse(value) as ChatDraft) : null;
}

export async function saveChatDraft(
  userId: string,
  conversationKey: string,
  content: string,
) {
  if (!content.trim()) {
    await clearChatDraft(userId, conversationKey);
    return;
  }
  await AsyncStorage.setItem(
    key(userId, conversationKey),
    JSON.stringify({ content, updatedAt: new Date().toISOString() }),
  );
}

export async function clearChatDraft(
  userId: string,
  conversationKey: string,
) {
  await AsyncStorage.removeItem(key(userId, conversationKey));
}

export async function loadChatDrafts(userId: string) {
  const draftPrefix = prefix(userId);
  const keys = (await AsyncStorage.getAllKeys()).filter((item) =>
    item.startsWith(draftPrefix),
  );
  if (!keys.length) return {} as Record<string, ChatDraft>;

  const values = await AsyncStorage.multiGet(keys);
  return Object.fromEntries(
    values.flatMap(([storageKey, value]) => {
      if (!value) return [];
      const conversationKey = storageKey.slice(draftPrefix.length);
      return [[conversationKey, JSON.parse(value) as ChatDraft]];
    }),
  );
}
