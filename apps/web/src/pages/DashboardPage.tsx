import { useCallback, useEffect, useMemo, useState } from "react";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { ChatCircleDotsIcon } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { ListDashesIcon } from "@phosphor-icons/react/dist/csr/ListDashes";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { StorefrontIcon } from "@phosphor-icons/react/dist/csr/Storefront";
import type {
  AdminUser,
  AppNotification,
  BusinessAccount,
  BusinessDashboardSection,
  ManagedRestaurant,
  Menu,
  RestaurantClaim,
  RestaurantConversation,
  RestaurantReview,
} from "@findeat/types";
import { AccountAvatar } from "../components/AccountAvatar";
import { NotificationsPopover } from "../components/NotificationsPopover";
import { useInboxSocket } from "../hooks/useInboxSocket";
import { useRestaurantActivitySocket } from "../hooks/useRestaurantActivitySocket";
import {
  fetchRestaurantConversations,
  fetchRestaurantNotifications,
  loadRestaurantReviews,
  request,
} from "../lib/api";
import { AdminPage } from "./AdminPage";
import { AnalyticsPage } from "./AnalyticsPage";
import { MenuPage } from "./MenuPage";
import { MessagesPage } from "./MessagesPage";
import { OverviewPage } from "./OverviewPage";
import { ProfilePage } from "./ProfilePage";
import { ReviewsPage } from "./ReviewsPage";
import "../App.css";

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const [account, setAccount] = useState<BusinessAccount | null>(null);
  const [restaurants, setRestaurants] = useState<ManagedRestaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [conversations, setConversations] = useState<RestaurantConversation[]>(
    [],
  );
  const [restaurantNotifications, setRestaurantNotifications] = useState<
    AppNotification[]
  >([]);
  const [restaurantUnreadCount, setRestaurantUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [claims, setClaims] = useState<RestaurantClaim[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [section, setSection] = useState<BusinessDashboardSection>("overview");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | null
  >(() => localStorage.getItem("findeat-selected-restaurant"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const restaurant =
    restaurants.find((item) => item.id === selectedRestaurantId) ??
    restaurants[0];
  const activeRestaurantId = restaurant?.id;

  const loadRestaurantConversations = useCallback(
    async (restaurantId: string) => {
      if (!account?.id) return;
      const nextConversations = await fetchRestaurantConversations(
        restaurantId,
        account.id,
      );
      setConversations(nextConversations);
    },
    [account],
  );

  const loadRestaurantNotifications = useCallback(
    async (restaurantId: string, showLoading = false) => {
      if (showLoading) setNotificationsLoading(true);
      try {
        const page = await fetchRestaurantNotifications(restaurantId);
        setRestaurantNotifications(page.items);
        setRestaurantUnreadCount(page.unreadCount);
      } finally {
        if (showLoading) setNotificationsLoading(false);
      }
    },
    [],
  );

  const refreshRestaurantSummary = useCallback(async () => {
    setRestaurants(await request<ManagedRestaurant[]>("/restaurants/me"));
  }, []);

  const handleLiveActivity = useCallback(
    (notification: AppNotification) => {
      setRestaurantNotifications((current) => [
        notification,
        ...current.filter((item) => item.id !== notification.id),
      ].slice(0, 40));
      if (!notification.readAt) {
        setRestaurantUnreadCount((current) => current + 1);
      }

      if (!notification.restaurantId) return;
      void loadRestaurantNotifications(notification.restaurantId);

      if (notification.type === "MESSAGE") {
        void loadRestaurantConversations(notification.restaurantId);
      } else if (notification.type === "RESTAURANT_REVIEW") {
        void loadRestaurantReviews(notification.restaurantId).then(setReviews);
      } else if (notification.type === "RESTAURANT_FOLLOW") {
        void refreshRestaurantSummary();
      }
    },
    [
      loadRestaurantConversations,
      loadRestaurantNotifications,
      refreshRestaurantSummary,
    ],
  );

  const refreshLiveActivity = useCallback(() => {
    if (!activeRestaurantId) return;
    void loadRestaurantNotifications(activeRestaurantId);
    void loadRestaurantConversations(activeRestaurantId);
  }, [
    activeRestaurantId,
    loadRestaurantConversations,
    loadRestaurantNotifications,
  ]);

  useRestaurantActivitySocket({
    restaurantId: activeRestaurantId,
    onConnected: refreshLiveActivity,
    onNotification: handleLiveActivity,
  });

  const refreshLiveInbox = useCallback(() => {
    if (!activeRestaurantId) return;
    void loadRestaurantConversations(activeRestaurantId);
  }, [activeRestaurantId, loadRestaurantConversations]);

  useInboxSocket({
    conversationIds: conversations.map((conversation) => conversation.id),
    userId: account?.id,
    onConnected: refreshLiveInbox,
    onMessage: refreshLiveInbox,
  });

  const load = useCallback(async () => {
    try {
      const me = await request<BusinessAccount | null>("/auth/me");
      if (!me?.email) {
        onLogout();
        return;
      }
      setAccount(me);
      const isAdminAccount =
        me.isAdmin === true ||
        me.email.trim().toLowerCase() === "yonagona@gmail.com";
      setIsAdmin(isAdminAccount);

      if (isAdminAccount) {
        const [nextClaims, nextAdmins] = await Promise.all([
          request<RestaurantClaim[]>("/restaurants/claims/pending"),
          request<AdminUser[]>("/admin/admins"),
        ]);
        setClaims(nextClaims);
        setAdmins(nextAdmins);
      } else {
        setClaims([]);
        setAdmins([]);
      }

      const nextRestaurants =
        await request<ManagedRestaurant[]>("/restaurants/me");
      setRestaurants(nextRestaurants);
      if (nextRestaurants.length) {
        const nextRestaurantId = nextRestaurants.some(
          (item) => item.id === selectedRestaurantId,
        )
          ? selectedRestaurantId!
          : nextRestaurants[0].id;
        if (nextRestaurantId !== selectedRestaurantId) {
          setSelectedRestaurantId(nextRestaurantId);
          localStorage.setItem("findeat-selected-restaurant", nextRestaurantId);
        }
        const [nextMenus, nextReviews, nextConversations, nextNotifications] =
          await Promise.all([
            request<Menu[]>(
              `/business/menus?restaurantId=${encodeURIComponent(nextRestaurantId)}`,
            ),
            loadRestaurantReviews(nextRestaurantId),
            fetchRestaurantConversations(nextRestaurantId, me.id),
            fetchRestaurantNotifications(nextRestaurantId),
          ]);
        setMenus(nextMenus);
        setReviews(nextReviews);
        setConversations(nextConversations);
        setRestaurantNotifications(nextNotifications.items);
        setRestaurantUnreadCount(nextNotifications.unreadCount);
        setNotificationsLoading(false);
      } else {
        setSelectedRestaurantId(null);
        localStorage.removeItem("findeat-selected-restaurant");
        setMenus([]);
        setReviews([]);
        setConversations([]);
        setRestaurantNotifications([]);
        setRestaurantUnreadCount(0);
        setNotificationsLoading(false);
      }
      setError("");
    } catch (nextError) {
      const message =
        nextError instanceof Error
          ? nextError.message
          : "Could not load dashboard";
      if (message.toLowerCase().includes("unauthorized")) onLogout();
      else setError(message);
    } finally {
      setLoading(false);
    }
  }, [onLogout, selectedRestaurantId]);

  useEffect(() => {
    // Loading is intentionally tied to mounting the authenticated dashboard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!restaurant?.id) return;
    const interval = window.setInterval(() => {
      void loadRestaurantNotifications(restaurant.id);
      void loadRestaurantConversations(restaurant.id);
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [
    loadRestaurantConversations,
    loadRestaurantNotifications,
    restaurant?.id,
  ]);

  const itemCount = useMemo(
    () => menus.reduce((total, menu) => total + menu.items.length, 0),
    [menus],
  );
  const openRestaurantNotifications = () => {
    if (!restaurant) return;
    setNotificationsOpen(true);
    if (restaurantUnreadCount === 0) {
      void loadRestaurantNotifications(restaurant.id, true);
      return;
    }
    const readAt = new Date().toISOString();
    setRestaurantUnreadCount(0);
    setRestaurantNotifications((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt })),
    );
    setNotificationsLoading(true);
    void request(`/notifications/restaurants/${restaurant.id}/read-all`, {
      method: "PATCH",
    })
      .then(() => loadRestaurantNotifications(restaurant.id))
      .finally(() => setNotificationsLoading(false));
  };

  const selectRestaurant = (restaurantId: string) => {
    setNotificationsOpen(false);
    setMenus([]);
    setReviews([]);
    setConversations([]);
    setRestaurantNotifications([]);
    setRestaurantUnreadCount(0);
    setNotificationsLoading(true);
    setSelectedRestaurantId(restaurantId);
    localStorage.setItem("findeat-selected-restaurant", restaurantId);
  };

  const clearRestaurantNotifications = async () => {
    if (!restaurant) return;
    await request(`/notifications/restaurants/${restaurant.id}`, {
      method: "DELETE",
    });
    setRestaurantNotifications([]);
    setRestaurantUnreadCount(0);
  };

  if (loading) return <div className="loading">Loading your restaurant…</div>;
  if (error)
    return (
      <div className="loading">
        <div>
          <h2>We couldn’t open your dashboard</h2>
          <p>{error}</p>
          <div className="loading-actions">
            <button className="primary" onClick={() => void load()}>
              Try again
            </button>
            <button className="secondary" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  if (!account) return <div className="loading">Loading your account…</div>;
  if (isAdmin && (!restaurant || section === "admin"))
    return (
      <AdminPage
        claims={claims}
        admins={admins}
        account={account}
        reload={load}
        onLogout={onLogout}
        onBackToBusiness={restaurant ? () => setSection("overview") : undefined}
      />
    );
  if (!restaurant)
    return (
      <div className="loading">
        <div>
          <h2>No managed restaurant</h2>
          <p>Once your restaurant claim is approved, it will appear here.</p>
          <button className="secondary" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </div>
    );

  return (
    <div className="dashboard">
      <aside>
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FindEat</strong>
            <small>Business</small>
          </div>
        </div>
        <label
          className={`restaurant-chip ${restaurants.length > 1 ? "switchable" : ""}`}
        >
          {restaurant.logoUrl ? (
            <img src={restaurant.logoUrl} alt="" />
          ) : (
            <span>{restaurant.name.charAt(0)}</span>
          )}
          <div>
            <strong>{restaurant.name}</strong>
            <small>
              {restaurants.length > 1
                ? `${restaurants.length} restaurants · switch`
                : restaurant.city || "Restaurant"}
            </small>
          </div>
          {restaurants.length > 1 && (
            <>
              <b>⌄</b>
              <select
                aria-label="Select restaurant"
                value={restaurant.id}
                onChange={(event) => selectRestaurant(event.target.value)}
              >
                {restaurants.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </label>
        <nav>
          <button
            className={section === "overview" ? "active" : ""}
            onClick={() => setSection("overview")}
          >
            <HouseIcon className="nav-icon" weight="duotone" /> Overview
          </button>
          <button
            className={section === "dashboard" ? "active" : ""}
            onClick={() => setSection("dashboard")}
          >
            <ChartLineUpIcon className="nav-icon" weight="duotone" /> Dashboard <small className="nav-premium">PRO</small>
          </button>
          <button
            className={section === "menu" ? "active" : ""}
            onClick={() => setSection("menu")}
          >
            <ListDashesIcon className="nav-icon" weight="duotone" /> Menu
          </button>
          <button
            className={section === "reviews" ? "active" : ""}
            onClick={() => setSection("reviews")}
          >
            <StarIcon className="nav-icon" weight="duotone" /> Reviews
          </button>
          <button
            className={section === "messages" ? "active" : ""}
            onClick={() => setSection("messages")}
          >
            <ChatCircleDotsIcon className="nav-icon" weight="duotone" /> Messages{" "}
            {conversations.reduce(
              (total, conversation) => total + conversation.unreadCount,
              0,
            ) > 0 && (
              <small className="nav-count">
                {conversations.reduce(
                  (total, conversation) => total + conversation.unreadCount,
                  0,
                )}
              </small>
            )}
          </button>
          <button
            className={section === "profile" ? "active" : ""}
            onClick={() => setSection("profile")}
          >
            <StorefrontIcon className="nav-icon" weight="duotone" /> Restaurant profile
          </button>
          {isAdmin && (
            <button
              className={section === "admin" ? "active" : ""}
              onClick={() => setSection("admin")}
            >
              <ShieldCheckIcon className="nav-icon" weight="duotone" /> Admin{" "}
              <small className="nav-count">{claims.length}</small>
            </button>
          )}
        </nav>
        <div className="aside-footer">
          <p>Official posts stay mobile</p>
          <small>
            Use the FindEat app to create and publish official content.
          </small>
          <button onClick={onLogout}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <header>
          <div>
            <strong>{restaurant.name}</strong>
            <span className="claimed">Claimed</span>
          </div>
          <div className="top-actions">
            <div className="notifications-menu">
              <button
                className={`notifications-trigger ${notificationsOpen ? "active" : ""}`}
                type="button"
                aria-label="Open notifications"
                aria-expanded={notificationsOpen}
                onClick={(event) => {
                  event.stopPropagation();
                  if (notificationsOpen) setNotificationsOpen(false);
                  else openRestaurantNotifications();
                }}
              >
                <BellIcon size={21} weight="duotone" aria-hidden="true" />
                {restaurantUnreadCount > 0 && (
                  <b>
                    {restaurantUnreadCount > 99 ? "99+" : restaurantUnreadCount}
                  </b>
                )}
              </button>
              {notificationsOpen && (
                <NotificationsPopover
                  restaurant={restaurant}
                  notifications={restaurantNotifications}
                  loading={notificationsLoading}
                  onNavigate={setSection}
                  onClose={() => setNotificationsOpen(false)}
                  onClear={clearRestaurantNotifications}
                />
              )}
            </div>
            <div className="account-summary">
              <div>
                <strong>{account.displayName || account.username}</strong>
                <small>@{account.username}</small>
              </div>
              <AccountAvatar account={account} />
            </div>
          </div>
        </header>
        {section === "overview" && (
          <OverviewPage
            restaurant={restaurant}
            menuCount={menus.length}
            itemCount={itemCount}
            reviewCount={reviews.length}
            onOpenMenu={() => setSection("menu")}
            onOpenProfile={() => setSection("profile")}
          />
        )}
        {section === "dashboard" && (
          <AnalyticsPage menus={menus} reviews={reviews} />
        )}
        {section === "menu" && (
          <MenuPage
            key={restaurant.id}
            menus={menus}
            restaurantId={restaurant.id}
            reload={load}
          />
        )}
        {section === "reviews" && <ReviewsPage reviews={reviews} />}
        {section === "messages" && (
          <MessagesPage
            key={restaurant.id}
            restaurant={restaurant}
            account={account}
            conversations={conversations}
            reloadConversations={loadRestaurantConversations}
          />
        )}
        {section === "profile" && (
          <ProfilePage
            key={restaurant.id}
            restaurant={restaurant}
            onSaved={load}
          />
        )}
      </main>
    </div>
  );
}
