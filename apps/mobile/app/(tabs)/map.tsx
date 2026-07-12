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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Mapbox from "@rnmapbox/maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { CrosshairIcon, XIcon } from "phosphor-react-native";
import { useAppTheme } from "@/contexts/ThemeContext";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "");

export default function MapScreen() {
  const { t } = useTranslation(["common", "map"]);
  const { isDark } = useAppTheme();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapType>("MAP");
  const [isSearching, setIsSearching] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const cameraRef = useRef<Mapbox.Camera>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  const mapRestaurants = restaurants;

  const restaurantsWithLocation = mapRestaurants.filter(
    (restaurant) =>
      typeof restaurant.latitude === "number" &&
      typeof restaurant.longitude === "number",
  );

  const restaurantsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: restaurantsWithLocation.map((restaurant) => ({
        type: "Feature" as const,
        id: restaurant.id,
        properties: {
          id: restaurant.id,
          name: restaurant.name,
          favorite: !!restaurant.userRestaurant?.favorite,
          visited: !!restaurant.userRestaurant?.visited,
          selected: selectedRestaurant?.id === restaurant.id,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [
            restaurant.longitude as number,
            restaurant.latitude as number,
          ],
        },
      })),
    }),
    [restaurantsWithLocation, selectedRestaurant],
  );

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
    setSelectedRestaurant(restaurant);
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
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FFF" }}
    >
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
            <View style={{ flex: 1 }}>
              <Mapbox.MapView
                style={{ flex: 1 }}
                onPress={() => setSelectedRestaurant(null)}
              >
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
                  cluster
                  clusterRadius={50}
                  clusterMaxZoomLevel={14}
                  onPress={(event) => {
                    const feature = event.features[0];

                    if (!feature) return;

                    if (feature.properties?.cluster) {
                      setSelectedRestaurant(null);

                      const coordinates = (feature.geometry as any)
                        ?.coordinates;

                      if (Array.isArray(coordinates)) {
                        cameraRef.current?.setCamera({
                          centerCoordinate: coordinates,
                          zoomLevel: 15,
                          animationDuration: 500,
                        });
                      }

                      return;
                    }

                    const restaurantId = feature.properties?.id;

                    if (!restaurantId) return;

                    const restaurant = restaurants.find(
                      (r) => r.id === restaurantId,
                    );

                    if (!restaurant) return;

                    setSelectedRestaurant(restaurant);

                    const coordinates = (feature.geometry as any)?.coordinates;

                    if (Array.isArray(coordinates)) {
                      cameraRef.current?.setCamera({
                        centerCoordinate: coordinates,
                        zoomLevel: 16,
                        padding: {
                          paddingBottom: 220,
                          paddingTop: 80,
                          paddingLeft: 40,
                          paddingRight: 40,
                        },
                        animationDuration: 500,
                      });
                    }
                  }}
                >
                  <Mapbox.CircleLayer
                    id="restaurant-points-glow"
                    filter={["!", ["has", "point_count"]]}
                    style={{
                      circleRadius: [
                        "case",
                        ["==", ["get", "selected"], true],
                        18,
                        12,
                      ],
                      circleColor: [
                        "case",
                        ["==", ["get", "favorite"], true],
                        "#FEE2E2",
                        ["==", ["get", "visited"], true],
                        "#DCFCE7",
                        "#FEF3C7",
                      ],
                      circleOpacity: 0.9,
                    }}
                  />

                  <Mapbox.CircleLayer
                    id="restaurant-points"
                    filter={["!", ["has", "point_count"]]}
                    style={{
                      circleRadius: [
                        "case",
                        ["==", ["get", "selected"], true],
                        12,
                        8,
                      ],
                      circleColor: [
                        "case",
                        ["==", ["get", "favorite"], true],
                        "#EF4444",
                        ["==", ["get", "visited"], true],
                        "#22C55E",
                        "#F7D786",
                      ],
                      circleStrokeWidth: [
                        "case",
                        ["==", ["get", "selected"], true],
                        4,
                        2,
                      ],
                      circleStrokeColor: "#FFFFFF",
                    }}
                  />

                  <Mapbox.CircleLayer
                    id="restaurant-clusters"
                    filter={["has", "point_count"]}
                    style={{
                      circleRadius: [
                        "step",
                        ["get", "point_count"],
                        18,
                        10,
                        24,
                        50,
                        32,
                      ],
                      circleColor: "#212121",
                      circleStrokeWidth: 3,
                      circleStrokeColor: "#FFFFFF",
                    }}
                  />

                  <Mapbox.SymbolLayer
                    id="restaurant-cluster-count"
                    filter={["has", "point_count"]}
                    style={{
                      textField: ["get", "point_count_abbreviated"],
                      textSize: 13,
                      textColor: "#FFFFFF",
                      textAllowOverlap: true,
                    }}
                  />
                  <Mapbox.CircleLayer
                    id="restaurant-points"
                    filter={["!", ["has", "point_count"]]}
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

              {selectedRestaurant && (
                <BottomSheet
                  ref={bottomSheetRef}
                  index={0}
                  snapPoints={["50%", "70%"]}
                  enablePanDownToClose
                  onClose={() => setSelectedRestaurant(null)}
                >
                  <Image
                    source={{
                      uri:
                        selectedRestaurant.coverUrl ??
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
                    }}
                    style={{
                      width: "100%",
                      height: 160,
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                    }}
                    resizeMode="cover"
                  />
                  <BottomSheetView className="px-4 pb-6">
                    <TouchableOpacity
                      onPress={() => setSelectedRestaurant(null)}
                      className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2"
                    >
                      <XIcon size={18} color="#6B7280" weight="bold" />
                    </TouchableOpacity>

                    <View className="flex-row items-center pt-4">
                      <Avatar
                        uri={selectedRestaurant.logoUrl}
                        username={selectedRestaurant.name}
                        size={56}
                      />

                      <View className="ml-4 flex-1 pr-8">
                        <Text className="text-lg font-bold">
                          {selectedRestaurant.name}
                        </Text>

                        <View className="mt-3 flex-row gap-2">
                          {selectedRestaurant.userRestaurant?.favorite && (
                            <View className="rounded-full bg-red-100 px-3 py-1">
                              <Text className="text-xs font-bold text-red-500">
                                ❤️ Favorite
                              </Text>
                            </View>
                          )}

                          {selectedRestaurant.userRestaurant?.visited && (
                            <View className="rounded-full bg-green-100 px-3 py-1">
                              <Text className="text-xs font-bold text-green-600">
                                ✓ Visited
                              </Text>
                            </View>
                          )}

                          {selectedRestaurant.userRestaurant?.wantToTry && (
                            <View className="rounded-full bg-yellow-100 px-3 py-1">
                              <Text className="text-xs font-bold text-yellow-700">
                                🔖 Want to try
                              </Text>
                            </View>
                          )}
                        </View>

                        {!!selectedRestaurant.address && (
                          <Text className="text-gray-500">
                            {selectedRestaurant.address}
                          </Text>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity
                      className="mt-4 rounded-2xl bg-black py-3"
                      onPress={() =>
                        router.push({
                          pathname: "/restaurants/[id]",
                          params: { id: selectedRestaurant.id },
                        })
                      }
                    >
                      <Text className="text-center font-bold text-white">
                        View restaurant
                      </Text>
                    </TouchableOpacity>
                  </BottomSheetView>
                </BottomSheet>
              )}

              <TouchableOpacity
                onPress={loadUserLocation}
                className={`absolute right-3 h-12 w-12 items-center justify-center rounded-full bg-white ${
                  selectedRestaurant ? "bottom-82.5" : "bottom-2"
                }`}
              >
                <CrosshairIcon size={22} weight="fill" />
              </TouchableOpacity>
            </View>
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
