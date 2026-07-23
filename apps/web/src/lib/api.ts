import type {
  Chat,
  RestaurantConversation,
  RestaurantMessage,
  RestaurantNotificationsPage,
  RestaurantReview,
  MediaPurpose,
  MediaUploadTicket,
} from '@findeat/types'

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export function getAccessToken() {
  return localStorage.getItem('findeat-business-token')
}

export async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.message || 'Something went wrong')
  return body as T
}

export async function uploadImage(
  file: File,
  purpose: MediaPurpose = 'other',
): Promise<string> {
  const contentType = file.type === 'image/jpg' ? 'image/jpeg' : file.type
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(contentType)) {
    throw new Error('Please choose a JPG, PNG, WebP, HEIC, or HEIF image')
  }
  if (file.size <= 0 || file.size > 20 * 1024 * 1024) {
    throw new Error('Image must be smaller than 20 MB')
  }

  const ticket = await request<MediaUploadTicket>('/media/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      contentType,
      size: file.size,
      fileName: file.name,
      purpose,
    }),
  })
  const response = await fetch(ticket.uploadUrl, {
    method: 'PUT',
    headers: ticket.headers,
    body: file,
  })
  if (!response.ok) throw new Error('Could not upload image. Please try again.')
  return ticket.imageUrl
}

export async function loadRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]> {
  try {
    const reviews = await request<RestaurantReview[]>(`/restaurants/${restaurantId}/business/reviews`)
    return reviews.map((review) => ({ ...review, items: review.items ?? [] }))
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (!message.includes('cannot get') && !message.includes('not found')) throw error
    const fallback = await request<{ items: RestaurantReview[] }>(
      `/restaurants/${restaurantId}/posts?section=REVIEWS&limit=30`,
    )
    return fallback.items.map((review) => ({
      ...review,
      items: review.items ?? [],
      createdAt: review.createdAt ?? '',
    }))
  }
}

export async function fetchRestaurantConversations(
  restaurantId: string,
  currentUserId: string,
): Promise<RestaurantConversation[]> {
  const fetchFromChatList = async () => {
    const chats = await request<Chat[]>('/chats')
    return chats
      .filter((chat) => chat.type === 'RESTAURANT' && chat.restaurantId === restaurantId)
      .map((chat) => ({
        id: chat.id,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        unreadCount: chat.unreadCount,
        customer: chat.participants.find((participant) => participant.userId !== currentUserId)?.user ?? null,
      }))
  }

  try {
    const conversations = await request<RestaurantConversation[]>(
      `/chats/restaurants/${restaurantId}/conversations`,
    )
    return conversations.length > 0 ? conversations : fetchFromChatList()
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('cannot get') || message.includes('not found')) return fetchFromChatList()
    throw error
  }
}

export async function fetchRestaurantMessages(
  restaurantId: string,
  conversationId: string,
): Promise<RestaurantMessage[]> {
  try {
    const messages = await request<RestaurantMessage[]>(
      `/chats/restaurants/${restaurantId}/conversations/${conversationId}/messages`,
    )
    return messages.length > 0 ? messages : request<RestaurantMessage[]>(`/chats/${conversationId}/messages`)
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('cannot get') || message.includes('not found')) {
      return request<RestaurantMessage[]>(`/chats/${conversationId}/messages`)
    }
    throw error
  }
}

export async function sendRestaurantReply(
  restaurantId: string,
  conversationId: string,
  content: string,
): Promise<RestaurantMessage> {
  return request<RestaurantMessage>(
    `/chats/restaurants/${restaurantId}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ content }),
    },
  )
}

export async function fetchRestaurantNotifications(
  restaurantId: string,
): Promise<RestaurantNotificationsPage> {
  try {
    return await request<RestaurantNotificationsPage>(
      `/notifications/restaurants/${restaurantId}?limit=40`,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('cannot get') || message.includes('not found')) {
      return { items: [], nextCursor: null, unreadCount: 0 }
    }
    throw error
  }
}
