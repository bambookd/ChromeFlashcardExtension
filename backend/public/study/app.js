const API_BASE_URL = "";
const AUTH_KEY = "flashcardStudyAuth";
const ADD_CATEGORY_VALUE = "__add_category__";

const state = {
  token: "",
  user: null,
  flashcards: [],
  categories: ["Uncategorized"],
  filteredCards: [],
  session: createEmptySession()
};

const elements = {
  authView: document.getElementById("authView"),
  studyView: document.getElementById("studyView"),
  authForm: document.getElementById("authForm"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  registerButton: document.getElementById("registerButton"),
  authStatus: document.getElementById("authStatus"),
  userBadge: document.getElementById("userBadge"),
  logoutButton: document.getElementById("logoutButton"),
  categorySelect: document.getElementById("categorySelect"),
  deleteCategoryButton: document.getElementById("deleteCategoryButton"),
  randomToggle: document.getElementById("randomToggle"),
  reloadButton: document.getElementById("reloadButton"),
  newCardButton: document.getElementById("newCardButton"),
  studyStatus: document.getElementById("studyStatus"),
  sessionMode: document.getElementById("sessionMode"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  flashcard: document.getElementById("flashcard"),
  cardMeta: document.getElementById("cardMeta"),
  cardWord: document.getElementById("cardWord"),
  cardMeaning: document.getElementById("cardMeaning"),
  flipHint: document.getElementById("flipHint"),
  startSessionButton: document.getElementById("startSessionButton"),
  restartSessionButton: document.getElementById("restartSessionButton"),
  flipButton: document.getElementById("flipButton"),
  skipButton: document.getElementById("skipButton"),
  gradeActions: document.getElementById("gradeActions"),
  sessionSummary: document.getElementById("sessionSummary"),
  summaryReviewed: document.getElementById("summaryReviewed"),
  summaryAgain: document.getElementById("summaryAgain"),
  summaryHard: document.getElementById("summaryHard"),
  summaryGood: document.getElementById("summaryGood"),
  summaryEasy: document.getElementById("summaryEasy"),
  libraryCount: document.getElementById("libraryCount"),
  cardList: document.getElementById("cardList"),
  cardForm: document.getElementById("cardForm"),
  editorTitle: document.getElementById("editorTitle"),
  cardId: document.getElementById("cardIdInput"),
  cardWordInput: document.getElementById("cardWordInput"),
  cardMeaningInput: document.getElementById("cardMeaningInput"),
  cardWordformInput: document.getElementById("cardWordformInput"),
  cardCategoryInput: document.getElementById("cardCategoryInput"),
  deleteEditorCategoryButton: document.getElementById("deleteEditorCategoryButton"),
  resetFormButton: document.getElementById("resetFormButton")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindEvents();
  restoreSession();
}

function bindEvents() {
  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
  elements.registerButton.addEventListener("click", register);
  elements.logoutButton.addEventListener("click", logout);
  elements.reloadButton.addEventListener("click", loadFlashcards);
  elements.categorySelect.addEventListener("change", handleFilterCategoryChange);
  elements.deleteCategoryButton.addEventListener("click", handleDeleteCategory);
  elements.deleteEditorCategoryButton.addEventListener("click", handleDeleteEditorCategory);
  elements.randomToggle.addEventListener("change", () => {
    resetStudySession("Start a new session to apply shuffle changes.");
  });
  elements.flashcard.addEventListener("click", flipCard);
  elements.flashcard.addEventListener("keydown", handleStudyKeydown);
  document.addEventListener("keydown", handleGlobalStudyKeydown);
  elements.startSessionButton.addEventListener("click", startStudySession);
  elements.restartSessionButton.addEventListener("click", startStudySession);
  elements.flipButton.addEventListener("click", flipCard);
  elements.skipButton.addEventListener("click", skipCard);
  elements.gradeActions.addEventListener("click", handleGradeClick);
  elements.newCardButton.addEventListener("click", resetForm);
  elements.resetFormButton.addEventListener("click", resetForm);
  elements.cardForm.addEventListener("submit", saveCard);
  elements.cardCategoryInput.addEventListener("change", handleEditorCategoryChange);
  elements.cardList.addEventListener("click", handleLibraryClick);
}

async function restoreSession() {
  const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");

  if (!saved?.token || !saved?.user) {
    showAuth();
    elements.username.value = "student";
    elements.password.value = "password123";
    return;
  }

  state.token = saved.token;
  state.user = saved.user;
  showStudy();

  try {
    await apiFetch("/api/me");
    await loadFlashcards();
  } catch (error) {
    logout();
    setStatus(elements.authStatus, "Session expired. Please login again.", "error");
  }
}

async function login() {
  await authenticate("/api/auth/login");
}

async function register() {
  await authenticate("/api/auth/register");
}

async function authenticate(path) {
  setStatus(elements.authStatus, "");

  try {
    const response = await rawFetch(path, {
      method: "POST",
      body: JSON.stringify({
        username: elements.username.value.trim(),
        password: elements.password.value
      })
    });

    state.token = response.token;
    state.user = response.user;
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      token: state.token,
      user: state.user
    }));
    showStudy();
    await loadFlashcards();
  } catch (error) {
    setStatus(elements.authStatus, error.message, "error");
  }
}

