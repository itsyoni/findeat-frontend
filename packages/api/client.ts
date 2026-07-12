import axios from "axios";

type GetToken = () => string | null | Promise<string | null>;

export function createApiClient(baseURL: string, getToken?: GetToken) {
  const api = axios.create({ baseURL });

  const originalGet = api.get.bind(api);
  const pendingGets = new Map<string, ReturnType<typeof originalGet>>();

  api.get = ((url: string, config?: Parameters<typeof originalGet>[1]) => {
    const params = config?.params
      ? JSON.stringify(
          Object.entries(config.params as Record<string, unknown>).sort(
            ([left], [right]) => left.localeCompare(right),
          ),
        )
      : "";
    const key = `${url}?${params}`;
    const pending = pendingGets.get(key);

    if (pending) return pending;

    const request = originalGet(url, config).finally(() => {
      pendingGets.delete(key);
    });

    pendingGets.set(key, request);
    return request;
  }) as typeof api.get;

  api.interceptors.request.use(async (config) => {
    const token = getToken ? await getToken() : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return api;
}
