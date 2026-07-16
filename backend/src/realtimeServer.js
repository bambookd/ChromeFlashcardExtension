import { WebSocketServer } from "ws";
import { createAuthService, publicUser } from "./auth.js";
import { scoreVocabularyAnswer } from "./scoring.js";

const ROOM_CODE_LENGTH = 6;
const ROUND_SECONDS = 30;
const COUNTDOWN_SECONDS = 3;

export function attachRealtimeServer(server, config, repositories) {
  const authService = createAuthService(config, repositories);
  const websocketServer = new WebSocketServer({
    server,
    path: "/realtime"
  });
  const rooms = new Map();

  websocketServer.on("connection", (socket) => {
    socket.on("message", async (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        await handleMessage(socket, message);
      } catch (error) {
        send(socket, "error", {
          message: error.message || "Invalid realtime message"
        });
      }
    });

    socket.on("close", () => {
      leaveCurrentRoom(socket);
    });
  });

  async function handleMessage(socket, message) {
    if (!message || typeof message.action !== "string") {
      throw new Error("Missing realtime action");
    }

    if (message.action === "createRoom") {
      const user = await authenticate(message.token);
      await createRoom(socket, user, message);
      return;
    }

    if (message.action === "joinRoom") {
      const user = await authenticate(message.token);
      joinRoom(socket, user, message.roomId);
      return;
    }

    if (message.action === "ready") {
      setReady(socket, Boolean(message.ready));
      return;
    }

    if (message.action === "submitAnswer") {
      submitAnswer(socket, message.answer);
      return;
    }

    if (message.action === "leaveRoom") {
      leaveCurrentRoom(socket);
      return;
    }

    throw new Error(`Unsupported realtime action: ${message.action}`);
  }

  async function authenticate(token) {
    return authService.authenticateToken(token);
  }

  async function createRoom(socket, user, message) {
    const category = typeof message.category === "string" ? message.category.trim() : "";
    const cards = await repositories.flashcards.listByUser(user.userId);
    const pool = cards.filter((card) => (
      card.word &&
      card.meaning &&
      (!category || card.category === category)
    ));

    if (pool.length === 0) {
      throw new Error("No flashcards available for this realtime room");
    }

    const roomId = createRoomCode(rooms);
    const room = {
      roomId,
      hostUserId: user.userId,
      mode: "realtime-30s",
      category,
      status: "waiting",
      players: new Map(),
      cards: shuffleCards(pool),
      currentIndex: 0,
      timeLeft: ROUND_SECONDS,
      countdownLeft: COUNTDOWN_SECONDS,
      timerId: null
    };

    rooms.set(roomId, room);
    addPlayer(room, socket, user);
    send(socket, "roomCreated", {
      roomId,
      joinUrl: `/game/?room=${roomId}`
    });
    broadcastRoom(room);
  }

  function joinRoom(socket, user, roomId) {
    const normalizedRoomId = String(roomId || "").trim().toUpperCase();
    const room = rooms.get(normalizedRoomId);

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "waiting") {
      throw new Error("Room already started");
    }

    if (!room.players.has(user.userId) && room.players.size >= 2) {
      throw new Error("Room is full");
    }

    addPlayer(room, socket, user);
    broadcastRoom(room);
  }

  function addPlayer(room, socket, user) {
    leaveCurrentRoom(socket);
    socket.roomId = room.roomId;
    socket.userId = user.userId;
    room.players.set(user.userId, {
      user: publicUser(user),
      socket,
      ready: false,
      score: 0,
      answered: 0,
      exact: 0,
      partial: 0,
      wrong: 0,
      currentIndex: 0,
      activeCardId: null,
      awaitingAnswer: false
    });
  }

  function setReady(socket, ready) {
    const room = getSocketRoom(socket);
    const player = room.players.get(socket.userId);

    if (!player) {
      throw new Error("Player not in room");
    }

    player.ready = ready;
    broadcastRoom(room);

    if (
      room.status === "waiting" &&
      room.players.size >= 2 &&
      [...room.players.values()].every((candidate) => candidate.ready)
    ) {
      startCountdown(room);
    }
  }

  function startCountdown(room) {
    room.status = "countdown";
    room.countdownLeft = COUNTDOWN_SECONDS;
    broadcast(room, "countdown", {
      seconds: room.countdownLeft
    });

    room.timerId = setInterval(() => {
      room.countdownLeft -= 1;

      if (room.countdownLeft <= 0) {
        clearInterval(room.timerId);
        room.timerId = null;
        startMatch(room);
        return;
      }

      broadcast(room, "countdown", {
        seconds: room.countdownLeft
      });
    }, 1000);
  }

  function startMatch(room) {
    room.status = "playing";
    room.timeLeft = ROUND_SECONDS;
    room.currentIndex = 0;
    for (const player of room.players.values()) {
      player.currentIndex = 0;
      player.activeCardId = null;
      player.awaitingAnswer = false;
    }
    broadcastRoom(room);
    broadcastPrompt(room);

    room.timerId = setInterval(() => {
      room.timeLeft -= 1;

      if (room.timeLeft <= 0) {
        completeRoom(room);
        return;
      }

      broadcastRoom(room);
    }, 1000);
  }

  function submitAnswer(socket, answer) {
    const room = getSocketRoom(socket);

    if (room.status !== "playing") {
      throw new Error("Room is not currently playing");
    }

    const player = room.players.get(socket.userId);
    const card = getPlayerPromptCard(room, player);

    if (!player || !card) {
      throw new Error("No active prompt");
    }

    const cardId = card.cardId || card.id;

    if (!player.awaitingAnswer || player.activeCardId !== cardId) {
      throw new Error("Wait for the next prompt");
    }

    const score = scoreVocabularyAnswer(answer, card.word);
    player.awaitingAnswer = false;
    player.score += score.points;
    player.answered += 1;

    if (score.result === "exact") {
      player.exact += 1;
    } else if (score.result === "partial") {
      player.partial += 1;
    } else {
      player.wrong += 1;
    }

    send(socket, "answerResult", {
      result: score.result,
      label: score.label,
      points: score.points,
      correctAnswer: card.word
    });
    broadcastRoom(room);

    player.currentIndex += 1;

    if (room.status === "playing" && room.timeLeft > 0) {
      sendPromptToPlayer(room, player);
    }
  }

  function broadcastPrompt(room) {
    for (const player of room.players.values()) {
      sendPromptToPlayer(room, player);
    }
  }

  function sendPromptToPlayer(room, player) {
    const card = getPlayerPromptCard(room, player);

    if (!card) {
      completeRoom(room);
      return;
    }

    player.activeCardId = card.cardId || card.id;
    player.awaitingAnswer = true;

    send(player.socket, "prompt", {
      questionId: card.cardId || card.id,
      meaning: card.meaning,
      wordform: card.wordform || "unknown",
      category: card.category || "Uncategorized"
    });
  }

  function getPlayerPromptCard(room, player) {
    if (!room.cards.length) {
      return null;
    }

    return room.cards[player.currentIndex % room.cards.length];
  }

  function completeRoom(room) {
    if (room.timerId) {
      clearInterval(room.timerId);
      room.timerId = null;
    }

    room.status = "complete";
    const players = serializePlayers(room);
    const winner = [...players].sort((first, second) => second.score - first.score)[0] || null;

    broadcast(room, "matchEnded", {
      room: serializeRoom(room),
      winner
    });
    broadcastRoom(room);
  }

  function leaveCurrentRoom(socket) {
    if (!socket.roomId) {
      return;
    }

    const room = rooms.get(socket.roomId);

    if (room) {
      const player = room.players.get(socket.userId);

      if (player?.socket === socket) {
        room.players.delete(socket.userId);
      }

      if (room.players.size === 0) {
        if (room.timerId) {
          clearInterval(room.timerId);
        }

        rooms.delete(room.roomId);
      } else {
        broadcastRoom(room);
      }
    }

    socket.roomId = null;
    socket.userId = null;
  }

  function getSocketRoom(socket) {
    const room = rooms.get(socket.roomId);

    if (!room) {
      throw new Error("Join a room first");
    }

    return room;
  }

  function broadcastRoom(room) {
    broadcast(room, "roomState", {
      room: serializeRoom(room)
    });
  }

  function broadcast(room, type, payload = {}) {
    for (const player of room.players.values()) {
      send(player.socket, type, payload);
    }
  }

  console.log("Realtime local WebSocket server attached at /realtime");
  return websocketServer;
}

function send(socket, type, payload = {}) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify({
      type,
      ...payload
    }));
  }
}

function serializeRoom(room) {
  return {
    roomId: room.roomId,
    hostUserId: room.hostUserId,
    mode: room.mode,
    category: room.category,
    status: room.status,
    timeLeft: room.timeLeft,
    countdownLeft: room.countdownLeft,
    currentPrompt: room.currentIndex + 1,
    playerCount: room.players.size,
    players: serializePlayers(room)
  };
}

function serializePlayers(room) {
  return [...room.players.values()].map((player) => ({
    userId: player.user.userId,
    username: player.user.username,
    ready: player.ready,
    score: player.score,
    answered: player.answered,
    exact: player.exact,
    partial: player.partial,
    wrong: player.wrong
  }));
}

function createRoomCode(rooms) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = Array.from({ length: ROOM_CODE_LENGTH }, () => (
      alphabet[Math.floor(Math.random() * alphabet.length)]
    )).join("");
  } while (rooms.has(code));

  return code;
}

function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
