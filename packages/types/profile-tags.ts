export const PROFILE_TAG_KEYS = [
  "HOT_STUFF",
  "SWEET_TOOTH",
  "BRUNCH_BOSS",
  "SUSHI_SENSEI",
  "BURGER_BANDIT",
  "PASTA_LA_VISTA",
  "CAFFEINE_OPERATIVE",
  "PLANT_POWERED",
  "STREET_FOOD_SCHOLAR",
  "DISH_DETECTIVE",
] as const;

export type ProfileTagKey = (typeof PROFILE_TAG_KEYS)[number];

export const PROFILE_TAG_THRESHOLDS: Record<ProfileTagKey, number> = {
  HOT_STUFF: 50,
  SWEET_TOOTH: 50,
  BRUNCH_BOSS: 30,
  SUSHI_SENSEI: 40,
  BURGER_BANDIT: 40,
  PASTA_LA_VISTA: 40,
  CAFFEINE_OPERATIVE: 30,
  PLANT_POWERED: 50,
  STREET_FOOD_SCHOLAR: 40,
  DISH_DETECTIVE: 100,
};

export type ProfileTagCollectionItem = {
  key: ProfileTagKey;
  threshold: number;
  progress: number;
  unlockedAt?: string | null;
  isNew: boolean;
  isSelected: boolean;
};

export type ProfileTagCollection = {
  selectedKey?: ProfileTagKey | null;
  hasUnseen: boolean;
  items: ProfileTagCollectionItem[];
};

export type ProfileTagStatus = {
  hasUnseen: boolean;
  unseenCount: number;
};
