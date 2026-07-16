const API_BASE_URL = window.FLASHCARD_CONFIG?.API_BASE_URL || "";
const STUDY_URL = window.FLASHCARD_CONFIG?.STUDY_URL || "/study/";
const REALTIME_URL = window.FLASHCARD_CONFIG?.REALTIME_URL || createRealtimeUrl();
const AUTH_KEY = "flashcardStudyAuth";
const THEME_KEY = "flashcardStudyTheme";

const state = {
  token: "",
  user: null,
  flashcards: [],
  categories: ["Uncategorized"],
  game: createEmptyGame(),
  realtime: createEmptyRealtime()
};

const elements = {
  authView: document.getElementById("authView"),
  gameView: document.getElementById("gameView"),
  authForm: document.getElementById("authForm"),
  authThemeToggle: document.getElementById("authThemeToggle"),
  gameThemeToggle: document.getElementById("gameThemeToggle"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  authStatus: document.getElementById("authStatus"),
  userBadge: document.getElementById("userBadge"),
  logoutButton: document.getElementById("logoutButton"),
  soloTabButton: document.getElementById("soloTabButton"),
  realtimeTabButton: document.getElementById("realtimeTabButton"),
  soloPanel: document.getElementById("soloPanel"),
  realtimePanel: document.getElementById("realtimePanel"),
  categorySelect: document.getElementById("categorySelect"),
  roomCategorySelect: document.getElementById("roomCategorySelect"),
  modeSelect: document.getElementById("modeSelect"),
  startButton: document.getElementById("startButton"),
  scoreValue: document.getElementById("scoreValue"),
  answeredValue: document.getElementById("answeredValue"),
  timerValue: document.getElementById("timerValue"),
  wordformValue: document.getElementById("wordformValue"),
  meaningText: document.getElementById("meaningText"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  submitButton: document.getElementById("submitButton"),
  feedbackText: document.getElementById("feedbackText"),
  resultBox: document.getElementById("resultBox"),
  nextButton: document.getElementById("nextButton"),
  progressText: document.getElementById("progressText"),
  summaryScore: document.getElementById("summaryScore"),
  summaryExact: document.getElementById("summaryExact"),
  summaryPartial: document.getElementById("summaryPartial"),
  summaryWrong: document.getElementById("summaryWrong"),
  summaryNote: document.getElementById("summaryNote"),
  createRoomButton: document.getElementById("createRoomButton"),
  roomCodeInput: document.getElementById("roomCodeInput"),
  joinRoomButton: document.getElementById("joinRoomButton"),
  roomTitle: document.getElementById("roomTitle"),
  readyButton: document.getElementById("readyButton"),
  roomStatusText: document.getElementById("roomStatusText"),
  roomLinkText: document.getElementById("roomLinkText"),
  playerList: document.getElementById("playerList"),
  realtimeWordformValue: document.getElementById("realtimeWordformValue"),
  realtimeMeaningText: document.getElementById("realtimeMeaningText"),
  realtimeAnswerForm: document.getElementById("realtimeAnswerForm"),
  realtimeAnswerInput: document.getElementById("realtimeAnswerInput"),
  realtimeSubmitButton: document.getElementById("realtimeSubmitButton"),
  realtimeFeedbackText: document.getElementById("realtimeFeedbackText"),
  realtimeResultBox: document.getElementById("realtimeResultBox"),
  scoreboardList: document.getElementById("scoreboardList"),
  winnerText: document.getElementById("winnerText")
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  applySavedTheme();
  document.querySelector(".secondary-link").setAttribute("href", STUDY_URL);
  bindEvents();
  restoreSession();
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

function toggleTheme() {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
}

function setTheme(theme) {
  const normalized = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalized;
  localStorage.setItem(THEME_KEY, normalized);

  const label = normalized === "dark" ? "Light" : "Dark";
  elements.authThemeToggle.textContent = label;
  elements.gameThemeToggle.textContent = label;
}

function bindEvents() {
  elements.authThemeToggle.addEventListener("click", toggleTheme);
  elements.gameThemeToggle.addEventListener("click", toggleTheme);
  elements.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
  elements.soloTabButton.addEventListener("click", () => switchMode("solo"));
  elements.realtimeTabButton.addEventListener("click", () => switchMode("realtime"));
  elements.logoutButton.addEventListener("click", logout);
  elements.startButton.addEventListener("click", startGame);
  elements.nextButton.addEventListener("click", nextPrompt);
  elements.answerForm.addEventListener("submit", submitAnswer);
  elements.categorySelect.addEventListener("change", resetGame);
  elements.modeSelect.addEventListener("change", resetGame);
  elements.createRoomButton.addEventListener("click", createRealtimeRoom);
  elements.joinRoomButton.addEventListener("click", joinRealtimeRoomFromInput);
  elements.readyButton.addEventListener("click", toggleReady);
  elements.realtimeAnswerForm.addEventListener("submit", submitRealtimeAnswer);
}

function switchMode(mode) {
  const isRealtime = mode === "realtime";
  elements.soloPanel.classList.toggle("is-hidden", isRealtime);
  elements.realtimePanel.classList.toggle("is-hidden", !isRealtime);
  elements.soloTabButton.classList.toggle("is-active", !isRealtime);
  elements.realtimeTabButton.classList.toggle("is-active", isRealtime);
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
  showGame();

  try {
    await apiFetch("/api/me");
    await loadFlashcards();
    autoJoinRoomFromUrl();
  } catch (error) {
    logout();
    setStatus(elements.authStatus, "Session expired. Please login again.", "error");
  }
}

async function login() {
  setStatus(elements.authStatus, "");

  try {
    const response = await rawFetch("/api/auth/login", {
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
    showGame();
    await loadFlashcards();
  } catch (error) {
    setStatus(elements.authStatus, error.message, "error");
  }
}

function logout() {
  stopTimer();
  closeRealtimeSocket();
  state.token = "";
  state.user = null;
  state.flashcards = [];
  state.categories = ["Uncategorized"];
  state.game = createEmptyGame();
  state.realtime = createEmptyRealtime();
  localStorage.removeItem(AUTH_KEY);
  showAuth();
}

function showAuth() {
  elements.authView.classList.remove("is-hidden");
  elements.gameView.classList.add("is-hidden");
}

function showGame() {
  elements.authView.classList.add("is-hidden");
  elements.gameView.classList.remove("is-hidden");
  elements.userBadge.textContent = state.user?.username || "";
}

async function loadFlashcards() {
  const [cardsResponse, categoriesResponse] = await Promise.all([
    apiFetch("/api/flashcards"),
    apiFetch("/api/categories")
  ]);

  state.flashcards = cardsResponse.flashcards || [];
  state.categories = normalizeCategoryList([
    ...(categoriesResponse.categories || []),
    ...state.flashcards.map((card) => card.category).filter(Boolean)
  ]);
  renderCategories();
  resetGame();
}

function renderCategories() {
  const selected = elements.categorySelect.value;
  const roomSelected = elements.roomCategorySelect.value;
  elements.categorySelect.textContent = "";
  elements.categorySelect.append(new Option("All categories", ""));
  elements.roomCategorySelect.textContent = "";
  elements.roomCategorySelect.append(new Option("All categories", ""));

  for (const category of state.categories) {
    elements.categorySelect.append(new Option(category, category));
    elements.roomCategorySelect.append(new Option(category, category));
  }

  elements.categorySelect.value = state.categories.includes(selected) ? selected : "";
  elements.roomCategorySelect.value = state.categories.includes(roomSelected) ? roomSelected : "";
}

function getGamePool() {
  const category = elements.categorySelect.value;
  return (category
    ? state.flashcards.filter((card) => card.category === category)
    : [...state.flashcards]
  ).filter((card) => card.word && card.meaning);
}

function resetGame() {
  stopTimer();
  state.game = createEmptyGame(elements.modeSelect.value);
  elements.meaningText.textContent = "Choose a category and start the game.";
  elements.wordformValue.textContent = "wordform";
  elements.answerInput.value = "";
  elements.answerInput.disabled = true;
  elements.submitButton.disabled = true;
  elements.nextButton.disabled = true;
  elements.feedbackText.textContent = "Exact = 100 points. Strong continuous partial = 50 points.";
  elements.feedbackText.className = "feedback";
  elements.resultBox.textContent = "";
  renderGameStats();
}

function startGame() {
  const pool = getGamePool();

  if (pool.length === 0) {
    elements.feedbackText.textContent = "No cards available for this category.";
    elements.feedbackText.className = "feedback is-error";
    return;
  }

  stopTimer();
  const mode = elements.modeSelect.value;
  const limit = mode === "solo-30s" ? pool.length : 10;
  const cards = shuffleCards(pool).slice(0, Math.min(limit, pool.length));

  state.game = {
    ...createEmptyGame(mode),
    isActive: true,
    queue: cards,
    totalCards: cards.length,
    timeLeft: mode === "solo-30s" ? 30 : 0
  };

  elements.startButton.textContent = "Restart game";
  nextPrompt();

  if (mode === "solo-30s") {
    state.game.timerId = window.setInterval(tickTimer, 1000);
  }
}

function nextPrompt() {
  if (!state.game.isActive) {
    startGame();
    return;
  }

  if (state.game.mode === "solo-10-card" && state.game.answered >= state.game.totalCards) {
    completeGame();
    return;
  }

  const nextCard = state.game.queue.shift();

  if (!nextCard) {
    completeGame();
    return;
  }

  state.game.currentCard = nextCard;
  state.game.hasAnsweredCurrent = false;
  elements.meaningText.textContent = nextCard.meaning;
  elements.wordformValue.textContent = nextCard.wordform || "unknown";
  elements.answerInput.value = "";
  elements.answerInput.disabled = false;
  elements.submitButton.disabled = false;
  elements.nextButton.disabled = true;
  elements.feedbackText.textContent = "Type the original word.";
  elements.feedbackText.className = "feedback";
  elements.resultBox.textContent = "";
  elements.answerInput.focus();
  renderGameStats();
}

function submitAnswer(event) {
  event.preventDefault();

  if (!state.game.currentCard || state.game.hasAnsweredCurrent || state.game.isComplete) {
    return;
  }

  const result = scoreVocabularyAnswer(elements.answerInput.value, state.game.currentCard.word);
  state.game.score += result.points;
  state.game.answered += 1;
  state.game.hasAnsweredCurrent = true;

  if (result.result === "exact") {
    state.game.exactCount += 1;
  } else if (result.result === "partial") {
    state.game.partialCount += 1;
  } else {
    state.game.wrongCount += 1;
  }

  renderAnswerResult(result);
  elements.answerInput.disabled = true;
  elements.submitButton.disabled = true;

  if (state.game.mode === "solo-10-card" && state.game.answered >= state.game.totalCards) {
    elements.nextButton.disabled = true;
    window.setTimeout(completeGame, 450);
  } else {
    elements.nextButton.disabled = false;
  }

  renderGameStats();
}

function renderAnswerResult(result) {
  elements.resultBox.className = `result-box result-${result.result}`;
  elements.resultBox.textContent = `${result.label}: ${result.points} pts. Answer: ${state.game.currentCard.word}`;

  if (result.result === "exact") {
    elements.feedbackText.textContent = "Exact match. Full points.";
    elements.feedbackText.className = "feedback is-success";
  } else if (result.result === "partial") {
    elements.feedbackText.textContent = "Partial match. You found a strong continuous chunk.";
    elements.feedbackText.className = "feedback is-warning";
  } else {
    elements.feedbackText.textContent = "Wrong answer. Move to the next prompt.";
    elements.feedbackText.className = "feedback is-error";
  }
}

function completeGame() {
  if (state.game.isComplete) {
    return;
  }

  stopTimer();
  state.game.isActive = false;
  state.game.isComplete = true;
  elements.answerInput.disabled = true;
  elements.submitButton.disabled = true;
  elements.nextButton.disabled = true;
  elements.feedbackText.textContent = "Game complete. Start again when ready.";
  elements.feedbackText.className = "feedback is-success";
  elements.summaryNote.textContent = `${state.game.mode === "solo-30s" ? "Sprint" : "Challenge"} complete.`;
  renderGameStats();
}

function renderGameStats() {
  elements.scoreValue.textContent = String(state.game.score || 0);
  elements.answeredValue.textContent = String(state.game.answered || 0);
  elements.timerValue.textContent = state.game.mode === "solo-30s" ? `${state.game.timeLeft}s` : "--";
  elements.progressText.textContent = state.game.mode === "solo-30s"
    ? `${state.game.timeLeft}s / ${state.game.answered} answered`
    : `${state.game.answered || 0} / ${state.game.totalCards || 0}`;
  elements.summaryScore.textContent = String(state.game.score || 0);
  elements.summaryExact.textContent = String(state.game.exactCount || 0);
  elements.summaryPartial.textContent = String(state.game.partialCount || 0);
  elements.summaryWrong.textContent = String(state.game.wrongCount || 0);
}

function tickTimer() {
  if (!state.game.isActive || state.game.mode !== "solo-30s") {
    stopTimer();
    return;
  }

  state.game.timeLeft -= 1;

  if (state.game.timeLeft <= 0) {
    completeGame();
    return;
  }

  renderGameStats();
}

function stopTimer() {
  if (state.game?.timerId) {
    window.clearInterval(state.game.timerId);
    state.game.timerId = null;
  }
}

function createRealtimeRoom() {
  connectRealtimeSocket(() => {
    sendRealtime({
      action: "createRoom",
      token: state.token,
      category: elements.roomCategorySelect.value
    });
  });
}

function joinRealtimeRoomFromInput() {
  const roomId = elements.roomCodeInput.value.trim().toUpperCase();

  if (!roomId) {
    setRealtimeStatus("Enter a room code first.", "error");
    return;
  }

  joinRealtimeRoom(roomId);
}

function autoJoinRoomFromUrl() {
  const roomId = new URLSearchParams(window.location.search).get("room");

  if (!roomId) {
    return;
  }

  switchMode("realtime");
  elements.roomCodeInput.value = roomId.toUpperCase();
  joinRealtimeRoom(roomId);
}

function joinRealtimeRoom(roomId) {
  connectRealtimeSocket(() => {
    sendRealtime({
      action: "joinRoom",
      token: state.token,
      roomId
    });
  });
}

function connectRealtimeSocket(onOpen) {
  if (state.realtime.socket?.readyState === WebSocket.OPEN) {
    onOpen();
    return;
  }

  closeRealtimeSocket();
  const socket = new WebSocket(REALTIME_URL);
  state.realtime.socket = socket;
  setRealtimeStatus("Connecting to realtime server...");

  socket.addEventListener("open", () => {
    setRealtimeStatus("Realtime connected.");
    onOpen();
  });

  socket.addEventListener("message", (event) => {
    handleRealtimeMessage(JSON.parse(event.data));
  });

  socket.addEventListener("close", () => {
    setRealtimeStatus("Realtime disconnected.", "error");
    elements.readyButton.disabled = true;
    elements.realtimeAnswerInput.disabled = true;
    elements.realtimeSubmitButton.disabled = true;
  });

  socket.addEventListener("error", () => {
    setRealtimeStatus("Realtime connection failed.", "error");
  });
}

function closeRealtimeSocket() {
  if (state.realtime.socket) {
    state.realtime.socket.close();
    state.realtime.socket = null;
  }
}

function sendRealtime(message) {
  if (state.realtime.socket?.readyState !== WebSocket.OPEN) {
    setRealtimeStatus("Realtime socket is not connected.", "error");
    return;
  }

  state.realtime.socket.send(JSON.stringify(message));
}

function handleRealtimeMessage(message) {
  if (message.type === "error") {
    setRealtimeStatus(message.message || "Realtime error", "error");
    return;
  }

  if (message.type === "roomCreated") {
    state.realtime.roomId = message.roomId;
    const joinUrl = `${window.location.origin}/game/?room=${message.roomId}`;
    elements.roomCodeInput.value = message.roomId;
    elements.roomLinkText.textContent = joinUrl;
    window.history.replaceState(null, "", `/game/?room=${message.roomId}`);
    setRealtimeStatus(`Room ${message.roomId} created. Share the link with player 2.`, "success");
    return;
  }

  if (message.type === "roomState") {
    renderRealtimeRoom(message.room);
    return;
  }

  if (message.type === "countdown") {
    setRealtimeStatus(`Starting in ${message.seconds}...`, "success");
    return;
  }

  if (message.type === "prompt") {
    state.realtime.currentQuestionId = message.questionId;
    state.realtime.hasAnsweredCurrent = false;
    elements.realtimeMeaningText.textContent = message.meaning;
    elements.realtimeWordformValue.textContent = message.wordform || "unknown";
    elements.realtimeAnswerInput.value = "";
    elements.realtimeAnswerInput.disabled = false;
    elements.realtimeSubmitButton.disabled = false;
    elements.realtimeFeedbackText.textContent = "Type the original word. You do not need to wait for the other player.";
    elements.realtimeAnswerInput.focus();
    return;
  }

  if (message.type === "answerResult") {
    state.realtime.hasAnsweredCurrent = true;
    elements.realtimeAnswerInput.disabled = true;
    elements.realtimeSubmitButton.disabled = true;
    elements.realtimeResultBox.className = `result-box result-${message.result}`;
    elements.realtimeResultBox.textContent = `${message.label}: ${message.points} pts. Answer: ${message.correctAnswer}`;
    return;
  }

  if (message.type === "matchEnded") {
    renderRealtimeRoom(message.room);
    elements.realtimeAnswerInput.disabled = true;
    elements.realtimeSubmitButton.disabled = true;
    elements.winnerText.textContent = message.winner
      ? `Winner: ${message.winner.username} with ${message.winner.score} points.`
      : "Match complete.";
  }
}

function renderRealtimeRoom(room) {
  if (!room) {
    return;
  }

  state.realtime.roomId = room.roomId;
  state.realtime.room = room;
  elements.roomTitle.textContent = `Room ${room.roomId}`;
  elements.roomStatusText.className = "feedback";
  elements.roomStatusText.textContent = `${room.status} / ${room.timeLeft}s`;
  elements.readyButton.disabled = !["waiting", "countdown"].includes(room.status);
  elements.playerList.textContent = "";
  elements.scoreboardList.textContent = "";

  for (const player of room.players) {
    const item = document.createElement("div");
    item.className = "player-item";
    item.innerHTML = `<span>${escapeHtml(player.username)}</span><strong>${player.ready ? "Ready" : "Waiting"}</strong>`;
    elements.playerList.appendChild(item);

    const score = document.createElement("div");
    score.className = "scoreboard-item";
    score.innerHTML = `
      <span>${escapeHtml(player.username)}</span>
      <strong>${player.score}</strong>
      <small>${player.exact} exact / ${player.partial} partial / ${player.wrong} wrong</small>
    `;
    elements.scoreboardList.appendChild(score);
  }
}

function toggleReady() {
  state.realtime.ready = !state.realtime.ready;
  elements.readyButton.textContent = state.realtime.ready ? "Unready" : "Ready";
  sendRealtime({
    action: "ready",
    ready: state.realtime.ready
  });
}

function submitRealtimeAnswer(event) {
  event.preventDefault();

  if (!state.realtime.currentQuestionId || state.realtime.hasAnsweredCurrent) {
    return;
  }

  sendRealtime({
    action: "submitAnswer",
    answer: elements.realtimeAnswerInput.value
  });
  state.realtime.hasAnsweredCurrent = true;
  elements.realtimeAnswerInput.disabled = true;
  elements.realtimeSubmitButton.disabled = true;
}

function setRealtimeStatus(message, type = "info") {
  elements.roomStatusText.textContent = message;
  elements.roomStatusText.classList.toggle("is-error", type === "error");
  elements.roomStatusText.classList.toggle("is-success", type === "success");
}

function createEmptyGame(mode = "solo-10-card") {
  return {
    mode,
    isActive: false,
    isComplete: false,
    currentCard: null,
    queue: [],
    totalCards: 0,
    answered: 0,
    score: 0,
    exactCount: 0,
    partialCount: 0,
    wrongCount: 0,
    timeLeft: mode === "solo-30s" ? 30 : 0,
    timerId: null,
    hasAnsweredCurrent: false
  };
}

function createEmptyRealtime() {
  return {
    socket: null,
    roomId: "",
    room: null,
    ready: false,
    currentQuestionId: "",
    hasAnsweredCurrent: false
  };
}

function scoreVocabularyAnswer(answer, expectedWord) {
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedExpected = normalizeAnswer(expectedWord);

  if (!normalizedAnswer || !normalizedExpected) {
    return { result: "wrong", label: "Wrong", points: 0 };
  }

  if (normalizedAnswer === normalizedExpected) {
    return { result: "exact", label: "Exact", points: 100 };
  }

  return longestCommonSubstringLength(normalizedAnswer, normalizedExpected) / normalizedExpected.length >= 0.5
    ? { result: "partial", label: "Partial", points: 50 }
    : { result: "wrong", label: "Wrong", points: 0 };
}

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .replace(/\s+/g, " ");
}

function longestCommonSubstringLength(first, second) {
  const previous = Array(second.length + 1).fill(0);
  let longest = 0;

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = 0;

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const current = previous[secondIndex];

      if (first[firstIndex - 1] === second[secondIndex - 1]) {
        previous[secondIndex] = diagonal + 1;
        longest = Math.max(longest, previous[secondIndex]);
      } else {
        previous[secondIndex] = 0;
      }

      diagonal = current;
    }
  }

  return longest;
}

function normalizeCategoryList(categories) {
  const byKey = new Map();

  for (const category of categories || []) {
    const normalized = String(category || "").trim().slice(0, 40);

    if (normalized && !byKey.has(normalized.toLowerCase())) {
      byKey.set(normalized.toLowerCase(), normalized);
    }
  }

  if (!byKey.has("uncategorized")) {
    byKey.set("uncategorized", "Uncategorized");
  }

  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
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

function createRealtimeUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/realtime`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
