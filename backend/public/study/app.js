const API_BASE_URL = "";
const AUTH_KEY = "flashcardStudyAuth";

const state = {
  token: "",
  user: null,
  flashcards: [],
  filteredCards: [],
  currentIndex: 0,
  history: [],
  isFlipped: false
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
  randomToggle: document.getElementById("randomToggle"),
  reloadButton: document.getElementById("reloadButton"),
  newCardButton: document.getElementById("newCardButton"),
  studyStatus: document.getElementById("studyStatus"),
  flashcard: document.getElementById("flashcard"),
  cardMeta: document.getElementById("cardMeta"),
  cardWord: document.getElementById("cardWord"),
  cardMeaning: document.getElementById("cardMeaning"),
  flipButton: document.getElementById("flipButton"),
  previousButton: document.getElementById("previousButton"),
  nextButton: document.getElementById("nextButton"),
  libraryCount: document.getElementById("libraryCount"),
  cardList: document.getElementById("cardList"),
  cardForm: document.getElementById("cardForm"),
  editorTitle: document.getElementById("editorTitle"),
  cardId: document.getElementById("cardIdInput"),
  cardWordInput: document.getElementById("cardWordInput"),
  cardMeaningInput: document.getElementById("cardMeaningInput"),
  cardWordformInput: document.getElementById("cardWordformInput"),
  cardCategoryInput: document.getElementById("cardCategoryInput"),
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
  elements.categorySelect.addEventListener("change", applyFilters);
  elements.randomToggle.addEventListener("change", () => {
    state.history = [];
    state.currentIndex = 0;
    renderStudyCard();
  });
  elements.flashcard.addEventListener("click", flipCard);
  elements.flashcard.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      flipCard();
    }
  });
  elements.flipButton.addEventListener("click", flipCard);
  elements.previousButton.addEventListener("click", previousCard);
  elements.nextButton.addEventListener("click", nextCard);
  elements.newCardButton.addEventListener("click", resetForm);
  elements.resetFormButton.addEventListener("click", resetForm);
  elements.cardForm.addEventListener("submit", saveCard);
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
  state.filteredCards = [];
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
    state.flashcards = response.flashcards || [];
    rebuildCategories();
    applyFilters();
    setStatus(elements.studyStatus, `Loaded ${state.flashcards.length} flashcard${state.flashcards.length === 1 ? "" : "s"}.`, "success");
  } catch (error) {
    setStatus(elements.studyStatus, error.message, "error");
  }
}

function rebuildCategories() {
  const selected = elements.categorySelect.value;
  const categories = [...new Set(state.flashcards.map((card) => card.category).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  elements.categorySelect.textContent = "";
  elements.categorySelect.append(new Option("All categories", ""));

  for (const category of categories) {
    elements.categorySelect.append(new Option(category, category));
  }

  elements.categorySelect.value = categories.includes(selected) ? selected : "";
}

function applyFilters() {
  const category = elements.categorySelect.value;
  state.filteredCards = category
    ? state.flashcards.filter((card) => card.category === category)
    : [...state.flashcards];
  state.currentIndex = 0;
  state.history = [];
  state.isFlipped = false;
  renderStudyCard();
  renderLibrary();
}

function renderStudyCard() {
  const card = getCurrentCard();
  state.isFlipped = false;
  elements.cardMeaning.classList.add("is-hidden");

  if (!card) {
    elements.cardMeta.textContent = "";
    elements.cardWord.textContent = "No cards";
    elements.cardMeaning.textContent = "";
    elements.previousButton.disabled = true;
    elements.nextButton.disabled = true;
    elements.flipButton.disabled = true;
    return;
  }

  elements.cardMeta.textContent = [
    card.category || "Uncategorized",
    card.wordform || ""
  ].filter(Boolean).join(" / ");
  elements.cardWord.textContent = card.word;
  elements.cardMeaning.textContent = card.meaning;
  elements.previousButton.disabled = state.history.length === 0 && state.currentIndex === 0;
  elements.nextButton.disabled = state.filteredCards.length <= 1;
  elements.flipButton.disabled = false;
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

function getCurrentCard() {
  if (state.filteredCards.length === 0) {
    return null;
  }

  return state.filteredCards[state.currentIndex] || state.filteredCards[0];
}

function flipCard() {
  const card = getCurrentCard();

  if (!card) {
    return;
  }

  state.isFlipped = !state.isFlipped;
  elements.cardMeaning.classList.toggle("is-hidden", !state.isFlipped);
}

function nextCard() {
  if (state.filteredCards.length <= 1) {
    return;
  }

  state.history.push(state.currentIndex);

  if (elements.randomToggle.checked) {
    let nextIndex = state.currentIndex;

    while (nextIndex === state.currentIndex) {
      nextIndex = Math.floor(Math.random() * state.filteredCards.length);
    }

    state.currentIndex = nextIndex;
  } else {
    state.currentIndex = (state.currentIndex + 1) % state.filteredCards.length;
  }

  renderStudyCard();
}

function previousCard() {
  if (state.history.length > 0) {
    state.currentIndex = state.history.pop();
  } else {
    state.currentIndex = Math.max(0, state.currentIndex - 1);
  }

  renderStudyCard();
}

async function saveCard(event) {
  event.preventDefault();

  const cardId = elements.cardId.value;
  const payload = {
    word: elements.cardWordInput.value.trim(),
    meaning: elements.cardMeaningInput.value.trim(),
    wordform: elements.cardWordformInput.value.trim(),
    category: elements.cardCategoryInput.value.trim() || "Uncategorized"
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
  elements.cardWordInput.focus();
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
