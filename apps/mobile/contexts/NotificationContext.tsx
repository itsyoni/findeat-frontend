import NotificationPopup from "@/components/notifications/NotificationPopup";
import { notificationHref } from "@/components/notifications/notificationHelpers";
import {
  notificationUnreadQueryKey,
  notificationsQueryKey,
} from "@/hooks/useNotifications";
import { API_URL, api } from "@/lib/api";
import type { AppNotification, NotificationsPage } from "@findeat/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { router, usePathname } from "expo-router";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const relationshipNotificationTypes = new Set<AppNotification["type"]>([
  "FOLLOW",
  "FOLLOW_BACK",
  "FRIEND",
]);

function isSameNotification(
  current: AppNotification,
  incoming: AppNotification,
) {
  if (current.id === incoming.id) return true;

  return (
    !!current.actorId &&
    current.actorId === incoming.actorId &&
    relationshipNotificationTypes.has(current.type) &&
    relationshipNotificationTypes.has(incoming.type)
  );
}

function mergeNotification(
  current: InfiniteData<NotificationsPage> | undefined,
  incoming: AppNotification,
): InfiniteData<NotificationsPage> {
  if (!current) {
    return {
      pages: [{ items: [incoming], nextCursor: null }],
      pageParams: [undefined],
    };
  }

  const pages = current.pages.map((page) => ({
    ...page,
    items: page.items.filter((item) => !isSameNotification(item, incoming)),
  }));

  const firstPage = pages[0] ?? { items: [], nextCursor: null };
  pages[0] = {
    ...firstPage,
    items: [incoming, ...firstPage.items],
  };

  return { ...current, pages };
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

function openPushData(data?: Record<string, unknown>) {
  if (!data) return;
  if (typeof data.conversationId === "string")
    router.push(`/chats/${data.conversationId}`);
  else if (typeof data.postId === "string")
    router.push({ pathname: "/(posts)/[id]", params: { id: data.postId } });
  else if (typeof data.restaurantId === "string")
    router.push(`/restaurants/${data.restaurantId}`);
  else if (typeof data.actorId === "string")
    router.push({ pathname: "/(users)/[id]", params: { id: data.actorId } });
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [popup, setPopup] = useState<AppNotification | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationsScreenOpen = useRef(false);

  useEffect(() => {
    notificationsScreenOpen.current = pathname.startsWith("/notifications");

    if (notificationsScreenOpen.current) {
      setPopup(null);
      if (timer.current) clearTimeout(timer.current);
    }
  }, [pathname]);

  useEffect(() => {
    if (!user || !token) return;
    const socket = io(`${API_URL}/notifications`, { auth: { token } });

    socket.on("notification", (item: AppNotification) => {
      const current = queryClient.getQueryData<InfiniteData<NotificationsPage>>(
        notificationsQueryKey,
      );
      const replaced = current?.pages
        .flatMap((page) => page.items)
        .find((existing) => isSameNotification(existing, item));

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        notificationsQueryKey,
        (cached) => mergeNotification(cached, item),
      );
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      queryClient.setQueryData<{ count: number }>(
        notificationUnreadQueryKey,
        (unread) => ({
          count: (unread?.count ?? 0) + (replaced && !replaced.readAt ? 0 : 1),
        }),
      );
      void queryClient.invalidateQueries({
        queryKey: notificationUnreadQueryKey,
      });

      if (notificationsScreenOpen.current) {
        setPopup(null);
        return;
      }

      setPopup(item);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPopup(null), 4500);
    });

    return () => {
      socket.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [queryClient, token, user]);

  useEffect(() => {
    if (!user || !Device.isDevice || Platform.OS === "web") return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let registrationInFlight = false;
    let lastRegisteredToken: string | null = null;

    async function registerPushToken(attempt = 0): Promise<void> {
      if (registrationInFlight || cancelled) return;
      registrationInFlight = true;

      try {
        const current = await Notifications.getPermissionsAsync();
        const permission =
          current.status === "granted"
            ? current
            : await Notifications.requestPermissionsAsync();
        if (permission.status !== "granted" || cancelled) return;

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (typeof projectId !== "string") return;

        const pushToken = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        if (cancelled || pushToken.data === lastRegisteredToken) return;
        await api.notifications.registerPushToken({
          token: pushToken.data,
          platform: Platform.OS === "ios" ? "IOS" : "ANDROID",
          deviceId: Device.modelId || undefined,
        });
        lastRegisteredToken = pushToken.data;
      } catch (error) {
        if (cancelled) return;
        if (attempt < 3) {
          const delays = [2_000, 5_000, 15_000];
          retryTimer = setTimeout(
            () => void registerPushToken(attempt + 1),
            delays[attempt],
          );
          return;
        }
        console.warn(
          "Push notification registration failed after retries",
          error,
        );
      } finally {
        registrationInFlight = false;
      }
    }

    void registerPushToken();

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        openPushData(response.notification.request.content.data);
      });
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") void registerPushToken();
      },
    );
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openPushData(response.notification.request.content.data);
    });

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      responseSubscription.remove();
      appStateSubscription.remove();
    };
  }, [user?.id]);

  async function openNotification(item: AppNotification) {
    setPopup(null);
    await api.notifications.markRead(item.id);
    void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    void queryClient.invalidateQueries({
      queryKey: notificationUnreadQueryKey,
    });
    const href = notificationHref(item);
    if (href) router.push(href);
  }

  return (
    <View style={{ flex: 1 }}>
      {children}
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: insets.top, left: 0, right: 0 }}
      >
        {popup ? (
          <NotificationPopup
            key={popup.id}
            item={popup}
            onDismiss={() => setPopup(null)}
            onPress={() => void openNotification(popup)}
          />
        ) : null}
      </View>
    </View>
  );
}
