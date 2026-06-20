export type Chat = {
  id: string;
  type: "DIRECT" | "GROUP";
  title?: string | null;

  lastMessage?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;

  unreadCount: number;
  pinned: boolean;
  muted: boolean;

  participants: {
    userId: string;
    lastReadAt?: string | null;
    pinned?: boolean;
    muted?: boolean;
    user: {
      id: string;
      username: string;
      avatarUrl?: string | null;
    };
  }[];
};

export type Message = {
  id: string;
  content: string | null;
  imageUrl?: string | null;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
};
