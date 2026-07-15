import type { CreateReportInput, ModerationReport } from "@findeat/types";
import type { AxiosInstance } from "axios";

export function createReportsApi(api: AxiosInstance) {
  return {
    async create(payload: CreateReportInput) {
      const { data } = await api.post<
        Pick<ModerationReport, "id" | "status">
      >("/reports", payload);
      return data;
    },
  };
}
