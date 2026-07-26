---
title: "System Architecture & Design Overview"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

#### Executive Summary

This section details the system architecture, component breakdown, and data communication patterns of the **Chrome Flashcard Extension** serverless application on Amazon Web Services (AWS).

#### Architectural Topology

The system employs an offline-first design pattern at the client layer coupled with a microservices-inspired serverless topology on AWS:

```text
+-----------------------+        HTTPS REST         +--------------------------+
|  Chrome Extension     |-------------------------->|  API Gateway (HTTP API)  |
|  (Manifest V3)        |                           +--------------------------+
+-----------------------+                                        |
            | (Local Storage Fallback)                           v
+-----------------------+                           +--------------------------+
|  Study & Game Web     |-------------------------->|  AWS Lambda Function     |
|  (Static S3 Bucket)   |                           |  (Node.js 24.x Express)  |
+-----------------------+                           +--------------------------+
                                                                 |
                                       +-------------------------+-------------------------+
                                       |                         |                         |
                                       v                         v                         v
                            +--------------------+    +--------------------+    +--------------------+
                            |  Amazon DynamoDB   |    |  Amazon Translate  |    |  Amazon S3 Bucket  |
                            |  (Users, Cards,    |    |  (Auto Translation |    |  (Private Export   |
                            |   Categories)      |    |   + Comprehend)    |    |   Pre-signed URLs) |
                            +--------------------+    +--------------------+    +--------------------+
```

#### Detailed AWS Component Specifications

| Component | Architecture Role | Key Operational Specifications |
|---|---|---|
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Enforces HTTPS endpoints, manages CORS preflight authorization, and routes all requests via proxy integration (`/{proxy+}`) to Lambda. |
| **AWS Lambda** | Stateless Compute Layer | Executes an Express.js backend via `serverless-http` on the Node.js 24.x runtime, offering scale-to-zero operational efficiency. |
| **Amazon DynamoDB** | Persistent Storage Layer | Provisioned/On-demand NoSQL tables: `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), and `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon Translate** | Machine Translation Engine | Invoked programmatically by Lambda to provide contextual English-to-Vietnamese vocabulary translation. |
| **Amazon S3 (Private)** | Encrypted Document Store | Holds JSON data exports with restrictive access policies, accessible only via temporary 15-minute pre-signed GET URLs. |
| **Amazon S3 (Public)** | Web Asset Hosting | Delivers static HTML, CSS, JavaScript, and configuration files for the Study Web Application. |
| **Amazon CloudWatch** | Observability Platform | Captures execution logs, operational metrics, cold start timings, and system error rates. |

#### Component Data Flow Analysis

1. **Vocabulary Acquisition Phase**: The browser extension captures highlighted text via a context menu listener. The content script (`contentScript.js`) renders an inline modal and persists records locally to `chrome.storage.local`.
2. **Cloud Synchronization Phase**: Upon user authentication or explicit sync initiation, the extension transmits accumulated local records via `POST /api/sync` to API Gateway. Lambda verifies JWT credentials and executes batch operations against DynamoDB.
3. **Automated Translation Phase**: Translation queries routed from the extension background service worker trigger Lambda to invoke `Amazon Translate` (`@aws-sdk/client-translate`), returning translated payloads to the extension UI.
4. **Interactive Practice Phase**: The Study Web App loads user flashcards from DynamoDB via authenticated REST calls, managing local study queues and recall scores.
5. **Secure Export Phase**: Export requests trigger Lambda to assemble a structured JSON snapshot, write the file to the private S3 bucket, and return a signed, temporary download link.
