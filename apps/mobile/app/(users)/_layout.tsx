import { Stack } from "expo-router";

export default function UsersLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="connections" options={{ headerShown: false }} />
      <Stack.Screen name="content-feed" options={{ headerShown: false }} />
      <Stack.Screen name="reviews-feed" options={{ headerShown: false }} />
    </Stack>
  );
}
