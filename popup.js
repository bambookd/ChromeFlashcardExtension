const API_BASE_URL = "http://localhost:3000";
const STUDY_URL = `${API_BASE_URL}/study`;
const STORAGE_KEY = "flashcards";
const AUTH_STORAGE_KEY = "flashcardAuth";
const CATEGORY_STORAGE_KEY = "flashcardCategories";
const ADD_CATEGORY_VALUE = "__add_category__";

const elements = {
  form: document.getElementById("flashcardForm"),
  authForm: document.getElementById("authForm"),
  loggedOutView: document.getElementById("loggedOutView"),
  loggedInView: document.getElementById("loggedInView"),
  accountName: document.getElementById("accountName"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  registerButton: document.getElementById("registerButton"),
  logoutButton: document.getElementById("logoutButton"),
  word: document.getElementById("wordInput"),
  meaning: document.getElementById("meaningInput"),
  wordform: document.getElementById("wordformInput"),
  category: document.getElementById("categoryInput"),
  deleteCategoryButton: document.getElementById("deleteCategoryButton"),
  list: document.getElementById("flashcardList"),
  emptyState: document.getElementById("emptyState"),
  cardCount: document.getElementById("cardCount"),
  status: document.getElementById("statusMessage"),
  syncButton: document.getElementById("syncButton"),
  translateButton: document.getElementById("translateButton"),
  exportButton: document.getElementById("exportButton"),
  clearButton: document.getElementById("clearButton"),
  openStudyButton: document.getElementById("openStudyButton")
};

const storage = {
  async getCards() {
    const result = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
    return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
  },

  async setCards(cards) {
    await chrome.storage.local.set({ [STORAGE_KEY]: cards });
  },

  async getAuth() {
    const result = await chrome.storage.local.get({ [AUTH_STORAGE_KEY]: null });
    return result[AUTH_STORAGE_KEY];
  },

  async setAuth(auth) {
    await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: auth });
  },

  async clearAuth() {
    await chrome.storage.local.remove(AUTH_STORAGE_KEY);
  },

  async getCategories() {
    const result = await chrome.storage.local.get({ [CATEGORY_STORAGE_KEY]: ["Uncategorized"] });
    return normalizeCategoryList(result[CATEGORY_STORAGE_KEY]);
  },

  async setCategories(categories) {
    await chrome.storage.local.set({ [CATEGORY_STORAGE_KEY]: normalizeCategoryList(categories) });
  }
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await renderAuth();
  await renderCategories();
  await renderCards();
}

function bindEvents() {
  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuth("login");
  });
  elements.registerButton.addEventListener("click", () => handleAuth("register"));
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.form.addEventListener("submit", handleSave);
  elements.syncButton.addEventListener("click", handleSync);
  elements.translateButton.addEventListener("click", handleTranslate);
  elements.category.addEventListener("change", handleCategoryChange);
  elements.deleteCategoryButton.addEventListener("click", handleDeleteCategory);
  elements.exportButton.addEventListener("click", handleExport);
  elements.clearButton.addEventListener("click", handleClear);
  elements.openStudyButton.addEventListener("click", handleOpenStudy);
  elements.list.addEventListener("click", handleListClick);
}

async function handleAuth(mode) {
  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const button = mode === "register" ? elements.registerButton : elements.authForm.querySelector("button[type='submit']");

  setBusy(button, true, mode === "register" ? "Creating" : "Logging in");

  try {
    const response = await fetchJson(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        username: elements.username.value.trim(),
        password: elements.password.value
      })
    });

    await storage.setAuth({
      token: response.token,
      user: response.user
    });

    await renderAuth();
    await loadCloudCategories(response.token);
    setStatus(`Logged in as ${response.user.username}.`, "success");
  } catch (error) {
    setStatus(`${mode === "register" ? "Register" : "Login"} failed: ${error.message}`, "error");
  } finally {
    setBusy(button, false, mode === "register" ? "Register" : "Login");
  }
}

async function handleLogout() {
  await storage.clearAuth();
  await renderAuth();
  setStatus("Logged out from cloud account.", "success");
}

async function handleCategoryChange() {
  if (elements.category.value !== ADD_CATEGORY_VALUE) {
    elements.category.dataset.previousValue = elements.category.value;
    elements.deleteCategoryButton.disabled = elements.category.value === "Uncategorized";
    return;
  }

  const previousValue = elements.category.dataset.previousValue || "Uncategorized";
  const category = window.prompt("New category name:");

  if (!category?.trim()) {
    elements.category.value = previousValue;
    return;
  }

  const normalized = normalizeCategoryName(category);

  if (!normalized) {
    elements.category.value = previousValue;
    return;
  }

  await ensureLocalCategory(normalized);

  const auth = await storage.getAuth();
  if (auth?.token) {
    await createCloudCategory(auth.token, normalized).catch((error) => {
      setStatus(`Category saved locally, cloud add failed: ${error.message}`, "error");
    });
  }

  await renderCategories(normalized);
  setStatus(`Added category "${normalized}".`, "success");
}

