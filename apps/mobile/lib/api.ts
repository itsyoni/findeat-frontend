import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, createApiClient } from "@findeat/api";

export const TOKEN_KEY = "findeat_access_token";

export const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export const apiClient = createApiClient(API_URL, () =>
  AsyncStorage.getItem(TOKEN_KEY),
);

export const api = createApi(API_URL, () => AsyncStorage.getItem(TOKEN_KEY));
