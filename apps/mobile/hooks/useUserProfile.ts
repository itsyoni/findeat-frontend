import { api } from "@/lib/api";
import type { Profile } from "@findeat/types";
import { useCallback, useEffect, useState } from "react";

export function useUserProfile(id?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const profile = await api.users.get(id);
      setProfile(profile);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  return {
    profile,
    setProfile,
    loading,
    refresh: loadProfile,
  };
}