async function handleDeleteCategory() {
  const category = getSelectedCategory();

  if (category === "Uncategorized") {
    setStatus("Uncategorized cannot be deleted.", "error");
    return;
  }

  const confirmed = window.confirm(`Delete category "${category}"? Cards using it will move to Uncategorized.`);

  if (!confirmed) {
    return;
  }

  const categories = await storage.getCategories();
  await storage.setCategories(categories.filter((item) => item.toLowerCase() !== category.toLowerCase()));

  const cards = await storage.getCards();
  await storage.setCards(cards.map((card) => (
    card.category?.toLowerCase() === category.toLowerCase()
      ? { ...card, category: "Uncategorized", updatedAt: new Date().toISOString(), syncedAt: null }
      : card
  )));

  const auth = await storage.getAuth();
  if (auth?.token) {
    await deleteCloudCategory(auth.token, category).catch((error) => {
      setStatus(`Category deleted locally, cloud delete failed: ${error.message}`, "error");
    });
  }

  await renderCategories("Uncategorized");
  await renderCards();
  setStatus(`Deleted category "${category}".`, "success");
}

async function handleSave(event) {
  event.preventDefault();

  const card = {
    id: crypto.randomUUID(),
    word: elements.word.value.trim(),
    meaning: elements.meaning.value.trim(),
    wordform: elements.wordform.value.trim(),
    category: getSelectedCategory(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncedAt: null
  };

  if (!card.word || !card.meaning) {
    setStatus("Word and meaning are required.", "error");
    return;
  }

  const cards = await storage.getCards();
  await ensureLocalCategory(card.category);
  await storage.setCards([card, ...cards]);

  elements.form.reset();
  elements.word.focus();
  setStatus("Saved locally.", "success");
  await renderCategories(card.category);
  await renderCards();
}

async function handleSync() {
  const cards = await storage.getCards();

  if (cards.length === 0) {
    setStatus("No local flashcards to sync.", "error");
    return;
  }

  const auth = await requireAuth();

  if (!auth) {
    return;
  }

  setBusy(elements.syncButton, true, "Syncing");

  try {
    const response = await fetchJson(`${API_BASE_URL}/api/sync`, {
      method: "POST",
      headers: authHeaders(auth),
      body: JSON.stringify({ flashcards: cards })
    });

    const syncedAt = response.syncedAt || new Date().toISOString();
    const syncedCards = cards.map((card) => ({ ...card, syncedAt, updatedAt: card.updatedAt || syncedAt }));
    await storage.setCards(syncedCards);

    setStatus(`Synced ${response.count} flashcard${response.count === 1 ? "" : "s"} to ${auth.user.username}.`, "success");
    await renderCards();
  } catch (error) {
    setStatus(`Sync failed: ${error.message}`, "error");
  } finally {
    setBusy(elements.syncButton, false, "Sync to Cloud");
  }
}

async function handleTranslate() {
  const word = elements.word.value.trim();

  if (!word) {
    setStatus("Enter a word before translating.", "error");
    elements.word.focus();
    return;
  }

  setBusy(elements.translateButton, true, "...");

  try {
    const result = await fetchJson(`${API_BASE_URL}/api/translate`, {
      method: "POST",
      body: JSON.stringify({ word })
    });

    elements.meaning.value = result.meaning;
    if (!elements.wordform.value && result.wordform) {
      elements.wordform.value = result.wordform;
    }

    setStatus("Translation loaded from local API.", "success");
  } catch (error) {
    setStatus(`Translation failed: ${error.message}`, "error");
  } finally {
    setBusy(elements.translateButton, false, "Translate");
  }
}

async function handleExport() {
  const auth = await requireAuth();

  if (!auth) {
    return;
  }

  setBusy(elements.exportButton, true, "Exporting");

  try {
    const cards = await storage.getCards();
    const response = await fetchJson(`${API_BASE_URL}/api/export`, {
      method: "POST",
      headers: authHeaders(auth),
      body: JSON.stringify({ flashcards: cards })
    });

    chrome.tabs.create({ url: `${API_BASE_URL}${response.downloadUrl}` });
    setStatus("Export generated by local API.", "success");
  } catch (error) {
    setStatus(`Export failed: ${error.message}`, "error");
  } finally {
    setBusy(elements.exportButton, false, "Export JSON");
  }
}

async function handleClear() {
  const cards = await storage.getCards();

  if (cards.length === 0) {
    setStatus("Local storage is already empty.", "error");
    return;
  }

  await storage.setCards([]);
  setStatus("Local flashcards cleared.", "success");
  await renderCards();
}

function handleOpenStudy() {
  chrome.tabs.create({ url: STUDY_URL });
}

async function handleListClick(event) {
  const button = event.target.closest("[data-delete-id]");
  if (!button) {
    return;
  }

  const cardId = button.dataset.deleteId;
  const cards = await storage.getCards();
  await storage.setCards(cards.filter((card) => card.id !== cardId));
  setStatus("Flashcard deleted locally.", "success");
  await renderCards();
}

async function renderAuth() {
  const auth = await storage.getAuth();
  const isLoggedIn = Boolean(auth?.token && auth?.user);

  elements.loggedOutView.classList.toggle("is-hidden", isLoggedIn);
  elements.loggedInView.classList.toggle("is-hidden", !isLoggedIn);
  elements.accountName.textContent = isLoggedIn ? auth.user.username : "";
}

async function renderCategories(selectedValue = elements.category.value || "Uncategorized") {
  const cards = await storage.getCards();
  const storedCategories = await storage.getCategories();
  const categories = normalizeCategoryList([
    ...storedCategories,
    ...cards.map((card) => card.category).filter(Boolean)
  ]);

  await storage.setCategories(categories);
  elements.category.textContent = "";

  for (const category of categories) {
    elements.category.append(new Option(category, category));
  }

  elements.category.append(new Option("+ Add category", ADD_CATEGORY_VALUE));
  elements.category.value = categories.includes(selectedValue) ? selectedValue : "Uncategorized";
  elements.category.dataset.previousValue = elements.category.value;
  elements.deleteCategoryButton.disabled = elements.category.value === "Uncategorized";
}

async function renderCards() {
  const cards = await storage.getCards();

  elements.list.textContent = "";
  elements.emptyState.classList.toggle("is-visible", cards.length === 0);
  elements.cardCount.textContent = `${cards.length} saved card${cards.length === 1 ? "" : "s"}`;

  const fragment = document.createDocumentFragment();

  for (const card of cards) {
    fragment.appendChild(createCardElement(card));
  }

  elements.list.appendChild(fragment);
}

function getSelectedCategory() {
  return elements.category.value && elements.category.value !== ADD_CATEGORY_VALUE
    ? elements.category.value
    : "Uncategorized";
}

async function ensureLocalCategory(category) {
  const categories = await storage.getCategories();
  await storage.setCategories([...categories, category]);
}

async function loadCloudCategories(token) {
  const response = await fetchJson(`${API_BASE_URL}/api/categories`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const localCategories = await storage.getCategories();
  await storage.setCategories([...localCategories, ...(response.categories || [])]);
  await renderCategories();
}

async function createCloudCategory(token, category) {
  return fetchJson(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ category })
  });
}

