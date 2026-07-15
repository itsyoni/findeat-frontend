import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import { TextInput } from "@/components/common";
import FullPageRestaurantPicker from "@/components/restaurants/FullPageRestaurantPicker";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import PostVisibilitySelector from "@/components/posts/PostVisibilitySelector";
import { useAppTheme } from "@/contexts/ThemeContext";
import { prependPostToFeedCache } from "@/hooks/useFeed";
import { api } from "@/lib/api";
import type { PostVisibility, SelectedRestaurant } from "@findeat/types";
import { getErrorMessage, uploadImage } from "@findeat/utils";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ArrowCounterClockwiseIcon,
  CameraIcon,
  ImagesSquareIcon,
  LockIcon,
  StorefrontIcon,
  XIcon,
} from "phosphor-react-native";
import DirectionalIcon from "@/components/common/icons/DirectionalIcon";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

type Step = "CAMERA" | "DETAILS" | "RESTAURANT";

export default function CreateContentScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();
  const { t } = useTranslation("create");
  const { isDark } = useAppTheme();
  const queryClient = useQueryClient();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>("CAMERA");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("PUBLIC");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<SelectedRestaurant | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;

    void api.restaurants
      .get(restaurantId)
      .then((restaurant) => {
        if (!cancelled) {
          setSelectedRestaurant({ source: "FINDEAT", restaurant });
        }
      })
      .catch((error) => console.error("failed to preselect restaurant", error));

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  async function selectPhoto(uri: string) {
    try {
      setCapturing(true);
      setImageUri(uri);
      setStep("DETAILS");
    } finally {
      setCapturing(false);
    }
  }

  async function takePhoto() {
    if (!cameraRef.current || capturing) return;

    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      await selectPhoto(photo.uri);
    } catch (error) {
      console.error("camera capture failed", error);
      setCapturing(false);
    }
  }

  async function openGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.9,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      await selectPhoto(image.uri);
    }
  }

  async function getRestaurantId() {
    if (!selectedRestaurant) return undefined;
    if (selectedRestaurant.source === "FINDEAT") {
      return selectedRestaurant.restaurant.id;
    }

    const restaurant = await api.restaurants.fromGoogle({
      name: selectedRestaurant.name,
      address: selectedRestaurant.address,
      city: selectedRestaurant.city,
      latitude: selectedRestaurant.latitude,
      longitude: selectedRestaurant.longitude,
      googlePlaceId: selectedRestaurant.googlePlaceId,
    });
    return restaurant.id;
  }

  async function publish() {
    if (!imageUri || !selectedRestaurant || publishing) return;

    try {
      setPublishing(true);
      const restaurantId = await getRestaurantId();
      if (!restaurantId) return;
      const imageUrl = await uploadImage(imageUri);
      const createdPost = await api.posts.createContent({
        imageUrl,
        restaurantId,
        description: description.trim(),
        visibility,
      });

      prependPostToFeedCache(queryClient, createdPost);
      router.replace({
        pathname: "/(tabs)",
        params: {
          feed: createdPost.type,
          postId: createdPost.id,
          refresh: Date.now().toString(),
        },
      });
    } catch (error) {
      console.error(error);
      Alert.alert(t("publishError"), getErrorMessage(error, t("publishErrorBody")));
    } finally {
      setPublishing(false);
    }
  }

  const selectedPlace =
    selectedRestaurant?.source === "FINDEAT"
      ? selectedRestaurant.restaurant
      : selectedRestaurant;
  const selectedPlaceLogo =
    selectedRestaurant?.source === "FINDEAT"
      ? selectedRestaurant.restaurant.logoUrl
      : null;

  if (step === "CAMERA") {
    const permissionGranted = permission?.granted;
    const canAskForCamera = permission?.canAskAgain !== false;

    return (
      <View className="flex-1 bg-black">
        <Stack.Screen options={{ headerShown: false }} />
        {permissionGranted ? (
          <View style={{ flex: 1 }}>
            <CameraView
              ref={cameraRef}
              style={{ position: "absolute", inset: 0 }}
              facing="back"
            />
            <SafeAreaView
              style={{
                flex: 1,
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingBottom: 32,
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                className="h-11 w-11 items-center justify-center rounded-full bg-black/45"
              >
                <XIcon size={24} color="white" weight="bold" />
              </TouchableOpacity>

              <View className="flex-row items-center justify-between px-2">
                <TouchableOpacity
                  onPress={() => void openGallery()}
                  className="h-14 w-14 items-center justify-center rounded-2xl bg-black/50"
                >
                  <ImagesSquareIcon size={27} color="white" weight="fill" />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={capturing}
                  onPress={() => void takePhoto()}
                  className="h-20 w-20 items-center justify-center rounded-full border-4 border-white"
                >
                  <View className="h-16 w-16 rounded-full bg-white" />
                </TouchableOpacity>

                <View className="h-14 w-14" />
              </View>
            </SafeAreaView>
          </View>
        ) : permission === null ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          <SafeAreaView className="flex-1 px-5 pb-4">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("cancel")}
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full bg-white/10"
            >
              <XIcon size={23} color="white" weight="bold" />
            </TouchableOpacity>

            <View className="flex-1 items-center justify-center px-3">
              <View className="h-40 w-52 items-center justify-center overflow-hidden rounded-[36px] border border-white/10 bg-[#171717]">
                <View
                  className="absolute -left-6 -top-8 h-24 w-24 rounded-full"
                  style={{ backgroundColor: "rgba(247, 215, 134, 0.15)" }}
                />
                <View
                  className="absolute -bottom-10 -right-5 h-28 w-28 rounded-full"
                  style={{ backgroundColor: "rgba(255, 107, 69, 0.15)" }}
                />
                <View className="h-20 w-20 items-center justify-center rounded-[26px] bg-[#F7D786] shadow-lg">
                  <CameraIcon size={39} color="#171717" weight="fill" />
                </View>
              </View>

              <View className="mt-6 rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-[#F7D786]">
                  {t("quickPost")}
                </Text>
              </View>
              <Text className="mt-4 text-center text-[28px] font-bold leading-8 text-white">
                {t(canAskForCamera ? "cameraPermissionTitle" : "cameraPermissionDeniedTitle")}
              </Text>
              <Text className="mt-3 max-w-[330px] text-center text-[15px] leading-6 text-gray-400">
                {t(canAskForCamera ? "cameraPermissionBody" : "cameraPermissionDeniedBody")}
              </Text>

              <View className="mt-5 flex-row items-center rounded-2xl bg-white/5 px-4 py-3">
                <LockIcon size={17} color="#A3A3A3" weight="fill" />
                <Text className="ml-2 shrink text-xs leading-4 text-gray-400">
                  {t("cameraPrivacy")}
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() =>
                  void (canAskForCamera
                    ? requestPermission()
                    : Linking.openSettings())
                }
                className="w-full rounded-2xl bg-white py-4"
              >
                <Text className="text-center text-base font-bold text-black">
                  {t(canAskForCamera ? "allowCamera" : "openSettings")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void openGallery()}
                className="w-full flex-row items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-4"
              >
                <ImagesSquareIcon size={21} color="#F7D786" weight="fill" />
                <Text className="ml-2 text-center text-base font-bold text-white">
                  {t("chooseFromGallery")}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
        {capturing && (
          <View className="absolute inset-0 items-center justify-center bg-black/30">
            <ActivityIndicator color="white" size="large" />
          </View>
        )}
      </View>
    );
  }

  if (step === "RESTAURANT") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <FullPageRestaurantPicker
          selectedRestaurant={selectedRestaurant}
          onSelect={(restaurant) => {
            setSelectedRestaurant(restaurant);
            setStep("DETAILS");
          }}
          onBack={() => setStep("DETAILS")}
        />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => setStep("CAMERA")}
            className="h-11 w-11 items-center justify-center rounded-full"
          >
            <DirectionalIcon direction="back" size={25} color={isDark ? "#FFF" : "#171717"} weight="bold" />
          </TouchableOpacity>
          <Text className="ml-2 flex-1 text-xl font-bold text-black dark:text-white">
            {t("quickPost")}
          </Text>
          <TouchableOpacity
            disabled={!selectedRestaurant || publishing}
            onPress={() => void publish()}
            className="min-w-14 items-end px-1 py-2"
          >
            {publishing ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text
                className={`font-bold ${
                  selectedRestaurant
                    ? "text-black dark:text-white"
                    : "text-gray-300 dark:text-gray-700"
                }`}
              >
                {t("post")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {imageUri && (
            <View
              style={{ width: "72%", aspectRatio: 4 / 5, alignSelf: "center" }}
              className="my-5 overflow-hidden rounded-3xl bg-black"
            >
              <Image
                source={{ uri: imageUri }}
                className="h-full w-full"
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() => setStep("CAMERA")}
                className="absolute bottom-4 right-4 flex-row items-center rounded-full border border-white/25 px-4 py-2.5"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.62)" }}
              >
                <ArrowCounterClockwiseIcon size={17} color="white" />
                <Text className="ml-2 text-sm font-bold text-white">
                  {t("retake")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="px-5">
            <TouchableOpacity
              onPress={() => setStep("RESTAURANT")}
              className="mt-2 flex-row items-center border-b border-gray-100 py-4 dark:border-gray-800"
            >
              {selectedPlace ? (
                <Avatar
                  uri={selectedPlaceLogo}
                  username={selectedPlace.name}
                  size={46}
                  fallbackType="restaurant"
                />
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                  <StorefrontIcon size={22} color="#9CA3AF" weight="fill" />
                </View>
              )}
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="font-bold text-black dark:text-white">
                    {selectedPlace?.name ?? t("addRestaurant")}
                  </Text>
                  {selectedPlace ? (
                    <RestaurantBadge
                      size={14}
                      claimed={
                        selectedRestaurant?.source === "FINDEAT" &&
                        selectedRestaurant.restaurant.status === "CLAIMED"
                      }
                    />
                  ) : null}
                </View>
                <Text numberOfLines={1} className="mt-1 text-sm text-gray-500">
                  {selectedPlace
                    ? selectedPlace.address ?? selectedPlace.city
                    : t("restaurantRequired")}
                </Text>
              </View>
              <DirectionalIcon direction="forward" size={20} color="#9CA3AF" weight="bold" />
            </TouchableOpacity>

            <View className="mt-5">
              <Text className="mb-2 text-base font-bold text-black dark:text-white">
                {t("descriptionOptional")}
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t("descriptionPlaceholder")}
                multiline
                maxLength={500}
                className="min-h-28 bg-gray-50 dark:bg-gray-900"
              />
            </View>

            <PostVisibilitySelector
              value={visibility}
              onChange={setVisibility}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