function logout() {
  state.token = "";
  state.user = null;
  state.flashcards = [];
  state.categories = ["Uncategorized"];
  state.filteredCards = [];
  state.session = createEmptySession();
  localStorage.removeItem(AUTH_KEY);
  showAuth();
}

function showAuth() {
  elements.authView.classList.remove("is-hidden");
  elements.studyView.classList.add("is-hidden");
}

function showStudy() {
  elements.authView.classList.add("is-hidden");
  elements.studyView.classList.remove("is-hidden");
  elements.userBadge.textContent = state.user?.username || "";
}

async function loadFlashcards() {
  setStatus(elements.studyStatus, "Loading flashcards...");

  try {
    const response = await apiFetch("/api/flashcards");
    const categoriesResponse = await apiFetch("/api/categories");
    state.flashcards = response.flashcards || [];
    state.categories = normalizeCategoryList([
      ...(categoriesResponse.categories || []),
      ...state.flashcards.map((card) => card.category).filter(Boolean)
    ]);
    rebuildCategories();
    applyFilters();
    setStatus(elements.studyStatus, `Loaded ${state.flashcards.length} flashcard${state.flashcards.length === 1 ? "" : "s"}.`, "success");
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
  }
}

function rebuildCategories() {
  const selected = elements.categorySelect.value;
  const editorSelected = elements.cardCategoryInput.value;
  const categories = normalizeCategoryList([
    ...state.categories,
    ...state.flashcards.map((card) => card.category).filter(Boolean)
  ]);

  state.categories = categories;

  elements.categorySelect.textContent = "";
  elements.categorySelect.append(new Option("All categories", ""));

  for (const category of categories) {
    elements.categorySelect.append(new Option(category, category));
  }

  elements.categorySelect.append(new Option("+ Add category", ADD_CATEGORY_VALUE));
  elements.categorySelect.value = categories.includes(selected) ? selected : "";
  elements.categorySelect.dataset.previousValue = elements.categorySelect.value;
  elements.deleteCategoryButton.disabled = !elements.categorySelect.value || elements.categorySelect.value === "Uncategorized";

  elements.cardCategoryInput.textContent = "";

  for (const category of categories) {
    elements.cardCategoryInput.append(new Option(category, category));
  }

  elements.cardCategoryInput.append(new Option("+ Add category", ADD_CATEGORY_VALUE));
  elements.cardCategoryInput.value = categories.includes(editorSelected) ? editorSelected : "Uncategorized";
  elements.cardCategoryInput.dataset.previousValue = elements.cardCategoryInput.value;
  elements.deleteEditorCategoryButton.disabled = elements.cardCategoryInput.value === "Uncategorized";
}

async function handleFilterCategoryChange() {
  if (elements.categorySelect.value === ADD_CATEGORY_VALUE) {
    await addCategoryFromPrompt(elements.categorySelect, () => {
      elements.categorySelect.value = "";
    });
    return;
  }

  elements.categorySelect.dataset.previousValue = elements.categorySelect.value;
  elements.deleteCategoryButton.disabled = !elements.categorySelect.value || elements.categorySelect.value === "Uncategorized";
  applyFilters();
}

