import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(backendRoot, "dist", "static-site");
const apiBaseUrl = requiredUrl("API_BASE_URL");
const siteBaseUrl = requiredUrl("SITE_BASE_URL");
const studyUrl = optionalUrl("STUDY_URL") || `${siteBaseUrl}/study/`;
const gameUrl = optionalUrl("GAME_URL") || `${siteBaseUrl}/game/`;

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

await Promise.all([
  copySurface("study"),
  copySurface("game")
]);

await writeFile(
  path.join(outputRoot, "study", "config.js"),
  `window.FLASHCARD_CONFIG = ${JSON.stringify({
    API_BASE_URL: apiBaseUrl,
    GAME_URL: gameUrl
  }, null, 2)};\n`,
  "utf8"
);

await writeFile(
  path.join(outputRoot, "game", "config.js"),
  `window.FLASHCARD_CONFIG = ${JSON.stringify({
    API_BASE_URL: apiBaseUrl,
    STUDY_URL: studyUrl,
    REALTIME_URL: ""
  }, null, 2)};\n`,
  "utf8"
);

console.log(`[static] Prepared ${path.relative(backendRoot, outputRoot)}`);
console.log("[static] Realtime URL is empty because the current AWS MVP does not deploy WebSockets.");

async function copySurface(name) {
  await cp(
    path.join(backendRoot, "public", name),
    path.join(outputRoot, name),
    { recursive: true }
  );
}

function requiredUrl(name) {
  const value = String(process.env[name] || "").replace(/\/+$/, "");

  if (!/^https?:\/\/[^/]+/i.test(value)) {
    throw new Error(`${name} must be an absolute http(s) URL.`);
  }

  return value;
}

function optionalUrl(name) {
  const value = String(process.env[name] || "").trim();

  if (!value) {
    return "";
  }

  if (!/^https?:\/\/[^/]+/i.test(value)) {
    throw new Error(`${name} must be an absolute http(s) URL when provided.`);
  }

  return value;
}
