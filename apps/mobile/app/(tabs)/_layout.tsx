import Avatar from "@/components/common/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs } from "expo-router";
import {
  ChatCircleIcon,
  HouseIcon,
  MapPinIcon,
  PlusCircleIcon,
} from "phosphor-react-native";
import React from "react";
import { View } from "react-native";
import { useAppTheme } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const { user } = useAuth();
  const { isDark } = useAppTheme();
  const iconColor = isDark ? "#FFF" : "#000";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#000" : "#FFF",
          borderTopColor: isDark ? "#1F2937" : "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <HouseIcon
              size={28}
              color={iconColor}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => (
            <ChatCircleIcon
              size={28}
              color={iconColor}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          tabBarIcon: ({ focused }) => (
            <PlusCircleIcon
              size={28}
              color={iconColor}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => (
            <MapPinIcon
              size={28}
              color={iconColor}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: focused ? 2 : 0,
                borderColor: iconColor,
              }}
            >
              <Avatar
                uri={user?.avatarUrl}
                username={user?.username}
                size={28}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
