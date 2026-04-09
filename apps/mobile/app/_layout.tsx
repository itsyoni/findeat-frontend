import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { useFonts } from "expo-font";
import ArrowLeft from "@/assets/icons/ChevronLeft.svg";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { Icon } from "@/components/Icon";
import { ThemedButton } from "@/components/ThemedButton";
import { View, Text } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // 🔤 Cabinet Grotesk
    "CabinetGrotesk-Thin": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Thin.otf"),
    "CabinetGrotesk-Extralight": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-ExtraLight.otf"),
    "CabinetGrotesk-Light": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Light.otf"),
    "CabinetGrotesk-Regular": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Regular.otf"),
    "CabinetGrotesk-Medium": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Medium.otf"),
    "CabinetGrotesk-Bold": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Bold.otf"),
    "CabinetGrotesk-ExtraBold": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-ExtraBold.otf"),
    "CabinetGrotesk-Black": require("../assets/fonts/CabinetGrotesk/CabinetGrotesk-Black.otf"),

    // 🔤 RedHat Display
    "RedHatDisplay-Light": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Light.ttf"),
    "RedHatDisplay-Regular": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Regular.ttf"),
    "RedHatDisplay-Medium": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Medium.ttf"),
    "RedHatDisplay-SemiBold": require("../assets/fonts/RedHatDisplay/RedHatDisplay-SemiBold.ttf"),
    "RedHatDisplay-Bold": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Bold.ttf"),
    "RedHatDisplay-ExtraBold": require("../assets/fonts/RedHatDisplay/RedHatDisplay-ExtraBold.ttf"),
    "RedHatDisplay-Black": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Black.ttf"),

    // ✍️ RedHat Italics
    "RedHatDisplay-LightItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-LightItalic.ttf"),
    "RedHatDisplay-Italic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-Italic.ttf"),
    "RedHatDisplay-MediumItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-MediumItalic.ttf"),
    "RedHatDisplay-SemiBoldItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-SemiBoldItalic.ttf"),
    "RedHatDisplay-BoldItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-BoldItalic.ttf"),
    "RedHatDisplay-ExtraBoldItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-ExtraBoldItalic.ttf"),
    "RedHatDisplay-BlackItalic": require("../assets/fonts/RedHatDisplay/RedHatDisplay-BlackItalic.ttf"),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerLeft: () => (
                // <ThemedButton
                //   onPress={() => router.back()}
                //   className="bg-transparent p-0"
                // >
                //   <Icon Icon={ArrowLeft} size={30} color="black" />
                // </ThemedButton>
                <View>
                  <Text>Test</Text>
                </View>
              ),
              title: "Settings",
              headerBackVisible: false,
            }}
          />
        </Stack>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
