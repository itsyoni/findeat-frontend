export type CreatorImpactAction = "VISITED" | "CONTENT_POST" | "REVIEW_POST";

export type CreatorImpactBreakdown = {
  action: CreatorImpactAction;
  count: number;
  points: number;
  pointsPerAction: number;
};

export type CreatorImpactSummary = {
  score: number;
  breakdown: CreatorImpactBreakdown[];
};

export type CreatorLevel = {
  key:
    | "FOOD_SCOUT"
    | "TASTE_HUNTER"
    | "LOCAL_GUIDE"
    | "FLAVOR_INSIDER"
    | "RESTAURANT_EXPERT"
    | "DINING_PRO"
    | "TASTEMAKER"
    | "RESTAURANT_MASTER"
    | "CULINARY_LEGEND";
  minimumScore: number;
};

export const CREATOR_LEVELS: CreatorLevel[] = [
  { key: "FOOD_SCOUT", minimumScore: 0 },
  { key: "TASTE_HUNTER", minimumScore: 10 },
  { key: "LOCAL_GUIDE", minimumScore: 30 },
  { key: "FLAVOR_INSIDER", minimumScore: 75 },
  { key: "RESTAURANT_EXPERT", minimumScore: 150 },
  { key: "DINING_PRO", minimumScore: 300 },
  { key: "TASTEMAKER", minimumScore: 600 },
  { key: "RESTAURANT_MASTER", minimumScore: 1000 },
  { key: "CULINARY_LEGEND", minimumScore: 2000 },
];

export function getCreatorLevel(score = 0) {
  return (
    [...CREATOR_LEVELS]
      .reverse()
      .find((level) => score >= level.minimumScore) ?? CREATOR_LEVELS[0]
  );
}

export function getNextCreatorLevel(score = 0) {
  return CREATOR_LEVELS.find((level) => level.minimumScore > score) ?? null;
}
