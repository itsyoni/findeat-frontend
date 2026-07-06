export function nullToUndefined<T>(value: T | null | undefined) {
  return value ?? undefined;
}
