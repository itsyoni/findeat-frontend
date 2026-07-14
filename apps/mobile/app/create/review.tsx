import ReviewCreator from "@/components/review-creator/ReviewCreator";
import { Stack, useLocalSearchParams } from "expo-router";

export default function CreateReviewScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ReviewCreator initialRestaurantId={restaurantId} />
    </>
  );
}
