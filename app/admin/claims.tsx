import Text from "@/components/AppText";
import { api } from "@/lib/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type Claim = {
  id: string;
  evidenceText?: string | null;
  evidenceUrl?: string | null;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    address?: string | null;
    city?: string | null;
  };
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
  };
};

export default function AdminClaimsScreen() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadClaims();
    }, []),
  );

  async function loadClaims() {
    try {
      const res = await api.get("/restaurants/claims/pending");
      setClaims(res.data);
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert("Error", "Could not load claims");
    } finally {
      setLoading(false);
    }
  }

  async function approveClaim(claimId: string) {
    try {
      await api.post(`/restaurants/claims/${claimId}/approve`);
      setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert("Error", "Could not approve claim");
    }
  }

  async function rejectClaim(claimId: string) {
    try {
      await api.post(`/restaurants/claims/${claimId}/reject`, {
        reason: "Rejected by admin",
      });
      setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert("Error", "Could not reject claim");
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-16">
      <Text className="text-3xl font-bold text-black">Restaurant Claims</Text>

      {claims.length === 0 && (
        <Text className="mt-6 text-gray-500">No pending claims</Text>
      )}

      {claims.map((claim) => (
        <View
          key={claim.id}
          className="mt-5 rounded-2xl border border-gray-200 p-4"
        >
          <Text className="text-lg font-bold text-black">
            {claim.restaurant.name}
          </Text>

          {!!claim.restaurant.address && (
            <Text className="mt-1 text-gray-500">
              {claim.restaurant.address}
            </Text>
          )}

          {!!claim.restaurant.city && (
            <Text className="mt-1 text-gray-500">{claim.restaurant.city}</Text>
          )}

          <View className="mt-4 rounded-xl bg-gray-50 p-3">
            <Text className="font-bold text-black">Requested by</Text>
            <Text className="mt-1 text-gray-500">
              {claim.user.displayName} @{claim.user.username}
            </Text>
            <Text className="mt-1 text-gray-500">{claim.user.email}</Text>
          </View>

          {!!claim.evidenceText && (
            <View className="mt-3 rounded-xl bg-gray-50 p-3">
              <Text className="font-bold text-black">Evidence</Text>
              <Text className="mt-1 text-gray-500">{claim.evidenceText}</Text>
            </View>
          )}

          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl bg-black py-3"
              onPress={() => approveClaim(claim.id)}
            >
              <Text className="text-center font-bold text-white">Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-xl bg-red-500 py-3"
              onPress={() => rejectClaim(claim.id)}
            >
              <Text className="text-center font-bold text-white">Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
