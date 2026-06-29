import Text from "@/components/AppText";
import Avatar from "@/components/Avatar";
import SearchResultsView from "@/components/search/SearchResultsView";
import SearchBar from "@/components/SearchBar";
import Tabs from "@/components/Tabs";
import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { MapType } from "@/types/map";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapType>("MAP");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(null);

  const mapRef = useRef<MapView>(null);
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
      const res = await api.get("/restaurants/saved/me");

      setRestaurants(
        res.data.map((item: any) => ({
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

      mapRef.current?.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        },
        600,
      );
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
      mapRef.current?.animateToRegion(
        {
          latitude: restaurant.latitude as number,
          longitude: restaurant.longitude as number,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600,
      );
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
        <Avatar
          uri={restaurant.avatarUrl}
          username={restaurant.name}
          size={56}
        />

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
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
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
            placeholder="Search restaurants"
            emptyText="No restaurants found"
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
            placeholder="Search"
            onPress={() => setIsSearching(true)}
          />

          <Tabs
            activeTab={viewMode}
            onChange={setViewMode}
            tabs={[
              { label: "Map", value: "MAP" },
              { label: "List", value: "LIST" },
            ]}
          />

          {viewMode === "MAP" ? (
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              showsUserLocation
              showsMyLocationButton
              initialRegion={{
                latitude: userLocation?.coords.latitude ?? 32.0853,
                longitude: userLocation?.coords.longitude ?? 34.7818,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {restaurantsWithLocation.map((restaurant) => (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.latitude as number,
                    longitude: restaurant.longitude as number,
                  }}
                  tracksViewChanges={false}
                  onPress={() =>
                    router.push({
                      pathname: "/restaurants/[id]",
                      params: { id: restaurant.id },
                    })
                  }
                >
                  <View
                    className={`h-5 w-5 rounded-full border-2 border-white ${
                      restaurant.userRestaurant?.favorite
                        ? "bg-red-500"
                        : restaurant.userRestaurant?.visited
                          ? "bg-green-500"
                          : "bg-[#F7D786]"
                    }`}
                  />
                </Marker>
              ))}
            </MapView>
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
