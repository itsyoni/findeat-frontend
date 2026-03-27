import { Tabs, Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/Icon";
import Home from "@/assets/icons/HomeSolid.svg";
import Chat from "@/assets/icons/ChatBubbleLeftSolid.svg";
import Map from "@/assets/icons/MapSolid.svg";
import AddPost from "@/assets/icons/Plus.svg";
import Profile from "@/assets/icons/UserSolid.svg";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "#999",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#fff",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon Icon={Home} size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon Icon={Chat} size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon Icon={AddPost} size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon Icon={Map} size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Icon Icon={Profile} size={focused ? size + 2 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
