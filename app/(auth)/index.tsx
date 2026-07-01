import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import Text from "@/components/common/AppText";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { CaretLeftIcon } from "phosphor-react-native";
import { useRef, useState } from "react";
import { ImageBackground, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const steps = [
  {
    title: "FIND.\nEAT.\nREPEAT.",
    subtitle: "Discover dishes people actually recommend.",
  },
  {
    title: "REAL\nREVIEWS.",
    subtitle: "See what people actually ordered and loved.",
  },
  {
    title: "YOUR NEXT\nBITE.",
    subtitle: "Save dishes, follow friends, and find your next meal.",
  },
];

type AuthMode = "login" | "signup" | "restaurant-signup";

export default function AuthIndexScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [step, setStep] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const current = steps[step];

  function openSheet(mode: AuthMode = "login") {
    setAuthMode(mode);
    setSheetOpen(true);
    bottomSheetRef.current?.snapToIndex(0);
  }

  function closeSheet() {
    bottomSheetRef.current?.close();
    setSheetOpen(false);
    setAuthMode("login");
  }

  function handleContinue() {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    openSheet("login");
  }

  function handleBack() {
    if (sheetOpen) {
      closeSheet();
      return;
    }

    if (step > 0) setStep((prev) => prev - 1);
  }

  function IndicatorDot({ active }: { active: boolean }) {
    return (
      <Animated.View
        layout={LinearTransition.springify().damping(28).stiffness(260)}
        className={`h-2 rounded-full ${
          active ? "w-8 bg-white" : "w-2 bg-white/40"
        }`}
      />
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ImageBackground
        source={require("@/assets/images/auth-bg.png")}
        style={{ flex: 1 }}
        imageStyle={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      >
        <View className="absolute inset-0 bg-black/35" />

        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingHorizontal: 32,
            paddingVertical: 32,
          }}
        >
          <View style={{ zIndex: 100 }}>
            {step > 0 || sheetOpen ? (
              <TouchableOpacity onPress={handleBack}>
                <CaretLeftIcon size={28} color="white" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          {!sheetOpen && (
            <>
              <Animated.View
                key={current.title}
                entering={FadeInRight.duration(350)}
                exiting={FadeOutLeft.duration(200)}
              >
                <Text
                  weight="black"
                  className="text-6xl leading-15.5 text-white"
                >
                  {current.title}
                </Text>

                <Text className="mt-5 max-w-72.5 text-lg leading-7 text-white/85">
                  {current.subtitle}
                </Text>
              </Animated.View>

              <View>
                <View className="mb-6 flex-row justify-center gap-2">
                  {steps.map((_, index) => (
                    <IndicatorDot key={index} active={index === step} />
                  ))}
                </View>

                <TouchableOpacity
                  className="rounded-full bg-white py-4"
                  onPress={handleContinue}
                >
                  <Text
                    weight="bold"
                    className="text-center text-base text-black"
                  >
                    {step === steps.length - 1 ? "Get Started" : "Continue"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          onClose={() => setSheetOpen(false)}
          backgroundStyle={{
            backgroundColor: "white",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
          handleIndicatorStyle={{
            backgroundColor: "#D1D5DB",
            width: 48,
          }}
        >
          <BottomSheetScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 48,
            }}
          >
            {authMode === "login" && (
              <LoginForm
                onSignup={() => setAuthMode("signup")}
                onRestaurantSignup={() => setAuthMode("restaurant-signup")}
              />
            )}

            {authMode === "signup" && (
              <SignupForm
                onLogin={() => setAuthMode("login")}
                onRestaurantSignup={() => setAuthMode("restaurant-signup")}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </ImageBackground>
    </View>
  );
}
