---
title: "Proposal"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Project Proposal — Serverless Chrome Flashcard Extension on AWS

### Overview

This project builds and documents an offline-first Chrome extension that helps
users capture vocabulary while browsing, synchronize flashcards to AWS, practise
them in a web application, and export their data securely. The implementation is
presented as a reproducible workshop covering the complete lifecycle from local
setup and deployment to verification and resource cleanup.

| Field | Value |
| --- | --- |
| Project | Chrome Flashcard Extension & Study Platform |
| Platform | Chrome Extension Manifest V3 and AWS |
| Region | `ap-southeast-1` (Singapore) |
| Core services | API Gateway HTTP API, Lambda, DynamoDB, S3, CloudWatch |
| Infrastructure as Code | AWS SAM / CloudFormation |
| Backend | Node.js 24.x, Express.js, `serverless-http` |
| Workshop outcome | Deploy, configure, test, export, and remove the solution |

## 1. Problem statement

Learners regularly encounter unfamiliar words while reading websites, technical
documentation, and online articles. Moving to a separate application to create a
flashcard interrupts the reading flow, while browser-only storage makes the
resulting vocabulary difficult to synchronize or recover.

The proposed solution connects the moment a learner finds a word with later
study. A user selects text on a page, opens a context-menu action, reviews the
card in an inline dialog, and saves it locally. After authentication, locally
created cards can be synchronized to AWS and reviewed through the Study Web App.

## 2. Project objectives

The project will:

1. Implement a Manifest V3 Chrome extension for capturing and editing
   vocabulary directly on a web page.
2. Preserve flashcards offline in `chrome.storage.local`.
3. Provide JWT-authenticated synchronization through `POST /api/sync`.
4. Deploy an Express.js backend to AWS Lambda behind API Gateway HTTP API.
5. Store users, flashcards, and categories in Amazon DynamoDB.
6. Provide a Study Web App with category-based retrieval and active-recall
   controls (`Again`, `Hard`, `Good`, and `Easy`).
7. Export a user's flashcards as JSON through a 15-minute Amazon S3 pre-signed
   URL while keeping the export bucket private.
8. Verify the deployed system and remove all workshop resources safely.

## 3. Scope

### Included

- Local environment and dependency preparation.
- Repository and component overview.
- AWS SAM build and CloudFormation deployment.
- API Gateway, Lambda, DynamoDB, private S3 export storage, and CloudWatch logs.
- Chrome extension configuration, authentication, offline storage, and batch
  synchronization.
- Study Web App access and flashcard practice.
- Secure JSON export and direct-object access verification.
- CloudFormation teardown and post-cleanup auditing.

### Not included

- Realtime multiplayer and global leaderboards.
- Amazon Cognito or third-party identity providers.
- Custom domains, CloudFront, and Chrome Web Store publication.
- Production-scale disaster recovery and multi-region deployment.

## 4. Proposed architecture

```text
+-----------------------+        HTTPS REST         +--------------------------+
| Chrome Extension MV3  |-------------------------->| API Gateway (HTTP API)   |
| + local persistence   |                           +------------+-------------+
+-----------------------+                                        |
                                                                 v
+-----------------------+                           +--------------------------+
| Study Web Application |-------------------------->| AWS Lambda               |
| static web client     |                           | Express + serverless-http|
+-----------------------+                           +------------+-------------+
                                                                 |
                                       +-------------------------+------------------+
                                       |                                            |
                                       v                                            v
                            +--------------------+                       +--------------------+
                            | Amazon DynamoDB    |                       | Amazon S3         |
                            | Users / Cards /    |                       | private JSON export|
                            | Categories         |                       | pre-signed GET URL |
                            +--------------------+                       +--------------------+
```

### Component responsibilities

| Component | Responsibility |
| --- | --- |
| Chrome Extension | Capture selected text, edit card details, store cards locally, authenticate, and start synchronization |
| API Gateway HTTP API | Provide the public HTTPS endpoint, CORS handling, and proxy routing to Lambda |
| AWS Lambda | Run the Express backend, verify JWTs, process API requests, and coordinate persistence and export |
| DynamoDB | Persist users, flashcards, and categories using user-scoped keys |
| Study Web App | Retrieve authenticated flashcards and provide active-recall study sessions |
| Private S3 bucket | Store generated JSON exports and serve them only through temporary signed URLs |
| CloudWatch | Record Lambda execution logs and operational metrics used during verification |

## 5. Workshop workflow

The proposal maps directly to the workshop:

| Workshop section | Planned activity | Expected result |
| --- | --- | --- |
| 5.1 Architecture overview | Review components and end-to-end data flow | Participants understand how the extension, web app, and AWS services interact |
| 5.2 Prerequisites | Install required tools, inspect the repository, and run the backend locally | Local health endpoint is available |
| 5.3 Backend deployment | Build with `sam build`, deploy with `sam deploy --guided`, and test `/api/health` | The serverless API responds with `{"ok":true,"service":"flashcard-backend"}` |
| 5.4 Extension setup | Configure the API URL, load the unpacked extension, authenticate, capture cards, and sync | Local cards are stored and synchronized to DynamoDB |
| 5.5 Study and export | Study synchronized cards and request a JSON export | The signed URL downloads the export; the raw S3 object URL returns `403 Forbidden` |
| 5.6 Cleanup | Empty required S3 objects, delete the stack, and audit remaining resources | Workshop-created cloud resources are removed |

## 6. Data flow

1. The user selects a word and invokes the extension context-menu action.
2. `contentScript.js` displays an inline editor and saves the flashcard to
   `chrome.storage.local`.
3. The popup authenticates the user and sends unsynchronized cards to
   `POST /api/sync`.
4. API Gateway forwards the request to Lambda; the backend validates the JWT and
   writes user-scoped records to DynamoDB.
5. The Study Web App retrieves the user's cards through authenticated REST calls.
6. An export request creates a JSON object in the private S3 bucket and returns a
   pre-signed GET URL valid for 900 seconds.

## 7. Completion criteria

The project is complete when a workshop participant can:

- Run the backend locally and confirm the health endpoint.
- Deploy the SAM stack in `ap-southeast-1`.
- Load and configure the Manifest V3 extension.
- Capture a flashcard offline and synchronize it after login.
- Retrieve and practise synchronized cards in the Study Web App.
- Download a JSON export through a pre-signed URL and confirm that direct public
  access is denied.
- Delete the stack and verify that its DynamoDB tables and CloudWatch log group
  no longer remain.

## 8. Expected result

The final deliverable is a working, documented serverless flashcard platform and
a six-part workshop that demonstrates its architecture, setup, deployment,
client synchronization, study and export features, and responsible teardown.
