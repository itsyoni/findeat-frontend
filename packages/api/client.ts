import axios from "axios";

type GetToken = () => string | null | Promise<string | null>;

export function createApiClient(baseURL: string, getToken?: GetToken) {
  const api = axios.create({ baseURL });

  api.interceptors.request.use(async (config) => {
    const token = getToken ? await getToken() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return api;
}
