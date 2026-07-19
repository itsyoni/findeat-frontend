import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import type {
  CreateReviewDraft,
  CreateReviewStep,
  Dish,
  PostVisibility,
  ReviewDishFormDraft,
  SelectedRestaurant,
} from "@findeat/types";

export type ContentPostDraft = {
  step: "CAMERA" | "DETAILS" | "RESTAURANT";
  imageUri: string;
  description: string;
  visibility: PostVisibility;
  linkedPostId?: string;
  selectedRestaurant: SelectedRestaurant | null;
  updatedAt: string;
};

export type ReviewPostDraft = {
  step: CreateReviewStep;
  draft: CreateReviewDraft;
  selectedMenuDish: Dish | null;
  pendingDish: ReviewDishFormDraft | null;
  updatedAt: string;
};

type DraftType = "content" | "review";

function storageKey(userId: string, type: DraftType) {
  return `findeat_post_draft_${userId}_${type}`;
}

function draftDirectory(userId: string, type: DraftType) {
  return `${FileSystem.documentDirectory}post-drafts/${userId}/${type}/`;
}

async function keepDraftImage(
  uri: string | undefined,
  userId: string,
  type: DraftType,
  name: string,
) {
  if (!uri) return undefined;
  const directory = draftDirectory(userId, type);
  if (uri.startsWith(directory)) return uri;

  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const extension = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] ?? "jpg";
  const uriHash = [...uri].reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    0,
  );
  const destination = `${directory}${name}-${uriHash}.${extension}`;
  const existing = await FileSystem.getInfoAsync(destination);
  if (existing.exists) return destination;
  await FileSystem.copyAsync({ from: uri, to: destination });
  return destination;
}

async function existingImage(uri: string | undefined) {
  if (!uri) return undefined;
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists ? uri : undefined;
}

export async function loadContentPostDraft(userId: string) {
  const stored = await AsyncStorage.getItem(storageKey(userId, "content"));
  if (!stored) return null;
  const parsed = JSON.parse(stored) as ContentPostDraft;
  const imageUri = await existingImage(parsed.imageUri);
  if (!imageUri) {
    await clearPostDraft(userId, "content");
    return null;
  }
  return { ...parsed, imageUri };
}

export async function saveContentPostDraft(
  userId: string,
  draft: Omit<ContentPostDraft, "updatedAt">,
) {
  const imageUri = await keepDraftImage(
    draft.imageUri,
    userId,
    "content",
    "post-image",
  );
  if (!imageUri) return;
  await AsyncStorage.setItem(
    storageKey(userId, "content"),
    JSON.stringify({ ...draft, imageUri, updatedAt: new Date().toISOString() }),
  );
}

export async function loadReviewPostDraft(userId: string) {
  const stored = await AsyncStorage.getItem(storageKey(userId, "review"));
  if (!stored) return null;
  const parsed = JSON.parse(stored) as ReviewPostDraft;
  return {
    ...parsed,
    draft: {
      ...parsed.draft,
      coverImageUri: await existingImage(parsed.draft.coverImageUri),
      items: await Promise.all(
        parsed.draft.items.map(async (item) => ({
          ...item,
          imageUri: await existingImage(item.imageUri),
        })),
      ),
    },
    pendingDish: parsed.pendingDish
      ? {
          ...parsed.pendingDish,
          imageUri: await existingImage(parsed.pendingDish.imageUri),
        }
      : null,
  };
}

export async function saveReviewPostDraft(
  userId: string,
  value: Omit<ReviewPostDraft, "updatedAt">,
) {
  const draft = {
    ...value.draft,
    coverImageUri: await keepDraftImage(
      value.draft.coverImageUri,
      userId,
      "review",
      "cover",
    ),
    items: await Promise.all(
      value.draft.items.map(async (item) => ({
        ...item,
        imageUri: await keepDraftImage(
          item.imageUri,
          userId,
          "review",
          `dish-${item.id}`,
        ),
      })),
    ),
  };
  const pendingDish = value.pendingDish
    ? {
        ...value.pendingDish,
        imageUri: await keepDraftImage(
          value.pendingDish.imageUri,
          userId,
          "review",
          "pending-dish",
        ),
      }
    : null;
  await AsyncStorage.setItem(
    storageKey(userId, "review"),
    JSON.stringify({
      ...value,
      draft,
      pendingDish,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export async function clearPostDraft(userId: string, type: DraftType) {
  await AsyncStorage.removeItem(storageKey(userId, type));
  await FileSystem.deleteAsync(draftDirectory(userId, type), {
    idempotent: true,
  });
}
