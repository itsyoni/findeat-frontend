import type { AxiosInstance } from "axios";

export function createAdminApi(api: AxiosInstance) {
  return {
    async claims() {
      const { data } = await api.get("/admin/claims");
      return data;
    },

    async approveClaim(id: string) {
      const { data } = await api.post(`/admin/claims/${id}/approve`);
      return data;
    },

    async rejectClaim(id: string) {
      const { data } = await api.post(`/admin/claims/${id}/reject`);
      return data;
    },
  };
}
