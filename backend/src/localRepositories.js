import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sampleFlashcards, sampleUsers } from "./sampleData.js";
import { normalizeCategoryList } from "./validation.js";

export function createLocalRepositories(config) {
  const usersPath = path.join(config.paths.dataDir, "users.json");
  const flashcardsPath = path.join(config.paths.dataDir, "flashcards.json");
  const cloudStorePath = path.join(config.paths.dataDir, "cloud-store.json");

  return {
    async bootstrap() {
      await mkdir(config.paths.dataDir, { recursive: true });
      await mkdir(config.paths.exportDir, { recursive: true });

      const users = await readJson(usersPath, []);
      let usersChanged = false;

      for (const sampleUser of sampleUsers) {
        const existingIndex = users.findIndex((user) => user.username.toLowerCase() === sampleUser.username.toLowerCase());

        if (existingIndex === -1) {
          users.push({
            userId: sampleUser.userId,
            id: sampleUser.userId,
            username: sampleUser.username,
            passwordHash: await bcrypt.hash(sampleUser.password, 10),
            role: sampleUser.role,
            categories: sampleUser.categories,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          usersChanged = true;
        } else {
          const categories = normalizeCategoryList([
            ...(users[existingIndex].categories || []),
            ...sampleUser.categories
          ]);

          if (categories.length !== (users[existingIndex].categories || []).length) {
            users[existingIndex].categories = categories;
            users[existingIndex].updatedAt = new Date().toISOString();
            usersChanged = true;
          }
        }
      }

      if (usersChanged) {
        await writeJson(usersPath, users);
      }

      const flashcards = await readJson(flashcardsPath, []);
      let cardsChanged = false;

      for (const sampleCard of sampleFlashcards) {
        const exists = flashcards.some((card) => (
          card.userId === sampleCard.userId &&
          card.word.toLowerCase() === sampleCard.word.toLowerCase()
        ));

    if (!exists) {
      const now = new Date().toISOString();
      const cardId = randomUUID();
      flashcards.push({
        id: cardId,
        cardId,
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
        await writeJson(flashcardsPath, flashcards);
      }
    },

    users: {
      async findByUsername(username) {
        const users = await readJson(usersPath, []);
        return users.find((user) => user.username.toLowerCase() === username.toLowerCase()) || null;
      },

      async findByUserId(userId) {
        const users = await readJson(usersPath, []);
        return users.find((user) => getUserId(user) === userId) || null;
      },

      async create(user) {
        const users = await readJson(usersPath, []);
        const now = new Date().toISOString();
        const created = {
          ...user,
          id: user.userId,
          role: user.role || "user",
          categories: user.categories || [],
          createdAt: user.createdAt || now,
          updatedAt: user.updatedAt || now
        };

        users.push(created);
        await writeJson(usersPath, users);
        return created;
      }
    },

    flashcards: {
      async listByUser(userId) {
        const flashcards = await readJson(flashcardsPath, []);
        return flashcards
          .filter((card) => card.userId === userId)
          .map(publicCard)
          .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
      },

      async create(userId, flashcard) {
        const flashcards = await readJson(flashcardsPath, []);
        const now = new Date().toISOString();
        const cardId = flashcard.cardId || flashcard.id || randomUUID();
        const created = {
          ...flashcard,
          id: cardId,
          cardId,
          userId,
          createdAt: flashcard.createdAt || now,
          updatedAt: now,
          syncedAt: flashcard.syncedAt || now
        };

        flashcards.unshift(created);
        await writeJson(flashcardsPath, flashcards);
        return publicCard(created);
      },

      async update(userId, cardId, updates) {
        const flashcards = await readJson(flashcardsPath, []);
        const index = flashcards.findIndex((card) => getCardId(card) === cardId && card.userId === userId);

        if (index === -1) {
          return null;
        }

        const updated = {
          ...flashcards[index],
          ...updates,
          id: getCardId(flashcards[index]),
          cardId: getCardId(flashcards[index]),
          userId,
          createdAt: flashcards[index].createdAt,
          updatedAt: new Date().toISOString()
        };

        flashcards[index] = updated;
        await writeJson(flashcardsPath, flashcards);
        return publicCard(updated);
      },

      async delete(userId, cardId) {
        const flashcards = await readJson(flashcardsPath, []);
        const nextFlashcards = flashcards.filter((card) => !(getCardId(card) === cardId && card.userId === userId));

        if (nextFlashcards.length === flashcards.length) {
          return false;
        }

        await writeJson(flashcardsPath, nextFlashcards);
        return true;
      },

      async moveCategoryToUncategorized(userId, category) {
        const flashcards = await readJson(flashcardsPath, []);
        let updatedCards = 0;
        const now = new Date().toISOString();
        const nextFlashcards = flashcards.map((card) => {
          if (card.userId === userId && card.category?.toLowerCase() === category.toLowerCase()) {
            updatedCards += 1;
            return {
              ...card,
              category: "Uncategorized",
              updatedAt: now
            };
          }

          return card;
        });

        if (updatedCards > 0) {
          await writeJson(flashcardsPath, nextFlashcards);
        }

        return updatedCards;
      }
    },

    categories: {
      async list(userId) {
        const users = await readJson(usersPath, []);
        const user = users.find((candidate) => getUserId(candidate) === userId);
        const flashcards = await readJson(flashcardsPath, []);
        const cardCategories = flashcards
          .filter((card) => card.userId === userId)
          .map((card) => card.category)
          .filter(Boolean);
        return normalizeCategoryList([...(user?.categories || []), ...cardCategories]);
      },

      async add(userId, category) {
        const users = await readJson(usersPath, []);
        const userIndex = users.findIndex((user) => getUserId(user) === userId);

        if (userIndex === -1) {
          return null;
        }

        users[userIndex].categories = normalizeCategoryList([
          ...(users[userIndex].categories || []),
          category
        ]);
        users[userIndex].updatedAt = new Date().toISOString();
        await writeJson(usersPath, users);
        return this.list(userId);
      },

      async delete(userId, category) {
        const users = await readJson(usersPath, []);
        const userIndex = users.findIndex((user) => getUserId(user) === userId);

        if (userIndex !== -1) {
          users[userIndex].categories = normalizeCategoryList(users[userIndex].categories || [])
            .filter((item) => item.toLowerCase() !== category.toLowerCase());
          users[userIndex].updatedAt = new Date().toISOString();
          await writeJson(usersPath, users);
        }

        return this.list(userId);
      }
    },

    sync: {
      async mirrorLatest(payload) {
        await writeJson(cloudStorePath, payload);
      }
    }
  };
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

function getUserId(user) {
  return user.userId || user.id;
}

function getCardId(card) {
  return card.cardId || card.id;
}

function publicCard(card) {
  const {
    userId: _userId,
    ...rest
  } = card;
  const cardId = getCardId(card);

  return {
    ...rest,
    id: cardId,
    cardId
  };
}
