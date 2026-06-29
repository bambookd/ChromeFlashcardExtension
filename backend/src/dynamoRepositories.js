import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { normalizeCategoryList } from "./validation.js";

export function createDynamoRepositories(config) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: config.awsRegion
  }));

  return {
    async bootstrap() {
      // DynamoDB tables are created manually or by infra/template.yaml.
    },

    users: {
      async findByUsername(username) {
        const response = await client.send(new GetCommand({
          TableName: config.usersTable,
          Key: { username }
        }));

        return response.Item || null;
      },

      async findByUserId(userId) {
        // Users table is keyed by username per project requirement.
        // JWT contains username, so normal auth should not need this path.
        throw new Error(`findByUserId is not supported for DynamoDB Users table keyed by username: ${userId}`);
      },

      async create(user) {
        await client.send(new PutCommand({
          TableName: config.usersTable,
          Item: user,
          ConditionExpression: "attribute_not_exists(username)"
        }));

        return user;
      }
    },

    flashcards: {
      async listByUser(userId) {
        const response = await client.send(new QueryCommand({
          TableName: config.flashcardsTable,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId
          }
        }));

        return (response.Items || [])
          .map(publicCard)
          .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""));
      },

      async create(userId, flashcard) {
        const item = {
          ...flashcard,
          userId,
          cardId: flashcard.cardId || flashcard.id
        };

        await client.send(new PutCommand({
          TableName: config.flashcardsTable,
          Item: item
        }));

        return publicCard(item);
      },

      async update(userId, cardId, updates) {
        const existing = await client.send(new GetCommand({
          TableName: config.flashcardsTable,
          Key: { userId, cardId }
        }));

        if (!existing.Item) {
          return null;
        }

        const updated = {
          ...existing.Item,
          ...updates,
          userId,
          cardId,
          createdAt: existing.Item.createdAt,
          updatedAt: new Date().toISOString()
        };

        await client.send(new PutCommand({
          TableName: config.flashcardsTable,
          Item: updated
        }));

        return publicCard(updated);
      },

      async delete(userId, cardId) {
        const existing = await client.send(new GetCommand({
          TableName: config.flashcardsTable,
          Key: { userId, cardId }
        }));

        if (!existing.Item) {
          return false;
        }

        await client.send(new DeleteCommand({
          TableName: config.flashcardsTable,
          Key: { userId, cardId }
        }));

        return true;
      },

      async moveCategoryToUncategorized(userId, category) {
        const cards = await this.listByUser(userId);
        const matching = cards.filter((card) => card.category?.toLowerCase() === category.toLowerCase());

        for (const card of matching) {
          await client.send(new UpdateCommand({
            TableName: config.flashcardsTable,
            Key: {
              userId,
              cardId: card.cardId || card.id
            },
            UpdateExpression: "SET category = :category, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
              ":category": "Uncategorized",
              ":updatedAt": new Date().toISOString()
            }
          }));
        }

        return matching.length;
      }
    },

    categories: {
      async list(userId) {
        const response = await client.send(new QueryCommand({
          TableName: config.categoriesTable,
          KeyConditionExpression: "userId = :userId",
          ExpressionAttributeValues: {
            ":userId": userId
          }
        }));

        return normalizeCategoryList((response.Items || []).map((item) => item.categoryName));
      },

      async add(userId, category) {
        const now = new Date().toISOString();

        await client.send(new PutCommand({
          TableName: config.categoriesTable,
          Item: {
            userId,
            categoryName: category,
            createdAt: now,
            updatedAt: now
          }
        }));

        return this.list(userId);
      },

      async delete(userId, category) {
        await client.send(new DeleteCommand({
          TableName: config.categoriesTable,
          Key: {
            userId,
            categoryName: category
          }
        }));

        return this.list(userId);
      }
    },

    sync: {
      async mirrorLatest() {
        // Cloud mode stores durable data directly in DynamoDB.
      }
    }
  };
}

function publicCard(card) {
  return {
    ...card,
    id: card.cardId || card.id
  };
}
