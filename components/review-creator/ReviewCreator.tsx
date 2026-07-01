import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { CreateReviewDraft, CreateReviewStep } from "@/types/review";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import AddDishStep from "./steps/AddDishStep";
import CoverStep from "./steps/CoverStep";
import DishesStep from "./steps/DishesStep";
import PreviewStep from "./steps/PreviewStep";
import RestaurantStep from "./steps/RestaurantStep";

const initialDraft: CreateReviewDraft = {
  restaurant: null,
  summary: "",
  items: [],
};

export default function ReviewCreator() {
  const [step, setStep] = useState<CreateReviewStep>("RESTAURANT");
  const [draft, setDraft] = useState<CreateReviewDraft>(initialDraft);
  const [loading, setLoading] = useState(false);

  function updateDraft(update: Partial<CreateReviewDraft>) {
    setDraft((current) => ({
      ...current,
      ...update,
    }));
  }

  function calculateOverallRating() {
    const ratings = [
      draft.atmosphereRating,
      draft.serviceRating,
      draft.valueRating,
      ...draft.items.map((item) => item.rating),
    ].filter((rating): rating is number => typeof rating === "number");

    if (ratings.length === 0) return undefined;

    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  function getSelectedRestaurantId() {
    if (!draft.restaurant) return undefined;

    if (draft.restaurant.source === "FINDEAT") {
      return draft.restaurant.restaurant.id;
    }

    return undefined;
  }

  async function getRestaurantId() {
    if (!draft.restaurant) return undefined;

    if (draft.restaurant.source === "FINDEAT") {
      return draft.restaurant.restaurant.id;
    }

    const res = await api.post("/restaurants/from-google", {
      name: draft.restaurant.name,
      address: draft.restaurant.address,
      city: draft.restaurant.city,
      latitude: draft.restaurant.latitude,
      longitude: draft.restaurant.longitude,
      googlePlaceId: draft.restaurant.googlePlaceId,
    });

    return res.data.id as string;
  }

  async function publishReview() {
    if (!draft.restaurant) {
      Alert.alert("Missing restaurant", "Please choose a restaurant");
      return;
    }

    if (!draft.summary.trim()) {
      Alert.alert("Missing summary", "Please write something about the meal");
      return;
    }

    const overallRating = calculateOverallRating();

    try {
      setLoading(true);

      const restaurantId = await getRestaurantId();

      if (!restaurantId) {
        Alert.alert("Missing restaurant", "Please choose a restaurant");
        return;
      }

      const coverImageUrl = draft.coverImageUri
        ? await uploadImageToCloudinary(draft.coverImageUri)
        : undefined;

      const uploadedItems = await Promise.all(
        draft.items.map(async (item) => ({
          menuItemId: item.menuItemId,
          customDishName: item.customDishName,
          customPrice: item.customPrice,
          imageUrl: item.imageUri
            ? await uploadImageToCloudinary(item.imageUri)
            : undefined,
          rating: item.rating,
          text: item.text,
          order: item.order,
        })),
      );

      await api.post("/posts/review", {
        restaurantId,
        coverImageUrl,
        overallRating,
        summary: draft.summary.trim(),
        atmosphereRating: draft.atmosphereRating,
        serviceRating: draft.serviceRating,
        valueRating: draft.valueRating,
        totalPrice: draft.totalPrice,
        items: uploadedItems,
      });

      router.replace({
        pathname: "/(tabs)",
        params: { refresh: Date.now().toString() },
      });
    } catch (error: any) {
      console.error(error.response?.data ?? error);
      Alert.alert(
        "Error",
        error.response?.data?.message ?? "Could not publish review",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      {step === "RESTAURANT" && (
        <RestaurantStep
          selectedRestaurant={draft.restaurant}
          onSelect={(restaurant) => updateDraft({ restaurant })}
          onNext={() => setStep("COVER")}
        />
      )}

      {step === "COVER" && (
        <CoverStep
          draft={draft}
          onChange={updateDraft}
          onBack={() => setStep("RESTAURANT")}
          onNext={() => setStep("DISHES")}
        />
      )}

      {step === "DISHES" && (
        <DishesStep
          items={draft.items}
          onBack={() => setStep("COVER")}
          onAddDish={() => setStep("ADD_DISH")}
          onNext={() => setStep("PREVIEW")}
        />
      )}

      {step === "ADD_DISH" && (
        <AddDishStep
          restaurant={
            draft.restaurant?.source === "FINDEAT"
              ? draft.restaurant.restaurant
              : null
          }
          onBack={() => setStep("DISHES")}
          onSave={(item) => {
            setDraft((current) => ({
              ...current,
              items: [
                ...current.items,
                {
                  ...item,
                  id: Date.now().toString(),
                  order: current.items.length,
                },
              ],
            }));

            setStep("DISHES");
          }}
        />
      )}

      {step === "PREVIEW" && (
        <PreviewStep
          draft={draft}
          loading={loading}
          onBack={() => setStep("DISHES")}
          onPublish={publishReview}
        />
      )}
    </View>
  );
}
