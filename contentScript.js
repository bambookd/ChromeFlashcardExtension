const FLASHCARD_STORAGE_KEY = "flashcards";
const FLASHCARD_CATEGORY_STORAGE_KEY = "flashcardCategories";
const FLASHCARD_API_BASE_URL = "http://localhost:3000";
const EDITOR_HOST_ID = "flashcard-vocabulary-inline-editor";
const ADD_CATEGORY_VALUE = "__add_category__";

let lastSelectionRect = null;
let lastContextPoint = null;
let editorHost = null;

document.addEventListener("mouseup", rememberSelectionPosition, true);
document.addEventListener("keyup", rememberSelectionPosition, true);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editorHost) {
    closeEditor();
  }
}, true);
document.addEventListener("contextmenu", (event) => {
  lastContextPoint = {
    x: event.clientX,
    y: event.clientY
  };
  rememberSelectionPosition();
}, true);

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== "FLASHCARD_OPEN_EDITOR") {
    return;
  }

  const word = message.payload?.word || getSelectedText();

  if (word) {
    showFlashcardEditor(word);
  }
});

function rememberSelectionPosition() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 0 && rect.height > 0);
  const rect = rects[rects.length - 1] || range.getBoundingClientRect();

  if (rect && rect.width > 0 && rect.height > 0) {
    lastSelectionRect = {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      height: rect.height
    };
  }
}

function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim().replace(/\s+/g, " ").slice(0, 120) : "";
}

async function showFlashcardEditor(word) {
  closeEditor();

  editorHost = document.createElement("div");
  editorHost.id = EDITOR_HOST_ID;
  editorHost.style.position = "fixed";
  editorHost.style.zIndex = "2147483647";
  editorHost.style.inset = "0 auto auto 0";
  editorHost.style.pointerEvents = "none";

  const shadowRoot = editorHost.attachShadow({ mode: "closed" });
  shadowRoot.append(createEditorStyles(), createEditorMarkup(word));
  document.documentElement.appendChild(editorHost);

  positionEditor(editorHost);

  const form = shadowRoot.querySelector("form");
  const closeButtons = shadowRoot.querySelectorAll("[data-action='close']");
  const translateButton = shadowRoot.querySelector("[data-action='translate']");
  const status = shadowRoot.querySelector("[data-role='status']");
  const wordInput = shadowRoot.querySelector("[name='word']");
  const meaningInput = shadowRoot.querySelector("[name='meaning']");
  const wordformInput = shadowRoot.querySelector("[name='wordform']");
  const categoryInput = shadowRoot.querySelector("[name='category']");
  const deleteCategoryButton = shadowRoot.querySelector("[data-action='delete-category']");
  await renderCategoryOptions(categoryInput, deleteCategoryButton);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeEditor);
  });

  categoryInput.addEventListener("change", async () => {
    if (categoryInput.value !== ADD_CATEGORY_VALUE) {
      categoryInput.dataset.previousValue = categoryInput.value;
      deleteCategoryButton.disabled = categoryInput.value === "Uncategorized";
      return;
    }

    const previousValue = categoryInput.dataset.previousValue || "Uncategorized";
    const category = window.prompt("New category name:");

    if (!category?.trim()) {
      categoryInput.value = previousValue;
      return;
    }

    const normalized = normalizeCategoryName(category);

    if (!normalized) {
      categoryInput.value = previousValue;
      return;
    }

    await ensureLocalCategory(normalized);
    await renderCategoryOptions(categoryInput, deleteCategoryButton, normalized);
    setInlineStatus(status, `Added category "${normalized}".`, "success");
  });

  deleteCategoryButton.addEventListener("click", async () => {
    const category = getSelectedCategory(categoryInput);

    if (category === "Uncategorized") {
      setInlineStatus(status, "Uncategorized cannot be deleted.", "error");
      return;
    }

    const confirmed = window.confirm(`Delete category "${category}"? Cards using it will move to Uncategorized.`);

    if (!confirmed) {
      return;
    }

    await deleteLocalCategory(category);
    await renderCategoryOptions(categoryInput, deleteCategoryButton, "Uncategorized");
    setInlineStatus(status, `Deleted category "${category}".`, "success");
  });

  translateButton.addEventListener("click", async () => {
    const currentWord = wordInput.value.trim();

    if (!currentWord) {
      setInlineStatus(status, "Word is required before translation.", "error");
      return;
    }

    setButtonBusy(translateButton, true, "Loading");

    try {
      const result = await fetchJson(`${FLASHCARD_API_BASE_URL}/api/translate`, {
        method: "POST",
        body: JSON.stringify({ word: currentWord })
      });

      meaningInput.value = result.meaning || "";

      if (!wordformInput.value && result.wordform) {
        wordformInput.value = result.wordform;
      }

      setInlineStatus(status, "Translation loaded from local API.", "success");
    } catch (error) {
      setInlineStatus(status, `Translation failed: ${error.message}`, "error");
    } finally {
      setButtonBusy(translateButton, false, "Translate");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const card = {
      id: crypto.randomUUID(),
      word: wordInput.value.trim(),
      meaning: meaningInput.value.trim(),
      wordform: wordformInput.value.trim(),
      category: getSelectedCategory(categoryInput),
      createdAt: new Date().toISOString(),
      syncedAt: null,
      sourceUrl: location.href,
      sourceTitle: document.title
    };

    if (!card.word || !card.meaning) {
      setInlineStatus(status, "Word and meaning are required.", "error");
      return;
    }

    await saveFlashcard(card);
    setInlineStatus(status, "Saved locally. Open the extension popup to review it.", "success");
    window.setTimeout(closeEditor, 900);
  });

  window.setTimeout(() => meaningInput.focus(), 0);
}

