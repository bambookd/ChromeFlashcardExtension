import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");
const dataStore = (process.env.DATA_STORE || "local").toLowerCase();

export const config = {
  port: Number(process.env.PORT || 3000),
  awsRegion: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-southeast-1",
  dataStore,
  jwtSecret: process.env.JWT_SECRET || "local-dev-secret-change-before-production",
  usersTable: process.env.USERS_TABLE || "FlashcardUsers",
  flashcardsTable: process.env.FLASHCARDS_TABLE || "FlashcardCards",
  categoriesTable: process.env.CATEGORIES_TABLE || "FlashcardCategories",
  exportBucket: process.env.EXPORT_BUCKET || "",
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  allowAllOrigins: process.env.CORS_ALLOW_ALL === "true" || (dataStore === "local" && !process.env.ALLOWED_ORIGINS),
  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
  serveStudyStatic: process.env.SERVE_STUDY_STATIC !== "false",
  useAmazonTranslate: process.env.USE_AMAZON_TRANSLATE === "true" || dataStore === "dynamodb",
  requireTranslateAuth: process.env.REQUIRE_TRANSLATE_AUTH === "true" || dataStore === "dynamodb",
  translateMaxLength: Number(process.env.TRANSLATE_MAX_LENGTH || 120),
  paths: {
    dataDir: path.join(backendRoot, "data"),
    exportDir: path.join(backendRoot, "exports"),
    studyDir: path.join(backendRoot, "public", "study"),
    gameDir: path.join(backendRoot, "public", "game")
  }
};

function parseAllowedOrigins(value) {
  if (!value) {
    return [
      "http://localhost:3000",
      "http://localhost:5173"
    ];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
