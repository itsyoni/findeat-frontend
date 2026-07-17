const LABELS: Record<string, string> = {
  GLUTEN_FREE: "Gluten-free",
  LACTOSE_FREE: "Lactose-free",
  NUT_FREE: "Nut-free",
  SHELLFISH_FREE: "Shellfish-free",
  LOW_SODIUM: "Low sodium",
  DIABETIC_FRIENDLY: "Diabetic-friendly",
  TREE_NUTS: "Tree nuts",
  MIDDLE_EASTERN: "Middle Eastern",
};

export function foodTagLabel(tag: string) {
  return (
    LABELS[tag] ??
    tag
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}
