# Flashcard Vocabulary Chrome Extension

Offline-first Chrome Extension for saving vocabulary flashcards locally with `chrome.storage.local`, plus a localhost API that simulates cloud sync, AI translation, and JSON export.

## Project Structure

```text
.
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
└── backend
    ├── package.json
    └── server.js
```

## Run The Local Backend

Prerequisite: Node.js 18 or newer.

```bash
cd backend
npm install
npm run dev
```

The API runs at:

```text
http://localhost:3000
```

The study web app runs at:

```text
http://localhost:3000/study
```

Sample local accounts are seeded automatically on server start:

```text
student / password123
teacher / password123
```

Available endpoints:

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/me
GET  /api/flashcards
POST /api/flashcards
PUT  /api/flashcards/:id
DELETE /api/flashcards/:id
GET  /api/categories
GET  /api/study/random
POST /api/sync        { "flashcards": [...] }
POST /api/translate   { "word": "resilient" }
POST /api/export      { "flashcards": [...] }
GET  /exports/:fileName
```

User data is written to `backend/data/users.json`. Cloud-synced flashcards are written to `backend/data/flashcards.json`. The latest sync payload is also mirrored to `backend/data/cloud-store.json` for debugging. Exported JSON files are written to `backend/exports/`.

## Load The Extension In Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this project folder: `ChromeFlashCardExtension`.
5. Pin and open the extension.

Keep the backend running before using `AI`, `Sync`, `Export JSON`, or the study web app. Saving and deleting flashcards in the extension works offline because the extension uses `chrome.storage.local`.

## Save From A Web Page

1. Open a normal web page such as a blog, article, or documentation page.
2. Select a word or short phrase.
3. Right-click the selected text.
4. Choose `Save "..." as flashcard`.
5. Edit the floating flashcard form near the selection.
6. Click `Save`.

Open the extension popup from the Chrome toolbar to review, delete, sync, or export saved flashcards.

Chrome does not allow content scripts on internal pages such as `chrome://extensions`, so the right-click editor will not appear there.

If the right-click option appears but the editor does not show, reload the extension from `chrome://extensions`, then refresh the web page and try again. Existing tabs may not have the latest content script immediately after a development reload.

## Study Web App

Open:

```text
http://localhost:3000/study
```

The study app logs in with the same local account system as the extension. It loads all cloud flashcards for the logged-in user into browser memory, then lets you:

- filter by category
- study in random or sequential order
- click the card to flip meaning
- add flashcards
- edit flashcards
- delete flashcards

The first version intentionally keeps repetition scheduling out of scope. The API and data model keep `updatedAt` and sync metadata so spaced repetition fields can be added later.

## Production Mapping

The current localhost API is shaped to map cleanly to AWS later:

- `POST /api/sync` can become API Gateway + Lambda + DynamoDB.
- `POST /api/translate` can call Amazon Translate, Bedrock, or another AI provider.
- `POST /api/export` can generate a JSON file and return a pre-signed S3 URL.