async function handleEditorCategoryChange() {
  if (elements.cardCategoryInput.value === ADD_CATEGORY_VALUE) {
    await addCategoryFromPrompt(elements.cardCategoryInput, () => {
      elements.cardCategoryInput.value = "Uncategorized";
    });
    return;
  }

  elements.cardCategoryInput.dataset.previousValue = elements.cardCategoryInput.value;
  elements.deleteEditorCategoryButton.disabled = elements.cardCategoryInput.value === "Uncategorized";
}

async function addCategoryFromPrompt(select, fallback) {
  const previousValue = select.dataset.previousValue;
  const category = window.prompt("New category name:");

  if (!category?.trim()) {
    if (previousValue) {
      select.value = previousValue;
    } else {
      fallback();
    }
    return;
  }

  const normalized = normalizeCategoryName(category);

  if (!normalized) {
    if (previousValue) {
      select.value = previousValue;
    } else {
      fallback();
    }
    return;
  }

  try {
    const response = await apiFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ category: normalized })
    });
    state.categories = normalizeCategoryList(response.categories || [...state.categories, normalized]);
    rebuildCategories();
    select.value = normalized;
    select.dataset.previousValue = normalized;
    elements.deleteCategoryButton.disabled = !elements.categorySelect.value || elements.categorySelect.value === "Uncategorized";
    elements.deleteEditorCategoryButton.disabled = elements.cardCategoryInput.value === "Uncategorized";
    applyFilters();
    setStatus(elements.studyStatus, `Added category "${normalized}".`, "success");
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
    if (previousValue) {
      select.value = previousValue;
    } else {
      fallback();
    }
  }
}

async function handleDeleteCategory() {
  const category = elements.categorySelect.value;

  await deleteCategory(category, {
    missingMessage: "Select a category to delete."
  });
}

async function handleDeleteEditorCategory() {
  const category = elements.cardCategoryInput.value;

  await deleteCategory(category, {
    missingMessage: "Select an editor category to delete."
  });
}

async function deleteCategory(category, options = {}) {
  if (!category || category === "Uncategorized" || category === ADD_CATEGORY_VALUE) {
    setStatus(elements.studyStatus, options.missingMessage || "Select a category to delete.", "error");
    return;
  }

  const confirmed = window.confirm(`Delete category "${category}"? Cards using it will move to Uncategorized.`);

  if (!confirmed) {
    return;
  }

  try {
    await apiFetch(`/api/categories/${encodeURIComponent(category)}`, {
      method: "DELETE"
    });
    elements.categorySelect.value = "";
    elements.cardCategoryInput.value = "Uncategorized";
    await loadFlashcards();
    setStatus(elements.studyStatus, `Deleted category "${category}".`, "success");
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
  }
}

function applyFilters() {
  const category = elements.categorySelect.value;
  state.filteredCards = category
    ? state.flashcards.filter((card) => card.category === category)
    : [...state.flashcards];
  resetStudySession("Start a session to review this set.");
  renderLibrary();
}

function startStudySession() {
  if (state.filteredCards.length === 0) {
    resetStudySession("No flashcards in this category.");
    setStatus(elements.studyStatus, "No flashcards to study. Add or sync cards first.", "error");
    return;
  }

  const cards = elements.randomToggle.checked
    ? shuffleCards(state.filteredCards)
    : [...state.filteredCards];
  const category = elements.categorySelect.value || "All categories";

  state.session = {
    isActive: true,
    isComplete: false,
    isFlipped: false,
    currentCard: cards[0],
    queue: cards.slice(1),
    totalCards: cards.length,
    completedCount: 0,
    attempts: 0,
    modeLabel: `${category} / ${elements.randomToggle.checked ? "shuffled" : "ordered"}`,
    stats: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    }
  };

  setStatus(elements.studyStatus, "Session started. Recall the meaning first, then flip.", "success");
  renderStudyCard();
}

function resetStudySession(message = "Choose a category, then start a session.") {
  state.session = createEmptySession();
  elements.sessionMode.textContent = message;
  elements.cardMeta.textContent = "";
  elements.cardWord.textContent = state.filteredCards.length > 0 ? "Start a session" : "No cards";
  elements.cardMeaning.textContent = "";
  elements.cardMeaning.classList.add("is-hidden");
  elements.flipHint.textContent = state.filteredCards.length > 0
    ? "Click Start Session to begin reviewing."
    : "Add or sync flashcards before studying.";
  elements.gradeActions.classList.add("is-hidden");
  elements.sessionSummary.classList.add("is-hidden");
  elements.startSessionButton.disabled = state.filteredCards.length === 0;
  elements.startSessionButton.textContent = "Start session";
  elements.flipButton.disabled = true;
  elements.skipButton.disabled = true;
  renderProgress();
}

