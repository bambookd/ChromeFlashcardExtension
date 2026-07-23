const API_BASE_URL = window.FLASHCARD_CONFIG?.API_BASE_URL || "";
const GAME_URL = window.FLASHCARD_CONFIG?.GAME_URL || "/game/";
const AUTH_KEY = "flashcardStudyAuth";
const THEME_KEY = "flashcardStudyTheme";
const ADD_CATEGORY_VALUE = "__add_category__";
const CSV = window.FlashcardCsv;

// Cards are pushed through POST /api/sync in small batches. The DynamoDB tables
// run at 1 WCU, so one request per card would exhaust burst capacity and one
// request for the whole file would turn any mid-way failure into a total loss.
const IMPORT_BATCH_SIZE = 25;
const IMPORT_BATCH_RETRIES = 2;
const IMPORT_RETRY_DELAY_MS = 1500;
const IMPORT_PREVIEW_LIMIT = 50;

const state = {
  token: "",
  user: null,
  flashcards: [],
  categories: ["Uncategorized"],
  filteredCards: [],
  session: createEmptySession(),
  pendingImport: null,
  isImporting: false
};

const elements = {
  authView: document.getElementById("authView"),
  studyView: document.getElementById("studyView"),
  authForm: document.getElementById("authForm"),
  authThemeToggle: document.getElementById("authThemeToggle"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  passwordToggle: document.getElementById("passwordToggle"),
  loginButton: document.getElementById("loginButton"),
  registerButton: document.getElementById("registerButton"),
  authStatus: document.getElementById("authStatus"),
  userBadge: document.getElementById("userBadge"),
  studyTabButton: document.getElementById("studyTabButton"),
  libraryTabButton: document.getElementById("libraryTabButton"),
  openGameButton: document.getElementById("openGameButton"),
  studyThemeToggle: document.getElementById("studyThemeToggle"),
  logoutButton: document.getElementById("logoutButton"),
  categorySelect: document.getElementById("categorySelect"),
  deleteCategoryButton: document.getElementById("deleteCategoryButton"),
  randomToggle: document.getElementById("randomToggle"),
  reloadButton: document.getElementById("reloadButton"),
  newCardButton: document.getElementById("newCardButton"),
  studyStatus: document.getElementById("studyStatus"),
  totalCardsMetric: document.getElementById("totalCardsMetric"),
  categoryCountMetric: document.getElementById("categoryCountMetric"),
  sessionMetric: document.getElementById("sessionMetric"),
  studyPanel: document.getElementById("studyPanel"),
  libraryPanel: document.getElementById("libraryPanel"),
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
  libraryNewCardButton: document.getElementById("libraryNewCardButton"),
  csvTemplateButton: document.getElementById("csvTemplateButton"),
  importCsvButton: document.getElementById("importCsvButton"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  importFileInput: document.getElementById("importFileInput"),
  importDialog: document.getElementById("importDialog"),
  importFileName: document.getElementById("importFileName"),
  importAddCount: document.getElementById("importAddCount"),
  importSkipCount: document.getElementById("importSkipCount"),
  importErrorCount: document.getElementById("importErrorCount"),
  importPreview: document.getElementById("importPreview"),
  importStatus: document.getElementById("importStatus"),
  importCancelButton: document.getElementById("importCancelButton"),
  importConfirmButton: document.getElementById("importConfirmButton"),
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
  applySavedTheme();
  bindEvents();
  restoreSession();
}

function bindEvents() {
  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
  elements.authThemeToggle.addEventListener("click", toggleTheme);
  elements.passwordToggle.addEventListener("click", togglePasswordVisibility);
  elements.studyThemeToggle.addEventListener("click", toggleTheme);
  elements.studyTabButton.addEventListener("click", () => switchView("study"));
  elements.libraryTabButton.addEventListener("click", () => switchView("library"));
  elements.openGameButton.addEventListener("click", openGame);
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
  elements.libraryNewCardButton.addEventListener("click", resetForm);
  elements.resetFormButton.addEventListener("click", resetForm);
  elements.cardForm.addEventListener("submit", saveCard);
  elements.cardCategoryInput.addEventListener("change", handleEditorCategoryChange);
  elements.cardList.addEventListener("click", handleLibraryClick);
  elements.csvTemplateButton.addEventListener("click", downloadCsvTemplate);
  elements.importCsvButton.addEventListener("click", () => elements.importFileInput.click());
  elements.importFileInput.addEventListener("change", handleImportFileChange);
  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.importCancelButton.addEventListener("click", closeImportDialog);
  elements.importConfirmButton.addEventListener("click", confirmImport);
  elements.importDialog.addEventListener("cancel", (event) => {
    if (state.isImporting) {
      event.preventDefault();
    }
  });
}

function openGame() {
  window.location.href = GAME_URL;
}

function switchView(view) {
  const isLibrary = view === "library";
  elements.studyPanel.classList.toggle("is-hidden", isLibrary);
  elements.libraryPanel.classList.toggle("is-hidden", !isLibrary);
  elements.studyTabButton.classList.toggle("is-active", !isLibrary);
  elements.libraryTabButton.classList.toggle("is-active", isLibrary);
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  setTheme(theme);
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

function togglePasswordVisibility() {
  const showPassword = elements.password.type === "password";
  elements.password.type = showPassword ? "text" : "password";
  elements.passwordToggle.textContent = showPassword ? "Hide" : "Show";
  elements.passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
}

function setTheme(theme) {
  const normalized = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalized;
  localStorage.setItem(THEME_KEY, normalized);

  const label = normalized === "dark" ? "Light" : "Dark";
  elements.authThemeToggle.textContent = label;
  elements.studyThemeToggle.textContent = label;
}

async function restoreSession() {
  const saved = JSON.parse(localStorage.getItem(AUTH_KEY) || "null");

  if (!saved?.token || !saved?.user) {
    showAuth();
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
  const isRegister = path.endsWith("/register");
  setAuthBusy(true, isRegister);

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
  } finally {
    setAuthBusy(false);
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
    updateOverview();
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
  setPrimaryAction("start");
  renderProgress();
}

/* The main action moves as the session progresses: start -> flip -> grade buttons. */
function setPrimaryAction(target) {
  elements.startSessionButton.classList.toggle("primary-button", target === "start");
  elements.startSessionButton.classList.toggle("secondary-button", target !== "start");
  elements.flipButton.classList.toggle("primary-button", target === "flip");
  elements.flipButton.classList.toggle("secondary-button", target !== "flip");
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
  elements.flipButton.disabled = state.session.isFlipped;
  elements.skipButton.disabled = false;
  setPrimaryAction(state.session.isFlipped ? "none" : "flip");
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
  setPrimaryAction("start");
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
  updateOverview();
}

function updateOverview() {
  const categoryCount = state.categories.filter((category) => category !== "Uncategorized").length;
  const completed = state.session.completedCount || 0;
  const total = state.session.totalCards || 0;

  elements.totalCardsMetric.textContent = String(state.flashcards.length);
  elements.categoryCountMetric.textContent = String(categoryCount);

  if (state.session.isComplete) {
    elements.sessionMetric.textContent = `Completed ${completed} cards`;
  } else if (state.session.isActive) {
    elements.sessionMetric.textContent = `${completed} of ${total} reviewed`;
  } else {
    elements.sessionMetric.textContent = "Not started";
  }
}

function renderLibrary() {
  elements.cardList.textContent = "";
  elements.libraryCount.textContent = `${state.flashcards.length} card${state.flashcards.length === 1 ? "" : "s"}`;

  const fragment = document.createDocumentFragment();
  const groups = groupCardsByCategory(state.flashcards);

  if (groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "library-empty";
    empty.textContent = "No flashcards yet. Add a card from the study form, import a CSV, or sync from the extension.";
    elements.cardList.appendChild(empty);
    return;
  }

  for (const group of groups) {
    const section = document.createElement("details");
    section.className = "category-group";
    section.open = group.category === "Uncategorized" || groups.length <= 3;
    section.innerHTML = `
      <summary>
        <span>${escapeHtml(group.category)}</span>
        <strong>${group.cards.length}</strong>
      </summary>
      <div class="category-card-list"></div>
    `;

    const list = section.querySelector(".category-card-list");

    for (const card of group.cards) {
      const item = document.createElement("article");
      item.className = "library-card";
      item.innerHTML = `
        <div class="library-card-main">
          <h3>${escapeHtml(card.word)}</h3>
          <p>${escapeHtml(card.meaning)}</p>
          <div class="library-meta">
            ${card.wordform ? `<span class="pill">${escapeHtml(card.wordform)}</span>` : ""}
            <span class="pill">${card.syncedAt ? "Synced" : "Cloud"}</span>
          </div>
        </div>
        <div class="library-actions">
          <button class="secondary-button" type="button" data-action="edit" data-id="${escapeHtml(card.id)}">Edit</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${escapeHtml(card.id)}">Delete</button>
        </div>
      `;
      list.appendChild(item);
    }

    fragment.appendChild(section);
  }

  elements.cardList.appendChild(fragment);
}

function groupCardsByCategory(cards) {
  const groups = new Map();

  for (const card of cards) {
    const category = card.category || "Uncategorized";

    if (!groups.has(category)) {
      groups.set(category, []);
    }

    groups.get(category).push(card);
  }

  return [...groups.entries()]
    .map(([category, cardsInGroup]) => ({
      category,
      cards: cardsInGroup.sort((a, b) => a.word.localeCompare(b.word))
    }))
    .sort((a, b) => {
      if (a.category.toLowerCase() === "uncategorized") {
        return -1;
      }

      if (b.category.toLowerCase() === "uncategorized") {
        return 1;
      }

      return a.category.localeCompare(b.category);
    });
}

function exportCsv() {
  const category = getSelectedFilterCategory();
  const cards = category ? state.filteredCards : state.flashcards;

  if (cards.length === 0) {
    setStatus(elements.studyStatus, "Nothing to export in this selection.", "error");
    return;
  }

  const fileName = CSV.buildFileName(state.user?.username, category);
  downloadTextFile(fileName, CSV.serialize(cards), "text/csv;charset=utf-8");
  setStatus(
    elements.studyStatus,
    `Exported ${cards.length} card${cards.length === 1 ? "" : "s"} to ${fileName}.`,
    "success"
  );
}

function downloadCsvTemplate() {
  downloadTextFile("flashcards-template.csv", CSV.template(), "text/csv;charset=utf-8");
  setStatus(elements.studyStatus, "Template downloaded. Keep the four column headers as they are.", "success");
}

async function handleImportFileChange(event) {
  const file = event.target.files?.[0];
  // Clearing the input lets the user pick the same file again after a cancel.
  event.target.value = "";

  if (!file) {
    return;
  }

  try {
    const parsed = CSV.parse(await readTextFile(file));
    const plan = CSV.planImport(parsed.rows, state.flashcards);

    state.pendingImport = {
      fileName: file.name,
      parsed,
      plan,
      // Card ids are minted once per file so a retry after a partial failure
      // updates the same rows instead of creating a second copy of each card.
      payloads: plan.additions.map(toSyncPayload),
      savedCount: 0
    };

    renderImportDialog();
    elements.importDialog.showModal();
  } catch (error) {
    setStatus(elements.studyStatus, `Could not read that file: ${error.message}`, "error");
  }
}

function renderImportDialog() {
  const { fileName, parsed, plan } = state.pendingImport;
  const details = [describeDelimiter(parsed.delimiter)];

  if (!parsed.hasHeader && parsed.rows.length > 0) {
    details.push("no header row");
  }

  elements.importFileName.textContent = `${fileName} · ${details.join(" · ")}`;
  elements.importAddCount.textContent = String(plan.additions.length);
  elements.importSkipCount.textContent = String(plan.duplicates.length);
  elements.importErrorCount.textContent = String(parsed.errors.length);

  renderImportPreview([
    ...plan.additions.map((row) => ({
      line: row.line,
      word: row.word,
      detail: row.meaning,
      tag: "Add",
      className: "is-add"
    })),
    ...plan.duplicates.map((row) => ({
      line: row.line,
      word: row.word,
      detail: row.reason === "library" ? "Already in your library" : "Repeated earlier in this file",
      tag: "Skip",
      className: "is-skip"
    })),
    ...parsed.errors.map((error) => ({
      line: error.line,
      word: error.word || "—",
      detail: error.message,
      tag: "Problem",
      className: "is-error"
    }))
  ].sort((a, b) => a.line - b.line));

  updateImportConfirmButton();
  setStatus(elements.importStatus, buildImportHint(parsed, plan));
}

function renderImportPreview(entries) {
  elements.importPreview.textContent = "";

  if (entries.length === 0) {
    elements.importPreview.appendChild(createImportNote("This file has no rows to show."));
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const entry of entries.slice(0, IMPORT_PREVIEW_LIMIT)) {
    const row = document.createElement("div");
    row.className = `import-row ${entry.className}`;
    row.append(
      createImportCell("import-row-line", `L${entry.line}`),
      createImportCell("import-row-word", entry.word),
      createImportCell("import-row-meaning", entry.detail),
      createImportCell("import-row-tag", entry.tag)
    );
    fragment.appendChild(row);
  }

  if (entries.length > IMPORT_PREVIEW_LIMIT) {
    fragment.appendChild(createImportNote(`… and ${entries.length - IMPORT_PREVIEW_LIMIT} more rows`));
  }

  elements.importPreview.appendChild(fragment);
}

function createImportCell(className, text) {
  const cell = document.createElement("span");
  cell.className = className;
  cell.textContent = text;
  return cell;
}

function createImportNote(text) {
  const note = document.createElement("p");
  note.className = "import-preview-more";
  note.textContent = text;
  return note;
}

function buildImportHint(parsed, plan) {
  if (parsed.rows.length === 0 && parsed.errors.length === 0) {
    return "No rows found. Expected columns: word, meaning, wordform, category.";
  }

  if (plan.additions.length === 0) {
    return "Nothing new here — every row is already in your library or needs fixing.";
  }

  return "Words already in your library are skipped, ignoring letter case.";
}

function updateImportConfirmButton() {
  const remaining = countRemainingImports();

  elements.importConfirmButton.disabled = remaining === 0 || state.isImporting;
  elements.importConfirmButton.textContent = remaining === 0
    ? "Nothing to add"
    : `Add ${remaining} card${remaining === 1 ? "" : "s"}`;
}

function countRemainingImports() {
  if (!state.pendingImport) {
    return 0;
  }

  return state.pendingImport.payloads.length - state.pendingImport.savedCount;
}

async function confirmImport() {
  if (!state.pendingImport || state.isImporting || countRemainingImports() === 0) {
    return;
  }

  const pending = state.pendingImport;
  const remaining = pending.payloads.slice(pending.savedCount);
  const total = pending.payloads.length;

  setImportBusy(true);
  setStatus(elements.importStatus, `Saving 0 of ${remaining.length} cards...`);

  try {
    for (const batch of chunk(remaining, IMPORT_BATCH_SIZE)) {
      await sendImportBatch(batch);
      pending.savedCount += batch.length;
      setStatus(elements.importStatus, `Saving ${pending.savedCount} of ${total} cards...`);
    }
  } catch (error) {
    setImportBusy(false);
    setStatus(
      elements.importStatus,
      `Stopped after ${pending.savedCount} of ${total} cards: ${error.message} Press the button again to carry on from where it stopped.`,
      "error"
    );
    await loadFlashcards();
    return;
  }

  const saved = pending.savedCount;

  setImportBusy(false);
  closeImportDialog();
  await loadFlashcards();
  switchView("library");
  setStatus(elements.studyStatus, `Imported ${saved} card${saved === 1 ? "" : "s"} from CSV.`, "success");
}

async function sendImportBatch(flashcards) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await apiFetch("/api/sync", {
        method: "POST",
        body: JSON.stringify({ flashcards })
      });
    } catch (error) {
      if (attempt >= IMPORT_BATCH_RETRIES || !isRetryableImportError(error)) {
        throw error;
      }

      // DynamoDB runs at 1 WCU, so a throttled batch usually succeeds once its
      // burst capacity has had a moment to refill.
      await delay(IMPORT_RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

function isRetryableImportError(error) {
  return !error.status || [429, 500, 502, 503, 504].includes(error.status);
}

function toSyncPayload(row) {
  const cardId = createCardId();

  return {
    id: cardId,
    cardId,
    word: row.word,
    meaning: row.meaning,
    wordform: row.wordform,
    category: row.category
  };
}

function createCardId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `csv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function setImportBusy(isBusy) {
  state.isImporting = isBusy;
  elements.importCancelButton.disabled = isBusy;
  elements.importCsvButton.disabled = isBusy;
  elements.exportCsvButton.disabled = isBusy;
  updateImportConfirmButton();
}

function closeImportDialog() {
  if (state.isImporting) {
    return;
  }

  elements.importDialog.close();
  state.pendingImport = null;
}

async function readTextFile(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Excel's "Unicode Text" export is UTF-16, which would decode to mojibake if
  // it were read as UTF-8.
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(buffer);
  }

  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(buffer);
  }

  return new TextDecoder("utf-8").decode(buffer);
}

function downloadTextFile(fileName, text, mimeType) {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function describeDelimiter(delimiter) {
  if (delimiter === ";") {
    return "semicolon separated";
  }

  if (delimiter === "\t") {
    return "tab separated";
  }

  return "comma separated";
}

function getSelectedFilterCategory() {
  const category = elements.categorySelect.value;
  return category && category !== ADD_CATEGORY_VALUE ? category : "";
}

function chunk(items, size) {
  const batches = [];

  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }

  return batches;
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
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
  switchView("study");
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
  switchView("study");
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
    throw new Error("Configured API is not reachable");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `Request failed with ${response.status}`);
    // Callers such as the CSV import need the status to tell a throttled write
    // apart from a rejected payload.
    error.status = response.status;
    throw error;
  }

  return data;
}

function setStatus(element, message, type = "info") {
  element.textContent = message;
  element.classList.toggle("is-error", type === "error");
  element.classList.toggle("is-success", type === "success");
}

function setAuthBusy(isBusy, isRegister = false) {
  elements.loginButton.disabled = isBusy;
  elements.registerButton.disabled = isBusy;
  elements.loginButton.textContent = isBusy && !isRegister ? "Signing in..." : "Login";
  elements.registerButton.textContent = isBusy && isRegister ? "Creating..." : "Create account";
  elements.authForm.setAttribute("aria-busy", String(isBusy));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
