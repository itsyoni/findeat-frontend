import { api } from "@/lib/api";
import { getErrorMessage, uploadImage } from "@findeat/utils";
import { Dish } from "@findeat/types";
import { CreateReviewDraft, CreateReviewStep } from "@findeat/types/review";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import AddDishDetailsStep from "./steps/AddDishDetailsStep";
import CoverStep from "./steps/CoverStep";
import DishesStep from "./steps/DishesStep";
import PreviewStep from "./steps/PreviewStep";
import RestaurantStep from "./steps/RestaurantStep";
import SelectMenuDishStep from "./steps/SelectMenuDishStep";
import {
  prependPostToFeedCache,
  updateRestaurantStatusInFeedCache,
} from "@/hooks/useFeed";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const initialDraft: CreateReviewDraft = {
  visibility: "PUBLIC",
  restaurant: null,
  summary: "",
  items: [],
};

export default function ReviewCreator() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
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
    if (typeof draft.overallRating === "number") {
      return draft.overallRating;
    }

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
        ? await uploadImage(draft.coverImageUri)
        : undefined;

      const uploadedItems = await Promise.all(
        draft.items.map(async (item) => ({
          menuItemId: item.menuItemId,
          customDishName: item.customDishName,
          customPrice: item.customPrice,
          imageUrl: item.imageUri
            ? await uploadImage(item.imageUri)
            : item.fallbackImageUrl,
          rating: item.rating,
          text: item.text,
          order: item.order,
        })),
      );

      const createdPost = await api.posts.createReview({
        restaurantId,
        visibility: draft.visibility,
        coverImageUrl,
        overallRating,
        summary: draft.summary.trim(),
        atmosphereRating: draft.atmosphereRating,
        serviceRating: draft.serviceRating,
        valueRating: draft.valueRating,
        items: uploadedItems,
      });

      updateRestaurantStatusInFeedCache(queryClient, restaurantId, {
        visited: true,
        wantToTry: false,
      });
      prependPostToFeedCache(queryClient, createdPost);
      void queryClient.invalidateQueries({ queryKey: ["restaurant-posts"] });
      void refreshUser();

      setDraft(initialDraft);
      setSelectedMenuDish(null);
      setStep("RESTAURANT");

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
      Alert.alert("Error", getErrorMessage(error, "Could not publish review"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-black">
      {step === "RESTAURANT" && (
        <RestaurantStep
          selectedRestaurant={draft.restaurant}
          onSelect={(restaurant) => {
            if (!restaurant) return;
            updateDraft({ restaurant });
            setStep("COVER");
          }}
          onBack={() => router.back()}
        />
      )}

      {step === "COVER" && (
        <CoverStep
          draft={draft}
          onChange={updateDraft}
          onBack={() => {
            updateDraft({ restaurant: null, items: [] });
            setSelectedMenuDish(null);
            setStep("RESTAURANT");
          }}
          onNext={() => setStep("DISHES")}
        />
      )}

      {step === "DISHES" && (
        <DishesStep
          items={draft.items}
          onBack={() => setStep("COVER")}
          onAddCustomDish={() => {
            setSelectedMenuDish(null);
            setStep("ADD_DISH_DETAILS");
          }}
          onAddMenuDish={() => setStep("SELECT_MENU_DISH")}
          onRemoveDish={(id) =>
            setDraft((current) => ({
              ...current,
              items: current.items
                .filter((item) => item.id !== id)
                .map((item, index) => ({ ...item, order: index })),
            }))
          }
          onNext={() => setStep("PREVIEW")}
        />
      )}

      {step === "SELECT_MENU_DISH" && (
        <SelectMenuDishStep
          restaurant={
            draft.restaurant?.source === "FINDEAT"
              ? draft.restaurant.restaurant
              : null
          }
          onBack={() => setStep("DISHES")}
          onSelect={(dish) => {
            setSelectedMenuDish(dish);
            setStep("ADD_DISH_DETAILS");
          }}
          onAddCustom={() => {
            setSelectedMenuDish(null);
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
              : setStep("DISHES")
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
          onVisibilityChange={(visibility) => updateDraft({ visibility })}
        />
      )}
    </View>
  );
}
