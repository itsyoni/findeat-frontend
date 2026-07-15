import "@/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useAppTheme } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PortalHost } from "@gorhom/portal";
import { LoadingScreen } from "@/components/common";
import WhatsNewModal from "@/components/updates/WhatsNewModal";
import { ToastProvider } from "@/contexts/ToastContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 30 * 60_000,
    },
  },
});

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
      <ThemeProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ToastProvider>
                <NotificationProvider>
                  <BottomSheetModalProvider>
                    <RootNavigator />
                    <PortalHost name="pinch-zoom" />
                  </BottomSheetModalProvider>
                </NotificationProvider>
              </ToastProvider>
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const { isDark } = useAppTheme();
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

  if (isLoading) return <LoadingScreen variant="feed" />;

  return (
    <>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(users)" options={{ headerShown: false }} />
        <Stack.Screen name="(profile)" options={{ headerShown: false }} />
        <Stack.Screen name="(posts)/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="posts/edit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create/content" options={{ headerShown: false }} />
        <Stack.Screen name="create/review" options={{ headerShown: false }} />
        <Stack.Screen name="business/index" />
        <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="chats/[id]"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDark ? "#080808" : "#FBFAF8",
            },
          }}
        />
        <Stack.Screen name="restaurants/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="menu-items/[id]" options={{ headerShown: false }} />
      </Stack>

      <StatusBar style={isDark ? "light" : "dark"} />
      {user ? <WhatsNewModal /> : null}
    </>
  );
}
