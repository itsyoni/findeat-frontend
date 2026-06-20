export type ConnectionItem = {
  id: string;
  follower?: {
    id: string;
    username: string;
  };
  following?: {
    id: string;
    username: string;
  };
};
