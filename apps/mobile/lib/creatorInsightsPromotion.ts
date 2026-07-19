import AsyncStorage from "@react-native-async-storage/async-storage";

const storageKey = (userId: string) =>
  `creator-insights-promotion-dismissed:${userId}`;

export async function isCreatorInsightsPromotionDismissed(userId: string) {
  return (await AsyncStorage.getItem(storageKey(userId))) === "1";
}

export async function dismissCreatorInsightsPromotion(userId: string) {
  await AsyncStorage.setItem(storageKey(userId), "1");
}
