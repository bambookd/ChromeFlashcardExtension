import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAuthService, publicUser } from "./src/auth.js";
import { config } from "./src/config.js";
import { httpError } from "./src/errors.js";
import { createExportService } from "./src/exportService.js";
import { createRepositories } from "./src/repositories.js";
import { createTranslateService } from "./src/translateService.js";
import {
  normalizeCategory,
  normalizeFlashcard,
  normalizePassword,
  normalizeRequiredString,
  normalizeUsername,
  validateFlashcards
} from "./src/validation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const repositories = createRepositories(config);
const authService = createAuthService(config, repositories);
const translateService = createTranslateService(config);
const exportService = createExportService(config);

export const app = express();

app.use(cors({
  origin(origin, callback) {
    if (config.allowAllOrigins || !origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(httpError(403, "Origin is not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use("/exports", express.static(config.paths.exportDir, {
  extensions: ["json"],
  immutable: false,
  maxAge: 0
}));

if (config.serveStudyStatic) {
  app.use("/study", express.static(config.paths.studyDir));
  app.get("/", (_request, response) => {
    response.redirect("/study");
  });
}

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "flashcard-backend"
  });
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const username = normalizeUsername(request.body?.username);
    const password = normalizePassword(request.body?.password);
    response.status(201).json(await authService.register(username, password));
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const username = normalizeUsername(request.body?.username);
    const password = normalizePassword(request.body?.password);
    response.json(await authService.login(username, password));
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
    const flashcards = await repositories.flashcards.listByUser(request.user.userId);
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
    const now = new Date().toISOString();
    const normalized = normalizeFlashcard(request.body, 0, { allowEmptyMeaning: false });
    const cardId = normalized.cardId || normalized.id || randomUUID();
    const created = await repositories.flashcards.create(request.user.userId, {
      ...normalized,
      id: cardId,
      cardId,
      createdAt: normalized.createdAt || now,
      updatedAt: now,
      syncedAt: normalized.syncedAt || now
    });
    await repositories.categories.add(request.user.userId, created.category);

    response.status(201).json({
      ok: true,
      flashcard: created
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/flashcards/:id", requireAuth, async (request, response, next) => {
  try {
    const cardId = normalizeRequiredString(request.params.id, "flashcard id");
    const updates = normalizeFlashcard(request.body, 0, { allowEmptyMeaning: false });
    const updated = await repositories.flashcards.update(request.user.userId, cardId, updates);

    if (!updated) {
      throw httpError(404, "Flashcard not found");
    }

    await repositories.categories.add(request.user.userId, updated.category);
    response.json({
      ok: true,
      flashcard: updated
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/flashcards/:id", requireAuth, async (request, response, next) => {
  try {
    const cardId = normalizeRequiredString(request.params.id, "flashcard id");
    const deleted = await repositories.flashcards.delete(request.user.userId, cardId);

    if (!deleted) {
      throw httpError(404, "Flashcard not found");
    }

    response.json({
      ok: true,
      deletedId: cardId
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories", requireAuth, async (request, response, next) => {
  try {
    response.json({
      ok: true,
      categories: await repositories.categories.list(request.user.userId)
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/categories", requireAuth, async (request, response, next) => {
  try {
    const category = normalizeCategory(request.body?.category);
    const categories = await repositories.categories.add(request.user.userId, category);
    response.status(201).json({
      ok: true,
      category,
      categories
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/categories/:category", requireAuth, async (request, response, next) => {
  try {
    const category = normalizeCategory(request.params.category);

    if (category.toLowerCase() === "uncategorized") {
      throw httpError(400, "Uncategorized cannot be deleted");
    }

    const updatedCards = await repositories.flashcards.moveCategoryToUncategorized(request.user.userId, category);
    const categories = await repositories.categories.delete(request.user.userId, category);
    response.json({
      ok: true,
      deletedCategory: category,
      updatedCards,
      categories
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/study/random", requireAuth, async (request, response, next) => {
  try {
    const category = typeof request.query.category === "string" ? request.query.category.trim() : "";
    const flashcards = await repositories.flashcards.listByUser(request.user.userId);
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
    let created = 0;
    let updated = 0;

    for (const incomingCard of incomingCards) {
      const cardId = incomingCard.cardId || incomingCard.id || randomUUID();
      const existing = await repositories.flashcards.update(request.user.userId, cardId, {
        ...incomingCard,
        id: cardId,
        cardId,
        syncedAt,
        updatedAt: syncedAt
      });

      if (existing) {
        updated += 1;
      } else {
        await repositories.flashcards.create(request.user.userId, {
          ...incomingCard,
          id: cardId,
          cardId,
          createdAt: incomingCard.createdAt || syncedAt,
          updatedAt: syncedAt,
          syncedAt
        });
        created += 1;
      }
    }

    await repositories.categories.add(request.user.userId, "Uncategorized");
    for (const category of incomingCards.map((card) => card.category).filter(Boolean)) {
      await repositories.categories.add(request.user.userId, category);
    }
    await repositories.sync.mirrorLatest({
      userId: request.user.userId,
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

app.post("/api/translate", maybeRequireTranslateAuth, async (request, response, next) => {
  try {
    response.json(await translateService.translate(request.body));
  } catch (error) {
    next(error);
  }
});

app.post("/api/export", requireAuth, async (request, response, next) => {
  try {
    const providedFlashcards = Array.isArray(request.body?.flashcards)
      ? validateFlashcards(request.body.flashcards, { allowEmptyMeaning: false })
      : null;
    const flashcards = providedFlashcards || await repositories.flashcards.listByUser(request.user.userId);
    response.json(await exportService.exportFlashcards(request.user, flashcards));
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

async function requireAuth(request, _response, next) {
  try {
    request.user = await authService.authenticateToken(getBearerToken(request));
    next();
  } catch (error) {
    next(error);
  }
}

async function maybeRequireTranslateAuth(request, response, next) {
  if (!config.requireTranslateAuth) {
    next();
    return;
  }

  await requireAuth(request, response, next);
}

function getBearerToken(request) {
  const authHeader = request.get("authorization") || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
}

export async function bootstrap() {
  await repositories.bootstrap();
}