function renderStudyCard() {
  const { currentCard } = state.session;
  elements.sessionSummary.classList.add("is-hidden");
  renderProgress();

  if (!currentCard) {
    renderSessionComplete();
    return;
  }

  elements.sessionMode.textContent = state.session.modeLabel;
  elements.cardMeta.textContent = [
    currentCard.category || "Uncategorized",
    currentCard.wordform || "",
    `${state.session.queue.length} remaining`
  ].filter(Boolean).join(" / ");
  elements.cardWord.textContent = currentCard.word;
  elements.cardMeaning.textContent = currentCard.meaning;
  elements.cardMeaning.classList.toggle("is-hidden", !state.session.isFlipped);
  elements.flipHint.textContent = state.session.isFlipped
    ? "Rate your recall to continue."
    : "Recall the meaning, then click or press Space to flip.";
  elements.gradeActions.classList.toggle("is-hidden", !state.session.isFlipped);
  elements.startSessionButton.disabled = false;
  elements.startSessionButton.textContent = "Restart";
  elements.flipButton.disabled = false;
  elements.skipButton.disabled = false;
}

function renderSessionComplete() {
  state.session.isActive = false;
  state.session.isComplete = true;
  elements.sessionMode.textContent = "Session complete";
  elements.cardMeta.textContent = "";
  elements.cardWord.textContent = "Done";
  elements.cardMeaning.textContent = "You finished this study queue.";
  elements.cardMeaning.classList.remove("is-hidden");
  elements.flipHint.textContent = "Start another session when ready.";
  elements.gradeActions.classList.add("is-hidden");
  elements.sessionSummary.classList.remove("is-hidden");
  elements.startSessionButton.disabled = false;
  elements.startSessionButton.textContent = "Start session";
  elements.flipButton.disabled = true;
  elements.skipButton.disabled = true;
  elements.summaryReviewed.textContent = String(state.session.completedCount);
  elements.summaryAgain.textContent = String(state.session.stats.again);
  elements.summaryHard.textContent = String(state.session.stats.hard);
  elements.summaryGood.textContent = String(state.session.stats.good);
  elements.summaryEasy.textContent = String(state.session.stats.easy);
  setStatus(elements.studyStatus, "Session complete.", "success");
  renderProgress();
}

function renderProgress() {
  const total = state.session.totalCards || state.filteredCards.length || 0;
  const completed = state.session.completedCount || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  elements.progressText.textContent = `${completed} / ${total}`;
  elements.progressBar.style.width = `${percent}%`;
}

function renderLibrary() {
  elements.cardList.textContent = "";
  elements.libraryCount.textContent = `${state.filteredCards.length} card${state.filteredCards.length === 1 ? "" : "s"}`;

  const fragment = document.createDocumentFragment();

  for (const card of state.filteredCards) {
    const item = document.createElement("article");
    item.className = "library-card";
    item.innerHTML = `
      <h3>${escapeHtml(card.word)}</h3>
      <p>${escapeHtml(card.meaning)}</p>
      <div class="library-meta">
        <span class="pill">${escapeHtml(card.category || "Uncategorized")}</span>
        ${card.wordform ? `<span class="pill">${escapeHtml(card.wordform)}</span>` : ""}
      </div>
      <div class="library-actions">
        <button class="secondary-button" type="button" data-action="edit" data-id="${escapeHtml(card.id)}">Edit</button>
        <button class="danger-button" type="button" data-action="delete" data-id="${escapeHtml(card.id)}">Delete</button>
      </div>
    `;
    fragment.appendChild(item);
  }

  elements.cardList.appendChild(fragment);
}

function flipCard() {
  if (!state.session.isActive || !state.session.currentCard || state.session.isComplete) {
    return;
  }

  state.session.isFlipped = true;
  renderStudyCard();
}

function skipCard() {
  if (!state.session.isActive || !state.session.currentCard) {
    return;
  }

  state.session.queue.push(state.session.currentCard);
  moveToNextCard();
}

function handleGradeClick(event) {
  const button = event.target.closest("[data-grade]");

  if (!button || !state.session.isFlipped) {
    return;
  }

  gradeCurrentCard(button.dataset.grade);
}

