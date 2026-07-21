import { httpError } from "./errors.js";

export function normalizeUsername(value) {
  const username = normalizeRequiredString(value, "username").toLowerCase();

  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
    throw httpError(400, "Username must be 3-32 characters using letters, numbers, dot, dash, or underscore");
  }

  return username;
}

export function normalizePassword(value) {
  const password = normalizeRequiredString(value, "password");

  if (password.length < 6) {
    throw httpError(400, "Password must be at least 6 characters");
  }

  return password;
}

export function normalizeCategory(value) {
  const category = normalizeRequiredString(value, "category");

  if (category.length > 40) {
    throw httpError(400, "Category must be 40 characters or fewer");
  }

  return category;
}

export function normalizeRequiredString(value, fieldName) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw httpError(400, `${fieldName} is required`);
  }

  return normalized;
}

export function normalizeOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateFlashcards(value, options = {}) {
  if (!Array.isArray(value)) {
    throw httpError(400, "flashcards must be an array");
  }

  return value.map((card, index) => normalizeFlashcard(card, index, options));
}

export function normalizeFlashcard(card, index = 0, options = {}) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw httpError(400, `flashcards[${index}] must be an object`);
  }

  const meaning = options.allowEmptyMeaning
    ? normalizeOptionalString(card.meaning)
    : normalizeRequiredString(card.meaning, `flashcards[${index}].meaning`);

  return {
    id: normalizeOptionalString(card.id || card.cardId),
    cardId: normalizeOptionalString(card.cardId || card.id),
    word: normalizeRequiredString(card.word, `flashcards[${index}].word`),
    meaning,
    wordform: normalizeOptionalString(card.wordform),
    category: normalizeOptionalString(card.category) || "Uncategorized",
    createdAt: normalizeOptionalString(card.createdAt),
    updatedAt: normalizeOptionalString(card.updatedAt),
    syncedAt: normalizeOptionalString(card.syncedAt),
    sourceUrl: normalizeOptionalString(card.sourceUrl),
    sourceTitle: normalizeOptionalString(card.sourceTitle)
  };
}

export function normalizeCategoryList(categories) {
  const byKey = new Map();

  for (const category of categories || []) {
    const normalized = normalizeOptionalString(category);

    if (!normalized) {
      continue;
    }

    const key = normalized.toLowerCase();

    if (!byKey.has(key)) {
      byKey.set(key, normalized);
    }
  }

  if (!byKey.has("uncategorized")) {
    byKey.set("uncategorized", "Uncategorized");
  }

  return [...byKey.values()].sort((a, b) => {
    if (a.toLowerCase() === "uncategorized") {
      return -1;
    }

    if (b.toLowerCase() === "uncategorized") {
      return 1;
    }

    return a.localeCompare(b);
  });
}
