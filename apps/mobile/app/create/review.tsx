import ReviewCreator from "@/components/review-creator/ReviewCreator";
import { Stack, useLocalSearchParams } from "expo-router";

export default function CreateReviewScreen() {
  const { restaurantId, linkedPostId } = useLocalSearchParams<{
    restaurantId?: string;
    linkedPostId?: string;
  }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ReviewCreator
        initialRestaurantId={restaurantId}
        initialLinkedPostId={linkedPostId}
      />
    </>
  );
}
