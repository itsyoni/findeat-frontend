import { Tabs, Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/Icon";
import HomeSolid from "@/assets/icons/HomeSolid.svg";
import HomeOutline from "@/assets/icons/HomeOutline.svg";
import ChatSolid from "@/assets/icons/ChatBubbleLeftSolid.svg";
import ChatOutline from "@/assets/icons/ChatBubbleLeftOutline.svg";
import MapSolid from "@/assets/icons/MapSolid.svg";
import MapOutline from "@/assets/icons/MapOutline.svg";
import AddPost from "@/assets/icons/Plus.svg";
import ProfileSolid from "@/assets/icons/UserSolid.svg";
import ProfileOutline from "@/assets/icons/UserOutline.svg";

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
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: "#212121",
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: "#F7D786",
        },
        headerShown: false,
      }}
      backBehavior="history"
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon Icon={focused ? HomeSolid : HomeOutline} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon Icon={focused ? ChatSolid : ChatOutline} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          tabBarIcon: ({ color }) => <Icon Icon={AddPost} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon Icon={focused ? MapSolid : MapOutline} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Icon
              Icon={focused ? ProfileSolid : ProfileOutline}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
