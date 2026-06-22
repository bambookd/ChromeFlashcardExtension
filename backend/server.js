import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "local-dev-secret-change-before-production";
const DATA_DIR = path.join(__dirname, "data");
const EXPORT_DIR = path.join(__dirname, "exports");
const PUBLIC_DIR = path.join(__dirname, "public");
const STUDY_DIR = path.join(PUBLIC_DIR, "study");
const USERS_PATH = path.join(DATA_DIR, "users.json");
const FLASHCARDS_PATH = path.join(DATA_DIR, "flashcards.json");
const CLOUD_STORE_PATH = path.join(DATA_DIR, "cloud-store.json");

const SAMPLE_USERS = [
  {
    id: "user-demo-1",
    username: "student",
    password: "password123"
  },
  {
    id: "user-demo-2",
    username: "teacher",
    password: "password123"
  }
];

const SAMPLE_FLASHCARDS = [
  {
    userId: "user-demo-1",
    word: "resilient",
    meaning: "Able to recover quickly from difficulty.",
    wordform: "adjective",
    category: "IELTS"
  },
  {
    userId: "user-demo-1",
    word: "clarity",
    meaning: "The quality of being clear and easy to understand.",
    wordform: "noun",
    category: "Work"
  },
  {
    userId: "user-demo-2",
    word: "meticulous",
    meaning: "Very careful and attentive to detail.",
    wordform: "adjective",
    category: "Teaching"
  },
  {
    userId: "user-demo-2",
    word: "innovate",
    meaning: "To introduce a new idea, method, or product.",
    wordform: "verb",
    category: "Business"
  }
];

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/exports", express.static(EXPORT_DIR, {
  extensions: ["json"],
  immutable: false,
  maxAge: 0
}));
app.use("/study", express.static(STUDY_DIR));

app.get("/", (_request, response) => {
  response.redirect("/study");
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "flashcard-local-api",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const username = normalizeUsername(request.body?.username);
    const password = normalizePassword(request.body?.password);
    const users = await readJson(USERS_PATH, []);

    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      throw httpError(409, "Username already exists");
    }

    const user = {
      id: randomUUID(),
      username,
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeJson(USERS_PATH, users);

    response.status(201).json(createAuthPayload(user));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const username = normalizeUsername(request.body?.username);
    const password = normalizePassword(request.body?.password);
    const users = await readJson(USERS_PATH, []);
    const user = users.find((candidate) => candidate.username.toLowerCase() === username.toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw httpError(401, "Invalid username or password");
    }

    response.json(createAuthPayload(user));
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", requireAuth, (request, response) => {
  response.json({
    ok: true,
    user: publicUser(request.user)
  });
});

