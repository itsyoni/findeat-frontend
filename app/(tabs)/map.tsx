import Avatar from "@/components/Avatar";
import Tabs from "@/components/Tabs";
import { api } from "@/lib/api";
import { Restaurant } from "@/types";
import { MapType } from "@/types/map";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MapScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<MapType>("MAP");

  const restaurantsWithLocation = restaurants.filter(
    (restaurant) =>
      typeof restaurant.latitude === "number" &&
      typeof restaurant.longitude === "number",
  );

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      const res = await api.get("/restaurants");
      setRestaurants(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
          style={{ flex: 1 }}
          initialRegion={{
            latitude: 32.0853,
            longitude: 34.7818,
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
              {/* your marker view stays the same */}
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center border-b border-gray-100 p-4"
              onPress={() =>
                router.push({
                  pathname: "/restaurants/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Avatar uri={item.avatarUrl} username={item.name} size={56} />

              <View className="ml-4 flex-1">
                <Text className="text-base font-bold text-black">
                  {item.name}
                </Text>

                {!!item.address && (
                  <Text className="mt-1 text-sm text-gray-500">
                    {item.address}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
