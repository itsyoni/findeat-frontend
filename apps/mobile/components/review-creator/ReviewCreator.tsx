import { api } from "@/lib/api";
import { uploadImageToCloudinary } from "@/lib/uploadImage";
import { Dish } from "@findeat/types";
import { CreateReviewDraft, CreateReviewStep } from "@findeat/types/review";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import AddDishDetailsStep from "./steps/AddDishDetailsStep";
import CoverStep from "./steps/CoverStep";
import DishesStep from "./steps/DishesStep";
import DishSourceStep from "./steps/DishSourceStep";
import PreviewStep from "./steps/PreviewStep";
import RestaurantStep from "./steps/RestaurantStep";
import SelectMenuDishStep from "./steps/SelectMenuDishStep";

const initialDraft: CreateReviewDraft = {
  restaurant: null,
  summary: "",
  items: [],
};

export default function ReviewCreator() {
  const [step, setStep] = useState<CreateReviewStep>("RESTAURANT");
  const [draft, setDraft] = useState<CreateReviewDraft>(initialDraft);
  const [loading, setLoading] = useState(false);
  const [selectedMenuDish, setSelectedMenuDish] = useState<Dish | null>(null);

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

  async function getRestaurantId() {
    if (!draft.restaurant) return undefined;

    if (draft.restaurant.source === "FINDEAT") {
      return draft.restaurant.restaurant.id;
    }

    const restaurant = await api.restaurants.fromGoogle({
      name: draft.restaurant.name,
      address: draft.restaurant.address,
      city: draft.restaurant.city,
      latitude: draft.restaurant.latitude,
      longitude: draft.restaurant.longitude,
      googlePlaceId: draft.restaurant.googlePlaceId,
    });

    return restaurant.id;
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
            : item.fallbackImageUrl,
          rating: item.rating,
          text: item.text,
          order: item.order,
        })),
      );

      const createdPost = await api.posts.createReview({
        restaurantId,
        coverImageUrl,
        overallRating,
        summary: draft.summary.trim(),
        atmosphereRating: draft.atmosphereRating,
        serviceRating: draft.serviceRating,
        valueRating: draft.valueRating,
        items: uploadedItems,
      });

      router.replace({
        pathname: "/(tabs)",
        params: {
          feed: createdPost.type,
          postId: createdPost.id,
          refresh: Date.now().toString(),
        },
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
          onAddDish={() => setStep("DISH_SOURCE")}
          onNext={() => setStep("PREVIEW")}
        />
      )}

      {step === "DISH_SOURCE" && (
        <DishSourceStep
          onBack={() => setStep("DISHES")}
          onCustom={() => {
            setSelectedMenuDish(null);
            setStep("ADD_DISH_DETAILS");
          }}
          onFromMenu={() => setStep("SELECT_MENU_DISH")}
        />
      )}

      {step === "SELECT_MENU_DISH" && (
        <SelectMenuDishStep
          restaurant={
            draft.restaurant?.source === "FINDEAT"
              ? draft.restaurant.restaurant
              : null
          }
          onBack={() => setStep("DISH_SOURCE")}
          onSelect={(dish) => {
            setSelectedMenuDish(dish);
            setStep("ADD_DISH_DETAILS");
          }}
        />
      )}

      {step === "ADD_DISH_DETAILS" && (
        <AddDishDetailsStep
          selectedDish={selectedMenuDish}
          onBack={() =>
            selectedMenuDish
              ? setStep("SELECT_MENU_DISH")
              : setStep("DISH_SOURCE")
          }
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

            setSelectedMenuDish(null);
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
