import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// export const API_URL = "http://192.168.1.108:3000";
// export const API_URL = "http://172.20.10.6:3000";
// export const API_URL = "http://172.20.10.3:3000";
// export const API_URL = "http://10.0.0.16:3000";
export const API_URL = "http://10.100.10.65:3000";
// export const API_URL = "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

const TOKEN_KEY = "findeat_access_token";

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
