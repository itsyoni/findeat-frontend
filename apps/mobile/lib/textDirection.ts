export function isRtlText(text?: string | null, fallback = false) {
  if (!text) return fallback;

  for (const character of text.trim()) {
    if (/[֐-ࣿיִ-﷿ﹰ-﻿]/.test(character)) {
      return true;
    }

    if (/[A-Za-z]/.test(character)) {
      return false;
    }
  }

  return fallback;
}
