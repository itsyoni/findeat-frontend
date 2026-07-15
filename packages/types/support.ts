export type SupportTicketCategory =
  | "BUG"
  | "ACCOUNT"
  | "RESTAURANT"
  | "CONTENT"
  | "SAFETY"
  | "OTHER";

export type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

type SupportTicketUser = {
  id: string;
  displayName: string;
  username: string;
  email?: string;
  avatarUrl?: string | null;
};

export type SupportTicket = {
  id: string;
  category: SupportTicketCategory;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminReply?: string | null;
  handledById?: string | null;
  handledBy?: SupportTicketUser | null;
  user?: SupportTicketUser;
  restaurantId?: string | null;
  restaurant?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupportTicketInput = Pick<
  SupportTicket,
  "category" | "subject" | "message"
> & { restaurantId?: string };