function createEditorMarkup(word) {
  const wrapper = document.createElement("section");
  wrapper.className = "flashcard-editor";
  wrapper.setAttribute("role", "dialog");
  wrapper.setAttribute("aria-label", "Save selected word as flashcard");
  wrapper.innerHTML = `
    <div class="editor-header">
      <div>
        <h2>Save flashcard</h2>
        <p>Edit before saving locally</p>
      </div>
      <button class="ghost-button" type="button" data-action="close" aria-label="Close">x</button>
    </div>

    <form>
      <label>
        <span>Word</span>
        <input name="word" type="text" value="${escapeAttribute(word)}" required>
      </label>

      <label>
        <span>Meaning</span>
        <div class="meaning-row">
          <textarea name="meaning" rows="3" placeholder="Type meaning or translate" required></textarea>
          <button class="secondary-button" type="button" data-action="translate">Translate</button>
        </div>
      </label>

      <div class="field-grid">
        <label>
          <span>Wordform</span>
          <select name="wordform">
            <option value="">Select type</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
            <option value="phrase">Phrase</option>
            <option value="phrasal verb">Phrasal verb</option>
            <option value="idiom">Idiom</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>

        <label>
          <span>Category</span>
          <div class="category-row">
            <select name="category"></select>
            <button class="secondary-button" type="button" data-action="delete-category">Delete</button>
          </div>
        </label>
      </div>

      <p class="status" data-role="status"></p>

      <div class="actions">
        <button class="secondary-button" type="button" data-action="close">Cancel</button>
        <button class="primary-button" type="submit">Save</button>
      </div>
    </form>
  `;

  return wrapper;
}

