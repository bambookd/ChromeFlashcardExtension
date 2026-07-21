const FLASHCARD_STORAGE_KEY = "flashcards";
const FLASHCARD_CATEGORY_STORAGE_KEY = "flashcardCategories";
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
      <button class="icon-button" type="button" data-action="close" aria-label="Close editor" title="Close (Esc)">×</button>
    </div>

    <form>
      <label>
        <span>Word</span>
        <input name="word" type="text" value="${escapeAttribute(word)}" required>
      </label>

      <label>
        <span>Meaning</span>
        <textarea name="meaning" rows="3" placeholder="Type meaning manually" required></textarea>
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
            <button class="field-button" type="button" data-action="delete-category" title="Delete category" aria-label="Delete category">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2.5 4h11M6.5 4V2.5h3V4M4 4l.6 9a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L12 4"></path>
              </svg>
            </button>
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
      --surface: #ffffff;
      --surface-subtle: #f1f3f6;
      --surface-hover: #e9ecf1;
      --border: #e3e6eb;
      --border-strong: #ccd2db;
      --text: #1a1d24;
      --text-secondary: #565f6d;
      --text-muted: #8a93a1;
      --accent: #3a5bd9;
      --accent-hover: #2f4bbd;
      --on-accent: #ffffff;
      --success: #16794f;
      --success-soft: #e7f4ee;
      --danger: #b4302c;
      --danger-soft: #fbecec;
      --ring: 0 0 0 3px rgba(58, 91, 217, 0.18);
      --shadow: 0 16px 44px rgba(20, 25, 35, 0.18), 0 2px 8px rgba(20, 25, 35, 0.08);
      --ease: cubic-bezier(0.2, 0.7, 0.3, 1);

      width: 364px;
      max-width: calc(100vw - 24px);
      padding: 16px;
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: var(--shadow);
      font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      pointer-events: auto;
      animation: editor-in 160ms var(--ease);
    }

    @media (prefers-color-scheme: dark) {
      .flashcard-editor {
        --surface: #161a21;
        --surface-subtle: #1c212a;
        --surface-hover: #232935;
        --border: #2b323d;
        --border-strong: #39414f;
        --text: #e6e9ee;
        --text-secondary: #a3acba;
        --text-muted: #7c8695;
        --accent: #7d97f4;
        --accent-hover: #93a9f7;
        --on-accent: #0e1116;
        --success: #4ec294;
        --success-soft: rgba(78, 194, 148, 0.14);
        --danger: #f08a86;
        --danger-soft: rgba(240, 138, 134, 0.14);
        --ring: 0 0 0 3px rgba(125, 151, 244, 0.26);
        --shadow: 0 20px 52px rgba(0, 0, 0, 0.55);
      }
    }

    @keyframes editor-in {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.985);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .flashcard-editor {
        animation: none;
      }
    }

    .editor-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
    }

    h2 {
      margin: 0;
      color: var(--text);
      font-size: 16px;
      font-weight: 650;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }

    .editor-header p {
      margin: 2px 0 0;
      color: var(--text-muted);
      font-size: 12px;
    }

    form,
    label {
      display: flex;
      flex-direction: column;
    }

    form {
      gap: 11px;
    }

    label {
      gap: 6px;
      color: var(--text-secondary);
      font-size: 12px;
      font-weight: 550;
    }

    input,
    select,
    textarea {
      width: 100%;
      margin: 0;
      padding: 9px 11px;
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      outline: 0;
      font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
      transition: border-color 140ms var(--ease), box-shadow 140ms var(--ease);
    }

    textarea {
      min-height: 66px;
      resize: vertical;
    }

    input::placeholder,
    textarea::placeholder {
      color: var(--text-muted);
    }

    input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--accent);
      box-shadow: var(--ring);
    }

    button {
      display: inline-grid;
      min-height: 36px;
      margin: 0;
      padding: 0 12px;
      place-items: center;
      border: 0;
      border-radius: 8px;
      cursor: pointer;
      font: 600 13px/1 system-ui, -apple-system, "Segoe UI", sans-serif;
      transition: background 140ms var(--ease), color 140ms var(--ease);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    button:focus-visible {
      box-shadow: var(--ring);
      outline: 0;
    }

    .category-row,
    .field-grid,
    .actions {
      display: grid;
      gap: 8px;
    }

    .category-row {
      grid-template-columns: 1fr auto;
    }

    .field-grid,
    .actions {
      grid-template-columns: 1fr 1fr;
    }

    .primary-button {
      color: var(--on-accent);
      background: var(--accent);
    }

    .primary-button:hover:not(:disabled) {
      background: var(--accent-hover);
    }

    .secondary-button {
      color: var(--text);
      background: var(--surface-subtle);
      border: 1px solid var(--border);
    }

    .secondary-button:hover:not(:disabled) {
      background: var(--surface-hover);
    }

    .icon-button {
      width: 28px;
      min-height: 28px;
      padding: 0;
      color: var(--text-muted);
      background: transparent;
      font-size: 17px;
    }

    .field-button {
      width: 36px;
      padding: 0;
      color: var(--text-muted);
      background: var(--surface-subtle);
      border: 1px solid var(--border);
    }

    .icon-button:hover:not(:disabled),
    .field-button:hover:not(:disabled) {
      color: var(--danger);
      background: var(--danger-soft);
      border-color: transparent;
    }

    select {
      min-width: 0;
    }

    .status {
      display: flex;
      align-items: center;
      min-height: 16px;
      margin: 0;
      color: var(--text-muted);
      font-size: 12px;
    }

    .status:not(:empty) {
      padding: 7px 9px;
      background: var(--surface-subtle);
      border-radius: 8px;
    }

    .status.is-error:not(:empty) {
      color: var(--danger);
      background: var(--danger-soft);
    }

    .status.is-success:not(:empty) {
      color: var(--success);
      background: var(--success-soft);
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

function setInlineStatus(status, message, type = "info") {
  status.textContent = message;
  status.classList.toggle("is-error", type === "error");
  status.classList.toggle("is-success", type === "success");
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
