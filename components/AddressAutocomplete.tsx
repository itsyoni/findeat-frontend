import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export type SelectedAddress = {
  id: string;
  placeName: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
};

type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number];
  text?: string;
  context?: {
    id: string;
    text: string;
  }[];
};

type Props = {
  onSelect: (address: SelectedAddress) => void;
};

export default function AddressAutocomplete({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    if (!query.trim() || query === selectedText) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      searchAddress(query);
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, selectedText]);

  async function searchAddress(text: string) {
    const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (!token) {
      console.error("Missing Mapbox access token");
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(text);

      const url =
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json` +
        `?access_token=${token}` +
        `&autocomplete=true` +
        `&country=il` +
        `&language=he,en` +
        `&types=address,poi,place`;

      const res = await fetch(url);
      const data = await res.json();

      setResults(data.features ?? []);
    } catch (error) {
      console.error(error);
    }
  }

  function getCity(feature: MapboxFeature) {
    const context = feature.context ?? [];

    const place = context.find((item) => item.id.startsWith("place."));
    const region = context.find((item) => item.id.startsWith("region."));

    return place?.text ?? region?.text;
  }

  function handleSelect(feature: MapboxFeature) {
    const [longitude, latitude] = feature.center;

    const selected: SelectedAddress = {
      id: feature.id,
      placeName: feature.place_name,
      address: feature.place_name,
      city: getCity(feature),
      latitude,
      longitude,
    };

    setSelectedText(feature.place_name);
    setQuery(feature.place_name);
    setResults([]);

    onSelect(selected);
  }

  return (
    <View className="mt-4">
      <TextInput
        className="rounded-2xl border border-gray-200 px-4 py-4 text-base text-black"
        placeholder="Search address..."
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={setQuery}
      />

      {results.length > 0 && (
        <View className="mt-2 rounded-2xl border border-gray-100 bg-white">
          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="border-b border-gray-100 p-4"
              onPress={() => handleSelect(item)}
            >
              <Text className="font-semibold text-black">
                {item.place_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
