import type { CreatorImpactSummary } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createCreatorImpactApi(api: AxiosInstance) {
  return {
    async mine() {
      const { data } = await api.get<CreatorImpactSummary>("/creator-impact/me");
      return data;
    },
  };
}