app.get("/api/flashcards", requireAuth, async (request, response, next) => {
  try {
    const flashcards = await getUserFlashcards(request.user.id);

    response.json({
      ok: true,
      count: flashcards.length,
      flashcards
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/flashcards", requireAuth, async (request, response, next) => {
  try {
    const flashcard = normalizeFlashcard(request.body, 0, { allowEmptyMeaning: false });
    const now = new Date().toISOString();
    const flashcards = await readJson(FLASHCARDS_PATH, []);
    const created = {
      ...flashcard,
      id: randomUUID(),
      userId: request.user.id,
      createdAt: flashcard.createdAt || now,
      updatedAt: now,
      syncedAt: now
    };

    flashcards.unshift(created);
    await writeJson(FLASHCARDS_PATH, flashcards);

    response.status(201).json({
      ok: true,
      flashcard: stripInternalFields(created)
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/flashcards/:id", requireAuth, async (request, response, next) => {
  try {
    const flashcardId = normalizeRequiredString(request.params.id, "flashcard id");
    const updates = normalizeFlashcard(request.body, 0, { allowEmptyMeaning: false });
    const flashcards = await readJson(FLASHCARDS_PATH, []);
    const index = flashcards.findIndex((card) => card.id === flashcardId && card.userId === request.user.id);

    if (index === -1) {
      throw httpError(404, "Flashcard not found");
    }

    const updated = {
      ...flashcards[index],
      ...updates,
      id: flashcards[index].id,
      userId: request.user.id,
      createdAt: flashcards[index].createdAt,
      updatedAt: new Date().toISOString()
    };

    flashcards[index] = updated;
    await writeJson(FLASHCARDS_PATH, flashcards);

    response.json({
      ok: true,
      flashcard: stripInternalFields(updated)
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flashcards/:id", requireAuth, async (request, response, next) => {
  try {
    const flashcardId = normalizeRequiredString(request.params.id, "flashcard id");
    const flashcards = await readJson(FLASHCARDS_PATH, []);
    const nextFlashcards = flashcards.filter((card) => !(card.id === flashcardId && card.userId === request.user.id));

    if (nextFlashcards.length === flashcards.length) {
      throw httpError(404, "Flashcard not found");
    }

    await writeJson(FLASHCARDS_PATH, nextFlashcards);

    response.json({
      ok: true,
      deletedId: flashcardId
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories", requireAuth, async (request, response, next) => {
  try {
    const flashcards = await getUserFlashcards(request.user.id);
    const categories = [...new Set(flashcards.map((card) => card.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    response.json({
      ok: true,
      categories
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/study/random", requireAuth, async (request, response, next) => {
  try {
    const category = normalizeOptionalString(request.query.category);
    const flashcards = await getUserFlashcards(request.user.id);
    const pool = category
      ? flashcards.filter((card) => card.category.toLowerCase() === category.toLowerCase())
      : flashcards;

    response.json({
      ok: true,
      flashcard: pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null,
      count: pool.length
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/sync", requireAuth, async (request, response, next) => {
  try {
    const incomingCards = validateFlashcards(request.body?.flashcards, { allowEmptyMeaning: false });
    const syncedAt = new Date().toISOString();
    const allCards = await readJson(FLASHCARDS_PATH, []);
    const byId = new Map(allCards.map((card, index) => [card.id, { card, index }]));
    let created = 0;
    let updated = 0;

    for (const incomingCard of incomingCards) {
      const normalized = {
        ...incomingCard,
        id: incomingCard.id || randomUUID(),
        userId: request.user.id,
        createdAt: incomingCard.createdAt || syncedAt,
        updatedAt: syncedAt,
        syncedAt
      };

      const existing = byId.get(normalized.id);

      if (existing && existing.card.userId === request.user.id) {
        allCards[existing.index] = {
          ...existing.card,
          ...normalized,
          createdAt: existing.card.createdAt || normalized.createdAt
        };
        updated += 1;
      } else {
        allCards.unshift(normalized);
        created += 1;
      }
    }

    await writeJson(FLASHCARDS_PATH, allCards);
    await writeJson(CLOUD_STORE_PATH, {
      userId: request.user.id,
      username: request.user.username,
      syncedAt,
      count: incomingCards.length,
      flashcards: incomingCards
    });

    response.json({
      ok: true,
      count: incomingCards.length,
      created,
      updated,
      syncedAt
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/translate", (request, response, next) => {
  try {
    const word = normalizeRequiredString(request.body?.word, "word");
    const translation = createMockTranslation(word);

    response.json({
      ok: true,
      word,
      meaning: translation.meaning,
      wordform: translation.wordform,
      provider: "local-mock-ai"
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/export", requireAuth, async (request, response, next) => {
  try {
    const providedFlashcards = Array.isArray(request.body?.flashcards)
      ? validateFlashcards(request.body.flashcards, { allowEmptyMeaning: false })
      : null;
    const flashcards = providedFlashcards || await getUserFlashcards(request.user.id);
    const generatedAt = new Date();
    const fileName = `flashcards-${request.user.username}-${formatTimestamp(generatedAt)}.json`;
    const filePath = path.join(EXPORT_DIR, fileName);

    const exportPayload = {
      generatedAt: generatedAt.toISOString(),
      user: publicUser(request.user),
      count: flashcards.length,
      flashcards
    };

    await ensureStorageDirs();
    await writeJson(filePath, exportPayload);

    response.json({
      ok: true,
      fileName,
      downloadUrl: `/exports/${fileName}`
    });
  } catch (error) {
    next(error);
  }
});

app.use((request, response) => {
  response.status(404).json({
    ok: false,
    error: `No route for ${request.method} ${request.path}`
  });
});

app.use((error, _request, response, _next) => {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;

  response.status(statusCode).json({
    ok: false,
    error: error.message || "Internal server error"
  });
});

app.listen(PORT, async () => {
  await bootstrapLocalData();
  console.log(`Flashcard local API running at http://localhost:${PORT}`);
  console.log("Sample accounts: student/password123 and teacher/password123");
  console.log(`Study app: http://localhost:${PORT}/study`);
});

async function bootstrapLocalData() {
  await ensureStorageDirs();

  const users = await readJson(USERS_PATH, []);
  let usersChanged = false;

  for (const sampleUser of SAMPLE_USERS) {
    if (!users.some((user) => user.username.toLowerCase() === sampleUser.username.toLowerCase())) {
      users.push({
        id: sampleUser.id,
        username: sampleUser.username,
        passwordHash: await bcrypt.hash(sampleUser.password, 10),
        createdAt: new Date().toISOString()
      });
      usersChanged = true;
    }
  }

  if (usersChanged) {
    await writeJson(USERS_PATH, users);
  }

  const flashcards = await readJson(FLASHCARDS_PATH, []);
  let cardsChanged = false;

  for (const sampleCard of SAMPLE_FLASHCARDS) {
    const exists = flashcards.some((card) => (
      card.userId === sampleCard.userId &&
      card.word.toLowerCase() === sampleCard.word.toLowerCase()
    ));

    if (!exists) {
      const now = new Date().toISOString();
      flashcards.push({
        id: randomUUID(),
        ...sampleCard,
        createdAt: now,
        updatedAt: now,
        syncedAt: now,
        sourceUrl: "",
        sourceTitle: "Seed data"
      });
      cardsChanged = true;
    }
  }

  if (cardsChanged) {
    await writeJson(FLASHCARDS_PATH, flashcards);
  }
}

async function ensureStorageDirs() {
  await Promise.all([
    mkdir(DATA_DIR, { recursive: true }),
    mkdir(EXPORT_DIR, { recursive: true })
  ]);
}

async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJson(filePath, fallback);
      return fallback;
    }

    throw error;
  }
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function getUserFlashcards(userId) {
  const flashcards = await readJson(FLASHCARDS_PATH, []);
  return flashcards
    .filter((card) => card.userId === userId)
    .map(stripInternalFields)
    .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
}

async function requireAuth(request, _response, next) {
  try {
    const authHeader = request.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      throw httpError(401, "Authentication required");
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const users = await readJson(USERS_PATH, []);
    const user = users.find((candidate) => candidate.id === payload.sub);

    if (!user) {
      throw httpError(401, "User no longer exists");
    }

    request.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : httpError(401, "Invalid or expired token"));
  }
}

function createAuthPayload(user) {
  return {
    ok: true,
    token: jwt.sign(
      {
        sub: user.id,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    ),
    user: publicUser(user)
  };
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username
  };
}

function validateFlashcards(value, options = {}) {
  if (!Array.isArray(value)) {
    throw httpError(400, "flashcards must be an array");
  }

  return value.map((card, index) => normalizeFlashcard(card, index, options));
}

function normalizeFlashcard(card, index, options = {}) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw httpError(400, `flashcards[${index}] must be an object`);
  }

  const meaning = options.allowEmptyMeaning
    ? normalizeOptionalString(card.meaning)
    : normalizeRequiredString(card.meaning, `flashcards[${index}].meaning`);

  return {
    id: normalizeOptionalString(card.id),
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

function stripInternalFields(card) {
  const {
    userId: _userId,
    ...publicCard
  } = card;

  return publicCard;
}

function normalizeUsername(value) {
  const username = normalizeRequiredString(value, "username").toLowerCase();

  if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
    throw httpError(400, "Username must be 3-32 characters using letters, numbers, dot, dash, or underscore");
  }

  return username;
}

function normalizePassword(value) {
  const password = normalizeRequiredString(value, "password");

  if (password.length < 6) {
    throw httpError(400, "Password must be at least 6 characters");
  }

  return password;
}

function normalizeRequiredString(value, fieldName) {
  const normalized = normalizeOptionalString(value);

  if (!normalized) {
    throw httpError(400, `${fieldName} is required`);
  }

  return normalized;
}

function normalizeOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function createMockTranslation(word) {
  const dictionary = new Map([
    ["resilient", { meaning: "Able to recover quickly from difficulty.", wordform: "adjective" }],
    ["meticulous", { meaning: "Very careful and attentive to detail.", wordform: "adjective" }],
    ["innovate", { meaning: "To introduce a new idea, method, or product.", wordform: "verb" }],
    ["clarity", { meaning: "The quality of being clear and easy to understand.", wordform: "noun" }]
  ]);

  const key = word.toLowerCase();

  if (dictionary.has(key)) {
    return dictionary.get(key);
  }

  return {
    meaning: `Simulated AI meaning for "${word}". Replace this with AWS Translate, Bedrock, or another provider in production.`,
    wordform: "unknown"
  };
}

function formatTimestamp(date) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}
