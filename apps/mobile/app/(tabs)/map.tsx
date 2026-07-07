import { LoadingScreen } from "@/components/common";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import SearchBar from "@/components/common/inputs/SearchBar";
import Tabs from "@/components/common/Tabs";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import { Restaurant } from "@findeat/types";
import { MapType } from "@findeat/types/map";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "");

export default function MapScreen() {
  const { t } = useTranslation(["common", "map"]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapType>("MAP");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);

  const cameraRef = useRef<Mapbox.Camera>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  const mapRestaurants = selectedRestaurantId
    ? restaurants.filter((restaurant) => restaurant.id === selectedRestaurantId)
    : restaurants;

  const restaurantsWithLocation = mapRestaurants.filter(
    (restaurant) =>
      typeof restaurant.latitude === "number" &&
      typeof restaurant.longitude === "number",
  );

  const restaurantsGeoJson = {
    type: "FeatureCollection" as const,
    features: restaurantsWithLocation.map((restaurant) => ({
      type: "Feature" as const,
      id: restaurant.id,
      properties: {
        id: restaurant.id,
        name: restaurant.name,
        favorite: !!restaurant.userRestaurant?.favorite,
        visited: !!restaurant.userRestaurant?.visited,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [
          restaurant.longitude as number,
          restaurant.latitude as number,
        ],
      },
    })),
  };

  useEffect(() => {
    loadUserLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, []),
  );

  async function loadRestaurants() {
    try {
      const restaurants = await api.restaurants.savedMine();

      setRestaurants(
        restaurants.map((item: any) => ({
          ...item.restaurant,
          userRestaurant: {
            wantToTry: item.wantToTry,
            visited: item.visited,
            favorite: item.favorite,
            visitedAt: item.visitedAt,
            favoritedAt: item.favoritedAt,
          },
        })),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") return;

      const location =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));

      if (!location) return;

      setUserLocation(location);

      cameraRef.current?.setCamera({
        centerCoordinate: [location.coords.longitude, location.coords.latitude],
        zoomLevel: 14,
        animationDuration: 600,
      });
    } catch (error) {
      console.error("Could not get current location:", error);
    }
  }

  function selectRestaurant(restaurant: Restaurant) {
    setSelectedRestaurantId(restaurant.id);
    setIsSearching(false);
    setViewMode("MAP");

    if (
      typeof restaurant.latitude !== "number" ||
      typeof restaurant.longitude !== "number"
    ) {
      return;
    }

    setTimeout(() => {
      cameraRef.current?.setCamera({
        centerCoordinate: [
          restaurant.longitude as number,
          restaurant.latitude as number,
        ],
        zoomLevel: 15,
        animationDuration: 600,
      });
    }, 100);
  }

  function restaurantSearchFn(query: string, restaurant: Restaurant): boolean {
    const q = query.trim().toLowerCase();

    return (
      (restaurant.name ?? "").toLowerCase().includes(q) ||
      (restaurant.address ?? "").toLowerCase().includes(q) ||
      (restaurant.city ?? "").toLowerCase().includes(q)
    );
  }

  function renderRestaurant(restaurant: Restaurant) {
    return (
      <View className="flex-row items-center border-b border-gray-100 p-4">
        <Avatar uri={restaurant.logoUrl} username={restaurant.name} size={56} />

        <View className="ml-4 flex-1">
          <Text className="text-base font-bold text-black">
            {restaurant.name}
          </Text>

          {!!restaurant.address && (
            <Text className="mt-1 text-sm text-gray-500">
              {restaurant.address}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "white" }}>
      {isSearching ? (
        <Animated.View
          key="search"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchResultsView
            data={restaurants}
            placeholder={t("map:searchRestaurants")}
            emptyText={t("map:noRestaurantsFound")}
            keyExtractor={(restaurant) => restaurant.id}
            searchFn={restaurantSearchFn}
            onCancel={() => setIsSearching(false)}
            onSelect={selectRestaurant}
            renderItem={renderRestaurant}
          />
        </Animated.View>
      ) : (
        <Animated.View
          key="normal"
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          className="flex-1"
        >
          <SearchBar
            editable={false}
            placeholder={t("common:search")}
            onPress={() => setIsSearching(true)}
          />

          <Tabs
            activeTab={viewMode}
            onChange={setViewMode}
            tabs={[
              { label: t("map:map"), value: "MAP" },
              { label: t("map:list"), value: "LIST" },
            ]}
          />

          {viewMode === "MAP" ? (
            <Mapbox.MapView style={{ flex: 1 }}>
              <Mapbox.Camera
                ref={cameraRef}
                zoomLevel={13}
                centerCoordinate={[
                  userLocation?.coords.longitude ?? 34.7818,
                  userLocation?.coords.latitude ?? 32.0853,
                ]}
              />
              <Mapbox.UserLocation visible />

              <Mapbox.ShapeSource
                id="restaurants"
                shape={restaurantsGeoJson}
                onPress={(event) => {
                  const feature = event.features[0];
                  const restaurantId = feature?.properties?.id;

                  if (!restaurantId) return;

                  router.push({
                    pathname: "/restaurants/[id]",
                    params: { id: restaurantId },
                  });
                }}
              >
                <Mapbox.CircleLayer
                  id="restaurant-points"
                  style={{
                    circleRadius: 8,
                    circleColor: [
                      "case",
                      ["==", ["get", "favorite"], true],
                      "#EF4444",
                      ["==", ["get", "visited"], true],
                      "#22C55E",
                      "#F7D786",
                    ],
                    circleStrokeWidth: 2,
                    circleStrokeColor: "#FFFFFF",
                  }}
                />
              </Mapbox.ShapeSource>
            </Mapbox.MapView>
          ) : (
            <FlatList
              data={restaurants}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/restaurants/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  {renderRestaurant(item)}
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
