import { Restaurant } from "./restaurant";
import { UserSummary } from "./user";

export type ChatType = "DIRECT" | "GROUP" | "RESTAURANT";

export type Chat = {
  id: string;
  type: ChatType;
  title?: string | null;
  imageUrl?: string | null;

  restaurantId?: string | null;
  restaurant?: Pick<Restaurant, "id" | "name" | "logoUrl"> | null;

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
    role?: "ADMIN" | "MEMBER";
    user: UserSummary;
  }[];
};

export type Message = {
  id: string;
  type?: "TEXT" | "IMAGE" | "POST" | "RESTAURANT" | "POLL" | "SYSTEM";
  content: string | null;
  imageUrl?: string | null;
  createdAt: string;
  senderId: string;
  sender: UserSummary;
};
