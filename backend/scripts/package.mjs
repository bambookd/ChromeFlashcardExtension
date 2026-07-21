import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(backendRoot, "dist");
const stageDir = path.join(distDir, "lambda-staging");
const zipPath = path.join(distDir, "flashcard-backend.zip");
const include = ["lambda.js", "app.js", "package.json", "package-lock.json", "src", "node_modules"];

async function main() {
  if (!existsSync(path.join(backendRoot, "node_modules"))) {
    throw new Error("node_modules is missing. Run `npm ci --omit=dev` first.");
  }

  await rm(stageDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });

  for (const item of include) {
    const source = path.join(backendRoot, item);
    if (existsSync(source)) {
      await cp(source, path.join(stageDir, item), { recursive: true });
    }
  }

  createZip();
  await rm(stageDir, { recursive: true, force: true });
  console.log(`[package] Created ${path.relative(backendRoot, zipPath)}`);
}

function createZip() {
  if (process.platform !== "win32") {
    execFileSync("bash", ["-c", `cd '${stageDir}' && zip -r -q '${zipPath}' .`], {
      stdio: "inherit"
    });
    return;
  }

  const scriptPath = path.join(distDir, "_zip.ps1");
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "Add-Type -AssemblyName System.IO.Compression",
    "Add-Type -AssemblyName System.IO.Compression.FileSystem",
    `$stage = '${stageDir}'`,
    `$zip = '${zipPath}'`,
    "if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }",
    "$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')",
    "try {",
    "  foreach ($file in Get-ChildItem -LiteralPath $stage -Recurse -File) {",
    "    $entry = $file.FullName.Substring($stage.Length + 1).Replace('\\', '/')",
    "    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entry, [System.IO.Compression.CompressionLevel]::Optimal)",
    "  }",
    "} finally {",
    "  $archive.Dispose()",
    "}"
  ].join("\n");

  writeFileSync(scriptPath, script, "utf8");
  try {
    execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath], {
      stdio: "inherit"
    });
  } finally {
    rmSync(scriptPath, { force: true });
  }
}

main().catch((error) => {
  console.error(`[package] ${error.message}`);
  process.exitCode = 1;
});
