export type LegalPageKind = "privacy" | "terms" | "account-deletion";

const legalPathAliases: Record<string, LegalPageKind> = {
  "/privacy": "privacy",
  "/privacy-policy": "privacy",
  "/terms": "terms",
  "/terms-of-service": "terms",
  "/account-deletion": "account-deletion",
};

export function legalPageKind(pathname: string): LegalPageKind | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return legalPathAliases[normalized] ?? null;
}
