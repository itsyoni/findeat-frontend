export function getInitials(value?: string | null) {
  if (!value?.trim()) return "?";

  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
