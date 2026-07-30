---
title: "Chrome Extension Architecture & Client-Side Sync"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

#### Client Component System Architecture

This section documents the Manifest V3 implementation of the **Chrome Flashcard Extension**, its local storage architecture, offline resilience mechanisms, and cloud synchronization flow with domain `axiza.net`.

#### Manifest V3 Architecture & Component Specification

The extension architecture leverages modern Chrome Extension Manifest V3 specifications to maximize browser security and resource efficiency:

```text
+----------------------------------------------------------------------------+
|                         Chrome Extension (MV3)                             |
|                                                                            |
|  +---------------------+   Messaging    +----------------------------+     |
|  | Context Menu Event  |--------------->| Background Service Worker  |     |
|  | (Browser Selection) |                | (background.js)            |     |
|  +---------------------+                +----------------------------+     |
|             |                                        |                     |
|             v                                        v                     |
|  +---------------------+   Local Storage   +----------------------------+  |
|  | Injected DOM Modal  |------------------>| chrome.storage.local       |  |
|  | (contentScript.js)  |                   | (Offline Persistence Cache)|  |
|  +---------------------+                   +----------------------------+  |
|                                                      ^                     |
|                                                      | Read/Write State    |
|  +---------------------+                             | & Auth Token        |
|  | Extension Popup UI  |-----------------------------+                     |
|  | (popup.js / html)   |                                                   |
|  +----------+----------+                                                   |
+-------------|--------------------------------------------------------------+
              |
              v HTTPS REST API (https://api.axiza.net) [Login / Sync / Export]
+----------------------------------------------------------------------------+
|                       Amazon Route 53 / API Gateway                        |
+----------------------------------------------------------------------------+
```

#### Core Components & File Responsibilities

1. **`manifest.json`**: Declares Manifest V3 permissions (`storage`, `contextMenus`, `activeTab`), background service worker scripts, and host permissions.
2. **`background.js` (Service Worker)**: Registers context menu items (`Save "..." as flashcard`) and manages message passing between injected content scripts and extension components.
3. **`contentScript.js` (DOM Controller)**: Injects an interactive floating edit dialog into active web pages when triggered from the context menu, allowing users to modify definitions, word forms, and categories before persisting.
4. **`popup.html / popup.js`**: Provides the extension popup interface for user registration, authentication (JWT token storage), local card management, batch synchronization (`POST /api/sync`), and data export requests.
5. **`extension-config.js`**: Defines environment mapping configurations using `globalThis.FLASHCARD_CONFIG`:
   ```javascript
   globalThis.FLASHCARD_CONFIG = {
     API_BASE_URL: "https://api.axiza.net",
     STUDY_URL: "https://www.axiza.net/study/"
   };
   ```

#### Offline Storage & Data Synchronization Flow

1. **Local Storage Schema**: Flashcards created offline are formatted as JSON items and appended directly to `chrome.storage.local` under the `flashcards` array key:
   ```json
   {
     "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
     "word": "serverless",
     "meaning": "không cần máy chủ",
     "wordform": "adjective",
     "category": "AWS",
     "syncedAt": null,
     "createdAt": "2026-07-26T21:30:00.000Z"
   }
   ```

2. **Cloud Batch Synchronization Procedure**:
   - The user authenticates via the Popup UI (`POST https://api.axiza.net/api/auth/login`), storing the returned JWT token securely in local extension state.
   - Upon clicking **Sync Now**, `popup.js` extracts unsynced local records (`syncedAt === null`) and posts a JSON batch request payload to `POST /api/sync` at `https://api.axiza.net`.
   - AWS Lambda processes the payload, executes idempotent conditional writes (`PutItem`) into the DynamoDB `FlashcardsTable`, and returns confirmation metadata.
   - The client marks records with an ISO timestamp string `syncedAt: "2026-07-26T21:30:05.000Z"`, ensuring data consistency between client-side local storage and the cloud database.