async function deleteCloudCategory(token, category) {
  return fetchJson(`${API_BASE_URL}/api/categories/${encodeURIComponent(category)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

function normalizeCategoryName(value) {
  return typeof value === "string" ? value.trim().slice(0, 40) : "";
}

function normalizeCategoryList(categories) {
  const byKey = new Map();

  for (const category of categories || []) {
    const normalized = normalizeCategoryName(category);

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

function createCardElement(card) {
  const item = document.createElement("li");
  item.className = "flashcard-item";

  const topLine = document.createElement("div");
  topLine.className = "flashcard-topline";

  const word = document.createElement("h2");
  word.className = "flashcard-word";
  word.textContent = card.word;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-card";
  deleteButton.type = "button";
  deleteButton.title = `Delete ${card.word}`;
  deleteButton.dataset.deleteId = card.id;
  deleteButton.textContent = "x";

  topLine.append(word, deleteButton);

  const meaning = document.createElement("p");
  meaning.className = "flashcard-meaning";
  meaning.textContent = card.meaning;

  const metaRow = document.createElement("div");
  metaRow.className = "meta-row";

  const metaItems = [
    card.wordform ? card.wordform : null,
    card.category ? card.category : null,
    card.syncedAt ? "Synced" : "Local only"
  ].filter(Boolean);

  for (const meta of metaItems) {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = meta;
    metaRow.appendChild(pill);
  }

  item.append(topLine, meaning, metaRow);
  return item;
}

async function requireAuth() {
  const auth = await storage.getAuth();

  if (!auth?.token) {
    setStatus("Login before using cloud sync/export.", "error");
    return null;
  }

  return auth;
}

function authHeaders(auth) {
  return {
    Authorization: `Bearer ${auth.token}`
  };
}

async function fetchJson(url, options = {}) {
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error("local backend is not reachable");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `request failed with ${response.status}`);
  }

  return data;
}

function setBusy(button, isBusy, busyText) {
  button.disabled = isBusy;
  button.textContent = busyText;
}

function setStatus(message, type = "info") {
  elements.status.textContent = message;
  elements.status.classList.toggle("is-error", type === "error");
  elements.status.classList.toggle("is-success", type === "success");
}
