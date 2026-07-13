import type { AxiosInstance } from "axios";

export function createAdminApi(api: AxiosInstance) {
  return {
    async claims() {
      const { data } = await api.get("/restaurants/claims/pending");
      return data;
    },

    async approveClaim(id: string) {
      const { data } = await api.post(`/restaurants/claims/${id}/approve`);
      return data;
    },

    async rejectClaim(id: string) {
      const { data } = await api.post(`/restaurants/claims/${id}/reject`);
      return data;
    },

    async admins() {
      const { data } = await api.get("/admin/admins");
      return data;
    },

    async searchUsers(query: string) {
      const { data } = await api.get("/admin/users", { params: { q: query } });
      return data;
    },

    async grantAdmin(userId: string) {
      const { data } = await api.post(`/admin/admins/${userId}`);
      return data;
    },

    async revokeAdmin(userId: string) {
      const { data } = await api.delete(`/admin/admins/${userId}`);
      return data;
    },
  };
}
