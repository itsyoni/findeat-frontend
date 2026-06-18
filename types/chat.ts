export type Chat = {
  id: string;
  participants: {
    userId: string;
    user: {
      id: string;
      username: string;
    };
  }[];
  messages: {
    content: string | null;
    createdAt: string;
  }[];
};

export type Message = {
  id: string;
  content: string | null;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
  };
};
