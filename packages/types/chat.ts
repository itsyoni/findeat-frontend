import type { Post } from "./post";
import type { Restaurant } from "./restaurant";
import type { UserSummary } from "./user";

export type ChatType = "DIRECT" | "GROUP" | "RESTAURANT";

export type SendMessagePayload = (
  | { type: "TEXT"; content: string }
  | { type: "POST"; postId: string }
  | { type: "RESTAURANT"; restaurantId: string }
  | { type: "IMAGE"; imageUrl: string }
) & { replyToId?: string };

export type MessageReply = {
  id: string;
  type?: "TEXT" | "IMAGE" | "POST" | "RESTAURANT" | "POLL" | "SYSTEM";
  content: string | null;
  imageUrl?: string | null;
  deletedAt?: string | null;
  sender: UserSummary;
  sentAsRestaurant?: Pick<Restaurant, "id" | "name" | "logoUrl"> | null;
};

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

  postId?: string | null;
  post?: Post | null;

  restaurantId?: string | null;
  restaurant?: Restaurant | null;

  createdAt: string;
  deletedAt?: string | null;
  senderId: string;
  sender: UserSummary;
  sentAsRestaurantId?: string | null;
  sentAsRestaurant?: Pick<Restaurant, "id" | "name" | "logoUrl"> | null;
  replyToId?: string | null;
  replyTo?: MessageReply | null;
};

export type RestaurantConversation = {
  id: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  customer?: UserSummary | null;
};

export type RestaurantMessage = {
  id: string;
  type: "TEXT" | "IMAGE" | "POST" | "RESTAURANT" | "POLL" | "SYSTEM";
  content?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  senderId: string;
  sender: UserSummary;
  sentAsRestaurantId?: string | null;
  sentAsRestaurant?: Pick<Restaurant, "id" | "name" | "logoUrl"> | null;
};
