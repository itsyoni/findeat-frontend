import "@/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CabinetThin: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Thin.otf"),
    CabinetExtraLight: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Extralight.otf"),
    CabinetLight: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Light.otf"),
    CabinetRegular: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Regular.otf"),
    CabinetMedium: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Medium.otf"),
    CabinetBold: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Bold.otf"),
    CabinetExtraBold: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Extrabold.otf"),
    CabinetBlack: require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Black.otf"),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthScreen = segments[0] === "(auth)";

    if (!user && !inAuthScreen) {
      router.replace("/(auth)");
    }

    if (user && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments]);

  if (isLoading) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(users)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="business/index" />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}
