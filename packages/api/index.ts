import type { AxiosInstance } from "axios";
import { createAdminApi } from "./admin";
import { createAuthApi } from "./auth";
import { createChatsApi } from "./chats";
import { createApiClient } from "./client";
import { createMenuApi } from "./menu";
import { createPostsApi } from "./posts";
import { createRestaurantsApi } from "./restaurants";
import { createUsersApi } from "./users";
import { createNotificationsApi } from "./notifications";
import { createSupportApi } from "./support";

type GetToken = () => string | null | Promise<string | null>;

export { createApiClient };

export function createApi(baseURL: string, getToken?: GetToken) {
  const client = createApiClient(baseURL, getToken);

  return createApiFromClient(client);
}

export function createApiFromClient(client: AxiosInstance) {
  return {
    auth: createAuthApi(client),
    users: createUsersApi(client),
    restaurants: createRestaurantsApi(client),
    menu: createMenuApi(client),
    posts: createPostsApi(client),
    chats: createChatsApi(client),
    notifications: createNotificationsApi(client),
    admin: createAdminApi(client),
    support: createSupportApi(client),
  };
}

export type FindEatApi = ReturnType<typeof createApi>;
