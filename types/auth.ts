import { User } from "./user";

export type SignupWithRestaurantData = {
  email: string;
  username: string;
  password: string;
  restaurantName: string;
  city?: string;
  address?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  signupWithRestaurant: (data: SignupWithRestaurantData) => Promise<void>;
  logout: () => Promise<void>;
};
