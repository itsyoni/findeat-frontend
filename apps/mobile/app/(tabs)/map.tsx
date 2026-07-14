import { LoadingScreen } from "@/components/common";
import AppBottomSheet from "@/components/common/AppBottomSheet";
import Text from "@/components/common/AppText";
import Avatar from "@/components/common/Avatar";
import SearchBar from "@/components/common/inputs/SearchBar";
import Tabs from "@/components/common/Tabs";
import SearchResultsView from "@/components/search/SearchResultsView";
import { api } from "@/lib/api";
import {
  DEFAULT_MAP_PREFERENCES,
  getMapPreferences,
  saveMapPreferences,
} from "@/lib/mapPreferences";
import {
  Restaurant,
  RestaurantMapFilter,
  RestaurantMapSort,
} from "@findeat/types";
import { MapType } from "@findeat/types/map";
import * as Location from "expo-location";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Mapbox from "@rnmapbox/maps";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { CheckIcon, CrosshairIcon, FunnelIcon, XIcon } from "phosphor-react-native";
import { useAppTheme } from "@/contexts/ThemeContext";
import RestaurantBadge from "@/components/restaurants/RestaurantBadge";
import RestaurantStats from "@/components/restaurants/RestaurantStats";
import { useAuth } from "@/contexts/AuthContext";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "");

const MAP_STATUS_IMAGES = {
  "map-status-favorite": require("@/assets/images/map-status-heart.png"),
  "map-status-visited": require("@/assets/images/map-status-check.png"),
};

const MAP_LOGO_TRANSFORMATION =
  "c_fill,g_auto,h_128,w_128,r_max,b_transparent,f_png,q_auto";