function createEditorStyles() {
  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .flashcard-editor {
      width: 360px;
      max-width: calc(100vw - 24px);
      padding: 14px;
      color: #172033;
      background: #ffffff;
      border: 1px solid #d8e0eb;
      border-radius: 8px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
      font: 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      pointer-events: auto;
    }

    .editor-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    h2 {
      margin: 0;
      color: #172033;
      font-size: 17px;
      line-height: 1.2;
      letter-spacing: 0;
    }

    p {
      margin: 3px 0 0;
      color: #64748b;
      font-size: 12px;
    }

    form,
    label {
      display: flex;
      flex-direction: column;
    }

    form {
      gap: 10px;
    }

    label {
      gap: 5px;
      color: #64748b;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }

    input,
    select,
    textarea {
      width: 100%;
      margin: 0;
      padding: 9px 10px;
      color: #172033;
      background: #ffffff;
      border: 1px solid #d8e0eb;
      border-radius: 8px;
      outline: 0;
      font: 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    textarea {
      resize: vertical;
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    button {
      min-height: 34px;
      margin: 0;
      padding: 0 12px;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
      font: 700 13px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    .meaning-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      align-items: start;
    }

    .category-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }

    .field-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .primary-button {
      color: #ffffff;
      background: #2563eb;
    }

    .secondary-button,
    .ghost-button {
      color: #172033;
      background: #eef2f7;
    }

    .ghost-button {
      width: 30px;
      min-height: 30px;
      padding: 0;
    }

    .status {
      min-height: 18px;
      margin: 0;
      color: #64748b;
      font-size: 12px;
    }

    .status.is-error {
      color: #dc2626;
    }

    .status.is-success {
      color: #047857;
    }
  `;

  return style;
}

function positionEditor(host) {
  const editorWidth = 360;
  const editorHeight = 390;
  const gap = 10;
  const anchor = lastSelectionRect || {
    left: lastContextPoint?.x || 24,
    right: lastContextPoint?.x || 24,
    top: lastContextPoint?.y || 24,
    bottom: lastContextPoint?.y || 24
  };

  let left = anchor.left;
  let top = anchor.bottom + gap;

  if (left + editorWidth > window.innerWidth - 12) {
    left = Math.max(12, window.innerWidth - editorWidth - 12);
  }

  if (top + editorHeight > window.innerHeight - 12) {
    top = Math.max(12, anchor.top - editorHeight - gap);
  }

  host.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
}

async function saveFlashcard(card) {
  const result = await chrome.storage.local.get({ [FLASHCARD_STORAGE_KEY]: [] });
  const currentCards = Array.isArray(result[FLASHCARD_STORAGE_KEY]) ? result[FLASHCARD_STORAGE_KEY] : [];
  await ensureLocalCategory(card.category);
  await chrome.storage.local.set({ [FLASHCARD_STORAGE_KEY]: [card, ...currentCards] });
}

async function getLocalCategories() {
  const result = await chrome.storage.local.get({ [FLASHCARD_CATEGORY_STORAGE_KEY]: ["Uncategorized"] });
  return normalizeCategoryList(result[FLASHCARD_CATEGORY_STORAGE_KEY]);
}

async function setLocalCategories(categories) {
  await chrome.storage.local.set({ [FLASHCARD_CATEGORY_STORAGE_KEY]: normalizeCategoryList(categories) });
}

async function ensureLocalCategory(category) {
  const categories = await getLocalCategories();
  await setLocalCategories([...categories, category]);
}

async function deleteLocalCategory(category) {
  const categories = await getLocalCategories();
  await setLocalCategories(categories.filter((item) => item.toLowerCase() !== category.toLowerCase()));

  const result = await chrome.storage.local.get({ [FLASHCARD_STORAGE_KEY]: [] });
  const currentCards = Array.isArray(result[FLASHCARD_STORAGE_KEY]) ? result[FLASHCARD_STORAGE_KEY] : [];
  await chrome.storage.local.set({
    [FLASHCARD_STORAGE_KEY]: currentCards.map((card) => (
      card.category?.toLowerCase() === category.toLowerCase()
        ? { ...card, category: "Uncategorized", updatedAt: new Date().toISOString(), syncedAt: null }
        : card
    ))
  });
}

async function renderCategoryOptions(select, deleteButton, selectedValue = select.value || "Uncategorized") {
  const result = await chrome.storage.local.get({ [FLASHCARD_STORAGE_KEY]: [] });
  const currentCards = Array.isArray(result[FLASHCARD_STORAGE_KEY]) ? result[FLASHCARD_STORAGE_KEY] : [];
  const categories = normalizeCategoryList([
    ...await getLocalCategories(),
    ...currentCards.map((card) => card.category).filter(Boolean)
  ]);

  await setLocalCategories(categories);
  select.textContent = "";

  for (const category of categories) {
    select.append(new Option(category, category));
  }

  select.append(new Option("+ Add category", ADD_CATEGORY_VALUE));
  select.value = categories.includes(selectedValue) ? selectedValue : "Uncategorized";
  select.dataset.previousValue = select.value;
  deleteButton.disabled = select.value === "Uncategorized";
}

function getSelectedCategory(select) {
  return select.value && select.value !== ADD_CATEGORY_VALUE
    ? select.value
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

function setInlineStatus(status, message, type = "info") {
  status.textContent = message;
  status.classList.toggle("is-error", type === "error");
  status.classList.toggle("is-success", type === "success");
}

function setButtonBusy(button, isBusy, text) {
  button.disabled = isBusy;
  button.textContent = text;
}

function closeEditor() {
  if (editorHost) {
    editorHost.remove();
    editorHost = null;
  }
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