function gradeCurrentCard(grade) {
  if (!state.session.currentCard || !Object.prototype.hasOwnProperty.call(state.session.stats, grade)) {
    return;
  }

  state.session.stats[grade] += 1;
  state.session.attempts += 1;

  if (grade === "again") {
    state.session.queue.push(state.session.currentCard);
  } else {
    state.session.completedCount += 1;
  }

  moveToNextCard();
}

function moveToNextCard() {
  state.session.currentCard = state.session.queue.shift() || null;
  state.session.isFlipped = false;
  renderStudyCard();
}

function handleStudyKeydown(event) {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    flipCard();
  }
}

function handleGlobalStudyKeydown(event) {
  if (elements.studyView.classList.contains("is-hidden") || isTypingInForm(event.target)) {
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    flipCard();
    return;
  }

  if (!state.session.isFlipped) {
    return;
  }

  const shortcuts = {
    "1": "again",
    "2": "hard",
    "3": "good",
    "4": "easy"
  };

  if (shortcuts[event.key]) {
    gradeCurrentCard(shortcuts[event.key]);
  }
}

async function saveCard(event) {
  event.preventDefault();

  const cardId = elements.cardId.value;
  const payload = {
    word: elements.cardWordInput.value.trim(),
    meaning: elements.cardMeaningInput.value.trim(),
    wordform: elements.cardWordformInput.value.trim(),
    category: getSelectedEditorCategory()
  };

  try {
    if (cardId) {
      await apiFetch(`/api/flashcards/${encodeURIComponent(cardId)}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setStatus(elements.studyStatus, "Flashcard updated.", "success");
    } else {
      await apiFetch("/api/flashcards", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setStatus(elements.studyStatus, "Flashcard created.", "success");
    }

    resetForm();
    await loadFlashcards();
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
  }
}

async function handleLibraryClick(event) {
  const button = event.target.closest("[data-action][data-id]");

  if (!button) {
    return;
  }

  const card = state.flashcards.find((candidate) => candidate.id === button.dataset.id);

  if (!card) {
    return;
  }

  if (button.dataset.action === "edit") {
    editCard(card);
    return;
  }

  if (button.dataset.action === "delete") {
    await deleteCard(card);
  }
}

function editCard(card) {
  elements.editorTitle.textContent = "Edit flashcard";
  elements.cardId.value = card.id;
  elements.cardWordInput.value = card.word;
  elements.cardMeaningInput.value = card.meaning;
  elements.cardWordformInput.value = card.wordform || "";
  elements.cardCategoryInput.value = card.category || "";
  elements.cardWordInput.focus();
}

async function deleteCard(card) {
  const confirmed = window.confirm(`Delete "${card.word}"?`);

  if (!confirmed) {
    return;
  }

  try {
    await apiFetch(`/api/flashcards/${encodeURIComponent(card.id)}`, {
      method: "DELETE"
    });
    setStatus(elements.studyStatus, "Flashcard deleted.", "success");
    await loadFlashcards();
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
  }
}

function resetForm() {
  elements.editorTitle.textContent = "Add flashcard";
  elements.cardForm.reset();
  elements.cardId.value = "";
  elements.cardCategoryInput.value = "Uncategorized";
  elements.deleteEditorCategoryButton.disabled = true;
  elements.cardWordInput.focus();
}

function createEmptySession() {
  return {
    isActive: false,
    isComplete: false,
    isFlipped: false,
    currentCard: null,
    queue: [],
    totalCards: 0,
    completedCount: 0,
    attempts: 0,
    modeLabel: "",
    stats: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0
    }
  };
}

function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function isTypingInForm(target) {
  return ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target?.tagName);
}

function getSelectedEditorCategory() {
  return elements.cardCategoryInput.value && elements.cardCategoryInput.value !== ADD_CATEGORY_VALUE
    ? elements.cardCategoryInput.value
    : "Uncategorized";
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

async function apiFetch(path, options = {}) {
  return rawFetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${state.token}`,
      ...options.headers
    }
  });
}

async function rawFetch(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers
      }
    });
  } catch (error) {
    throw new Error("Local backend is not reachable");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`);
  }

  return data;
}

function setStatus(element, message, type = "info") {
  element.textContent = message;
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
