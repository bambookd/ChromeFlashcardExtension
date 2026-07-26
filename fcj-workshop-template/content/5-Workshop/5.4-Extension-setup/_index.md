---
title: "Chrome Extension Architecture & Client-Side Sync"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

#### Client Component System Architecture

This section documents the Manifest V3 implementation of the **Chrome Flashcard Extension**, its local storage architecture, offline resilience mechanisms, and cloud synchronization flow.

#### Manifest V3 Architecture & Component Specification

The extension architecture leverages modern Chrome Extension Manifest V3 specifications to maximize browser security and resource efficiency:

```text
+-------------------------------------------------------------------------+
|                         Chrome Extension (MV3)                          |
|                                                                         |
|  +---------------------+   Messaging    +----------------------------+  |
|  | Context Menu Event  |--------------->| Background Service Worker  |  |
|  | (Browser Selection) |                | (background.js)            |  |
|  +---------------------+                +----------------------------+  |
|             |                                        |                  |
|             v                                        v                  |
|  +---------------------+   Local Storage   +----------------------------+  |
|  | Injected DOM Modal  |------------------>| chrome.storage.local       |  |
|  | (contentScript.js)  |                   | (Offline Persistence)      |  |
|  +---------------------+                   +----------------------------+  |
|                                                      ^                  |
|                                                      | Auth & Sync      |
|  +---------------------+                             v                  |
|  | Extension Popup UI  |------------------------------------------------+  |
|  | (popup.js / html)   |                                                |
+--+---------------------+------------------------------------------------+
                                                       |
                                                       v HTTPS REST API
                                        +------------------------------+
                                        | AWS API Gateway / Lambda     |
                                        +------------------------------+
```

#### Core Components & File Responsibilities

1. **`manifest.json`**: Declares Manifest V3 permissions (`storage`, `contextMenus`, `activeTab`), background service worker scripts, and host permissions.
2. **`background.js` (Service Worker)**: Registers context menu items (`Save "..." as flashcard`), manages message passing between injected content scripts, and routes translation queries to AWS API Gateway to bypass client-side CORS constraints.
3. **`contentScript.js` (DOM Controller)**: Injects an interactive floating edit dialog into active web pages when triggered from the context menu, allowing users to modify definitions, word forms, and categories before persisting.
4. **`popup.html / popup.js`**: Provides the extension popup interface for user registration, authentication (JWT token storage), local card management, batch synchronization (`POST /api/sync`), and data export requests.
5. **`extension-config.js`**: Defines environment mapping configurations:
   ```javascript
   window.EXTENSION_CONFIG = {
     API_BASE_URL: "https://<api-id>.execute-api.us-east-1.amazonaws.com",
     STUDY_APP_URL: "https://<api-id>.execute-api.us-east-1.amazonaws.com/study"
   };
   ```

#### Offline Storage & Data Synchronization Flow

1. **Local Storage Schema**: Flashcards created offline are formatted as JSON items and appended directly to `chrome.storage.local` under the `flashcards` array key:
   ```json
   {
     "id": "card-1722000000000",
     "word": "serverless",
     "meaning": "không cần máy chủ",
     "wordForm": "adjective",
     "category": "AWS",
     "synced": false,
     "createdAt": 1722000000000
   }
   ```

2. **Cloud Batch Synchronization Procedure**:
   - The user authenticates via the Popup UI (`POST /api/auth/login`), storing the returned JWT token securely in local extension state.
   - Upon clicking **Sync Now**, `popup.js` extracts unsynced local records and posts a JSON batch request payload to `POST /api/sync`.
   - AWS Lambda processes the payload, executes idempotent conditional writes (`PutItem`) into the DynamoDB `FlashcardsTable`, and returns confirmation metadata.
   - The client marks records as `synced: true`, ensuring data consistency between client-side local storage and the cloud database.
