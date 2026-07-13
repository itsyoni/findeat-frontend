import ReviewCreator from "@/components/review-creator/ReviewCreator";
import { Stack } from "expo-router";

export default function CreateReviewScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ReviewCreator />
    </>
  );
}