function getCircularMapLogoUrl(url: string) {
  if (url.includes("/image/upload/")) {
    return url.replace(
      "/image/upload/",
      `/image/upload/${MAP_LOGO_TRANSFORMATION}/`,
    );
  }

  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName && /^https?:\/\//i.test(url)) {
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${MAP_LOGO_TRANSFORMATION}/${encodeURIComponent(url)}`;
  }

  return url;
}

export default function MapScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId?: string }>();
  const { t } = useTranslation(["common", "map", "restaurants"]);
  const { isDark } = useAppTheme();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapType>("MAP");
  const [isSearching, setIsSearching] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mapFilter, setMapFilter] = useState<RestaurantMapFilter>(
    DEFAULT_MAP_PREFERENCES.filter,
  );
  const [mapSort, setMapSort] = useState<RestaurantMapSort>(
    DEFAULT_MAP_PREFERENCES.sort,
  );
  const [radiusKm, setRadiusKm] = useState<number | null>(
    DEFAULT_MAP_PREFERENCES.radiusKm,
  );
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const temporaryRestaurantIdRef = useRef<string | null>(null);
  const handledRestaurantIdRef = useRef<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);

  const cameraRef = useRef<Mapbox.Camera>(null);

  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);

  useEffect(() => {
    let active = true;

    if (!user?.id) {
      return () => {
        active = false;
      };
    }

    void getMapPreferences(user.id).then((preferences) => {
      if (!active) return;
      setMapFilter(preferences.filter);
      setMapSort(preferences.sort);
      setRadiusKm(preferences.radiusKm);
      setFiltersHydrated(true);
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!filtersHydrated || !user?.id) return;

    void saveMapPreferences(user.id, {
      filter: mapFilter,
      sort: mapSort,
      radiusKm,
    }).catch((error) => console.error("Could not save map filters:", error));
  }, [filtersHydrated, mapFilter, mapSort, radiusKm, user?.id]);

  const mapRestaurants = restaurants;

  const restaurantsWithLocation = mapRestaurants.filter(
    (restaurant) =>
      typeof restaurant.latitude === "number" &&
      typeof restaurant.longitude === "number",
  );

  const restaurantLogoImages = useMemo(
    () =>
      Object.fromEntries(
        restaurantsWithLocation
          .filter((restaurant) => !!restaurant.logoUrl)
          .map((restaurant) => [
            `restaurant-logo-${restaurant.id}`,
            { uri: getCircularMapLogoUrl(restaurant.logoUrl as string) },
          ]),
      ),
    [restaurantsWithLocation],
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
          wantToTry: !!restaurant.userRestaurant?.wantToTry,
          hasOverlayStatus: !!(
            restaurant.userRestaurant?.favorite ||
            restaurant.userRestaurant?.visited
          ),
          selected: selectedRestaurant?.id === restaurant.id,
          hasLogo: !!restaurant.logoUrl,
          logoImage: `restaurant-logo-${restaurant.id}`,
          fallbackLetter: restaurant.name.trim().charAt(0).toUpperCase(),
          statusIconImage: restaurant.userRestaurant?.favorite
            ? "map-status-favorite"
            : "map-status-visited",
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

  const loadRestaurants = useCallback(async (coordinates?: { latitude: number; longitude: number }) => {
    try {
      const latitude = coordinates?.latitude ?? userLocation?.coords.latitude ?? 32.0853;
      const longitude = coordinates?.longitude ?? userLocation?.coords.longitude ?? 34.7818;
      const nextRestaurants = await api.restaurants.discoverForMap({
        latitude,
        longitude,
        radiusKm: radiusKm ?? undefined,
        limit: 10,
        filter: mapFilter,
        sort: mapSort,
      });

      const requestedId =
        restaurantId && handledRestaurantIdRef.current !== restaurantId
          ? restaurantId
          : undefined;
      let requestedRestaurant = requestedId
        ? nextRestaurants.find((restaurant) => restaurant.id === requestedId)
        : undefined;

      if (requestedId && !requestedRestaurant) {
        requestedRestaurant = await api.restaurants.get(requestedId);
        nextRestaurants.push(requestedRestaurant);
        temporaryRestaurantIdRef.current = requestedRestaurant.id;
      } else if (requestedRestaurant) {
        temporaryRestaurantIdRef.current = null;
      }

      setRestaurants(nextRestaurants);

      if (requestedRestaurant) {
        handledRestaurantIdRef.current = requestedRestaurant.id;
        setSelectedRestaurant(requestedRestaurant);
        setIsSearching(false);
        setViewMode("MAP");

        if (
          typeof requestedRestaurant.latitude === "number" &&
          typeof requestedRestaurant.longitude === "number"
        ) {
          setTimeout(() => {
            cameraRef.current?.setCamera({
              centerCoordinate: [
                requestedRestaurant!.longitude as number,
                requestedRestaurant!.latitude as number,
              ],
              zoomLevel: 15,
              padding: {
                paddingBottom: 220,
                paddingTop: 80,
                paddingLeft: 40,
                paddingRight: 40,
              },
              animationDuration: 600,
            });
          }, 150);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [mapFilter, mapSort, radiusKm, restaurantId, userLocation]);

  const dismissRestaurantPreview = useCallback(() => {
    setSelectedRestaurant(null);
    handledRestaurantIdRef.current = null;

    const temporaryId = temporaryRestaurantIdRef.current;
    if (temporaryId) {
      setRestaurants((current) =>
        current.filter((restaurant) => restaurant.id !== temporaryId),
      );
      temporaryRestaurantIdRef.current = null;
    }
  }, []);

  const loadUserLocation = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!filtersHydrated) return undefined;

      if (!userLocation) {
        void loadUserLocation();
      }
      void loadRestaurants();
      return dismissRestaurantPreview;
    }, [dismissRestaurantPreview, filtersHydrated, loadRestaurants, loadUserLocation, userLocation]),
  );

  function selectRestaurant(restaurant: Restaurant) {
    const temporaryId = temporaryRestaurantIdRef.current;
    if (temporaryId && temporaryId !== restaurant.id) {
      setRestaurants((current) =>
        current.filter((item) => item.id !== temporaryId),
      );
      temporaryRestaurantIdRef.current = null;
    }

    setSelectedRestaurant(restaurant);
    void hydrateSelectedRestaurant(restaurant);
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

  async function hydrateSelectedRestaurant(restaurant: Restaurant) {
    try {
      const details = await api.restaurants.get(restaurant.id);
      const hydrated = {
        ...details,
        userRestaurant: restaurant.userRestaurant ?? details.userRestaurant,
      };
      setSelectedRestaurant((current) =>
        current?.id === restaurant.id ? hydrated : current,
      );
      setRestaurants((current) =>
        current.map((item) => (item.id === restaurant.id ? hydrated : item)),
      );
    } catch (error) {
      console.error("Could not load restaurant preview", error);
    }
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
        <Avatar uri={restaurant.logoUrl} username={restaurant.name} size={56} fallbackType="restaurant" />

        <View className="ml-4 flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-bold text-black dark:text-white">{restaurant.name}</Text>
            <RestaurantBadge status={restaurant.status} />
          </View>

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

  const selectedReviews =
    selectedRestaurant?.posts?.filter((post) => post.type === "REVIEW") ?? [];
  const selectedRatings = selectedReviews
    .map((post) => post.rating)
    .filter((rating): rating is number => rating != null);
  const selectedAverageRating =
    selectedRestaurant?.averageRating ?? (selectedRatings.length > 0
      ? selectedRatings.reduce((total, rating) => total + rating, 0) /
        selectedRatings.length
      : null);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: isDark ? "#000" : "#FBFAF8" }}
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
            rightAccessory={
              <TouchableOpacity
                onPress={() => setFiltersOpen(true)}
                className="h-full aspect-square items-center justify-center rounded-2xl bg-ink dark:bg-white"
              >
                <FunnelIcon
                  size={21}
                  color={isDark ? "#000" : "#FFF"}
                  weight={mapFilter === "ALL" ? "regular" : "fill"}
                />
              </TouchableOpacity>
            }
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
                styleURL={
                  isDark ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Street
                }
                onPress={() => {
                  bottomSheetRef.current?.close();
                  dismissRestaurantPreview();
                }}
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

                <Mapbox.Images
                  images={{ ...restaurantLogoImages, ...MAP_STATUS_IMAGES }}
                />

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

                    const temporaryId = temporaryRestaurantIdRef.current;
                    if (temporaryId && temporaryId !== restaurant.id) {
                      setRestaurants((current) =>
                        current.filter((item) => item.id !== temporaryId),
                      );
                      temporaryRestaurantIdRef.current = null;
                    }

                    setSelectedRestaurant(restaurant);
                    void hydrateSelectedRestaurant(restaurant);

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
                    id="restaurant-selected-ring"
                    filter={[
                      "all",
                      ["!", ["has", "point_count"]],
                      ["==", ["get", "selected"], true],
                    ]}
                    style={{
                      circleRadius: 26,
                      circleColor: "#111827",
                      circleStrokeWidth: 2,
                      circleStrokeColor: "#FFFFFF",
                    }}
                  />

                  <Mapbox.CircleLayer
                    id="restaurant-logo-border"
                    filter={["!", ["has", "point_count"]]}
                    style={{
                      circleRadius: 23,
                      circleColor: [
                        "case",
                        ["==", ["get", "favorite"], true],
                        "#EF4444",
                        ["==", ["get", "visited"], true],
                        "#22C55E",
                        ["==", ["get", "wantToTry"], true],
                        "#EAB308",
                        "#6B7280",
                      ],
                      circleStrokeWidth: 2,
                      circleStrokeColor: "#FFFFFF",
                    }}
                  />

                  <Mapbox.CircleLayer
                    id="restaurant-logo-background"
                    filter={["!", ["has", "point_count"]]}
                    style={{
                      circleRadius: 19,
                      circleColor: isDark ? "#1F2937" : "#FFFFFF",
                    }}
                  />

                  <Mapbox.SymbolLayer
                    id="restaurant-logo-images"
                    filter={[
                      "all",
                      ["!", ["has", "point_count"]],
                      ["==", ["get", "hasLogo"], true],
                    ]}
                    style={{
                      iconImage: ["get", "logoImage"],
                      iconSize: 0.25,
                      iconAllowOverlap: true,
                      iconIgnorePlacement: true,
                    }}
                  />

                  <Mapbox.SymbolLayer
                    id="restaurant-logo-fallback"
                    filter={[
                      "all",
                      ["!", ["has", "point_count"]],
                      ["==", ["get", "hasLogo"], false],
                    ]}
                    style={{
                      textField: ["get", "fallbackLetter"],
                      textSize: 19,
                      textColor: isDark ? "#FFFFFF" : "#111827",
                      textAllowOverlap: true,
                      textIgnorePlacement: true,
                    }}
                  />

                  <Mapbox.CircleLayer
                    id="restaurant-status-overlay"
                    filter={[
                      "all",
                      ["!", ["has", "point_count"]],
                      ["==", ["get", "hasOverlayStatus"], true],
                    ]}
                    style={{
                      circleRadius: 19,
                      circleColor: [
                        "case",
                        ["==", ["get", "favorite"], true],
                        "#EF4444",
                        ["==", ["get", "visited"], true],
                        "#22C55E",
                        "#EAB308",
                      ],
                      circleOpacity: 0.42,
                    }}
                  />

                  <Mapbox.SymbolLayer
                    id="restaurant-status-icon"
                    filter={[
                      "all",
                      ["!", ["has", "point_count"]],
                      ["==", ["get", "hasOverlayStatus"], true],
                    ]}
                    style={{
                      iconImage: ["get", "statusIconImage"],
                      iconSize: 0.3,
                      iconAllowOverlap: true,
                      iconIgnorePlacement: true,
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
                </Mapbox.ShapeSource>
              </Mapbox.MapView>

              {selectedRestaurant && (
                <BottomSheet
                  ref={bottomSheetRef}
                  index={0}
                  snapPoints={["50%", "70%"]}
                  enablePanDownToClose
                  onClose={dismissRestaurantPreview}
                  backgroundStyle={{
                    backgroundColor: isDark ? "#111827" : "#FFF",
                    borderRadius: 28,
                    overflow: "hidden",
                  }}
                  handleIndicatorStyle={{
                    backgroundColor: isDark ? "#6B7280" : "#D1D5DB",
                    width: 44,
                  }}
                >
                  <BottomSheetView className="px-5 pb-6">
                    <TouchableOpacity
                      onPress={() => bottomSheetRef.current?.close()}
                      className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 dark:bg-gray-800"
                    >
                      <XIcon size={18} color="#6B7280" weight="bold" />
                    </TouchableOpacity>

                    <View className="flex-row items-center pt-2">
                      <Avatar
                        uri={selectedRestaurant.logoUrl}
                        username={selectedRestaurant.name}
                        size={56}
                        fallbackType="restaurant"
                      />

                      <View className="ml-4 flex-1 pr-8">
                        <View className="flex-row items-center">
                          <Text className="text-lg font-bold text-black dark:text-white">{selectedRestaurant.name}</Text>
                          <RestaurantBadge status={selectedRestaurant.status} />
                        </View>

                        <View className="mt-2 flex-row flex-wrap gap-2">
                          {selectedRestaurant.userRestaurant?.favorite && (
                            <View className="rounded-full bg-red-100 px-3 py-1">
                              <Text className="text-xs font-bold text-red-500">
                                {t("restaurants:favorite")}
                              </Text>
                            </View>
                          )}

                          {selectedRestaurant.userRestaurant?.visited && (
                            <View className="rounded-full bg-green-100 px-3 py-1">
                              <Text className="text-xs font-bold text-green-600">
                                {t("restaurants:visited")}
                              </Text>
                            </View>
                          )}

                          {selectedRestaurant.userRestaurant?.wantToTry && (
                            <View className="rounded-full bg-yellow-100 px-3 py-1">
                              <Text className="text-xs font-bold text-yellow-700">
                                {t("restaurants:wantToTry")}
                              </Text>
                            </View>
                          )}
                        </View>

                        {(selectedRestaurant.address || selectedRestaurant.city) && (
                          <Text className="mt-2 text-gray-500">
                            {[selectedRestaurant.address, selectedRestaurant.city]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                        )}
                      </View>
                    </View>

                    {!!selectedRestaurant.bio && (
                      <Text numberOfLines={3} className="mt-4 leading-5 text-gray-600 dark:text-gray-300">
                        {selectedRestaurant.bio}
                      </Text>
                    )}

                    <RestaurantStats
                      averageRating={selectedAverageRating}
                      reviewsCount={
                        selectedRestaurant.reviewsCount ?? selectedReviews.length
                      }
                      followersCount={selectedRestaurant.followersCount ?? 0}
                    />

                    <TouchableOpacity
                      className="mt-4 rounded-2xl bg-black py-3 dark:bg-white"
                      onPress={() => {
                        const selectedId = selectedRestaurant.id;
                        dismissRestaurantPreview();
                        router.push({
                          pathname: "/restaurants/[id]",
                          params: { id: selectedId },
                        });
                      }}
                    >
                      <Text className="text-center font-bold text-white dark:text-black">
                        {t("map:viewRestaurant")}
                      </Text>
                    </TouchableOpacity>
                  </BottomSheetView>
                </BottomSheet>
              )}

              <TouchableOpacity
                onPress={loadUserLocation}
                className={`absolute right-3 h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 ${
                  selectedRestaurant ? "bottom-82.5" : "bottom-2"
                }`}
              >
                <CrosshairIcon
                  size={22}
                  color={isDark ? "#FFF" : "#111"}
                  weight="fill"
                />
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

      <AppBottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        snapPoints={["68%"]}
      >
        <BottomSheetView className="flex-1 px-5 pb-7">
          <Text className="text-2xl font-bold text-black dark:text-white">
            {t("map:filters")}
          </Text>

          <Text className="mb-2 mt-5 font-bold text-black dark:text-white">
            {t("map:show")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {(["ALL", "SAVED", "WANT_TO_TRY", "VISITED", "FAVORITE", "CLAIMED"] as RestaurantMapFilter[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setMapFilter(filter)}
                className={`flex-row items-center rounded-full px-4 py-2.5 ${
                  mapFilter === filter
                    ? "bg-black dark:bg-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {mapFilter === filter && (
                  <CheckIcon size={14} color={isDark ? "#000" : "#FFF"} weight="bold" />
                )}
                <Text className={`font-bold ${mapFilter === filter ? "ml-1.5 text-white dark:text-black" : "text-black dark:text-white"}`}>
                  {t(`map:filter${filter}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-2 mt-6 font-bold text-black dark:text-white">
            {t("map:distance")}
          </Text>
          <View className="flex-row gap-2">
            {[10, 50, 100, 200].map((distance) => (
              <TouchableOpacity
                key={distance}
                onPress={() =>
                  setRadiusKm((current) =>
                    current === distance ? null : distance,
                  )
                }
                className={`flex-1 items-center rounded-xl py-3 ${radiusKm === distance ? "bg-black dark:bg-white" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <Text className={`font-bold ${radiusKm === distance ? "text-white dark:text-black" : "text-black dark:text-white"}`}>
                  {distance} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-2 mt-6 font-bold text-black dark:text-white">
            {t("map:sortBy")}
          </Text>
          <View className="gap-2">
            {(["BEST", "DISTANCE", "RATING", "MOST_REVIEWED"] as RestaurantMapSort[]).map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() => setMapSort(sort)}
                className="flex-row items-center justify-between rounded-xl bg-gray-100 px-4 py-3 dark:bg-gray-800"
              >
                <Text className="font-semibold text-black dark:text-white">
                  {t(`map:sort${sort}`)}
                </Text>
                {mapSort === sort && <CheckIcon size={18} color={isDark ? "#FFF" : "#111"} weight="bold" />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setFiltersOpen(false)}
            className="mt-auto rounded-2xl bg-black py-4 dark:bg-white"
          >
            <Text className="text-center font-bold text-white dark:text-black">
              {t("map:showPlaces")}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </AppBottomSheet>
    </SafeAreaView>
  );
}
