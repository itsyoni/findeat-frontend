import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="content-feed" options={{ headerShown: false }} />
      <Stack.Screen name="reviews-feed" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
      <Stack.Screen name="statistics" options={{ headerShown: false }} />
    </Stack>
  );
}
