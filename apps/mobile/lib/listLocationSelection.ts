import type { SelectedAddress } from "@findeat/types";

const pendingSelections = new Map<string, SelectedAddress>();

export function setPendingListLocation(listId: string, location: SelectedAddress) {
  pendingSelections.set(listId, location);
}

export function consumePendingListLocation(listId: string) {
  const location = pendingSelections.get(listId) ?? null;
  pendingSelections.delete(listId);
  return location;
}
