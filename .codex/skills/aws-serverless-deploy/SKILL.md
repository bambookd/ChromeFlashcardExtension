---
name: aws-serverless-deploy
description: Use when migrating the ChromeFlashcardExtension project from local Express and JSON file storage to AWS serverless using Lambda, API Gateway HTTP API, DynamoDB, Amazon Translate, S3 Static Website Hosting, and private S3 export URLs. Also use when updating Chrome Extension API configuration, AWS deployment documentation, or infrastructure for this project.
---

# AWS Serverless Deploy

Act as a practical AWS serverless engineer and Chrome Extension developer.

## Project Context

This project is `ChromeFlashcardExtension`.

It contains:

* A Chrome Extension for highlighting a word on any webpage and adding it to flashcards.
* A popup form for editing word, meaning, wordform, and category.
* A local Express backend.
* JSON-file-based local storage.
* A study web page.
* Planned AWS migration.

Target AWS architecture:

```text
Chrome Extension
-> API Gateway HTTP API
-> Lambda Express backend
-> DynamoDB

Study Web / Landing Page
-> S3 Static Website Hosting
-> API Gateway HTTP API
-> Lambda

Lambda
-> Amazon Translate

Lambda
-> private S3 export bucket
-> pre-signed export download URL
```

## Core Rules

* Inspect the existing repository before changing code.
* Identify current backend routes and frontend API calls first.
* Preserve current extension UX and study web behavior.
* Do not rewrite the project from scratch.
* Do not invent unrelated features.
* Do not hard-code AWS credentials.
* Do not store secrets in the repository.
* Use environment variables for AWS region, table names, bucket names, JWT secret, API base URL, and allowed origins.
* Keep the code simple enough for a student internship/demo project.
* Prefer small, safe changes over large rewrites.
* Preserve route names where possible.
* If a route cannot be migrated cleanly, leave a clear TODO and explain it in `AWS_DEPLOYMENT.md`.

## Required Environment Variables

Use these names where applicable:

```text
AWS_REGION
USERS_TABLE
FLASHCARDS_TABLE
CATEGORIES_TABLE
JWT_SECRET
EXPORT_BUCKET
ALLOWED_ORIGINS
API_BASE_URL
```

`ALLOWED_ORIGINS` should support comma-separated values.

Example:

```text
http://localhost:3000,http://localhost:5173,chrome-extension://EXTENSION_ID,http://your-s3-website-url
```

## Backend Refactor Rules

The backend should run both locally and on AWS Lambda.

Separate the Express app from local startup:

```text
backend/
├── app.js or app.mjs
├── server.js
├── lambda.js or lambda.mjs
├── src/
│   ├── db.js
│   ├── usersRepo.js
│   ├── flashcardsRepo.js
│   ├── categoriesRepo.js
│   ├── auth.js
│   ├── translate.js
│   └── export.js
```

Expected behavior:

* `app.js` exports the Express app.
* `server.js` runs `app.listen(...)` for local development only.
* `lambda.js` exports the Lambda handler using `serverless-http`.
* Lambda handler must be importable without starting a local server.

Use AWS SDK v3:

* `@aws-sdk/client-dynamodb`
* `@aws-sdk/lib-dynamodb`
* `@aws-sdk/client-translate`
* `@aws-sdk/client-s3`
* `@aws-sdk/s3-request-presigner`, if export links are used

Use `serverless-http` for Express on Lambda.

## DynamoDB Data Model

Use three tables.

### Users

Partition key:

```text
username
```

Attributes:

```text
userId
username
passwordHash
role
createdAt
updatedAt
```

Rules:

* Generate `userId` during registration.
* Use `username` for login.
* Use `userId` as the owner ID for flashcards and categories.
* Do not store plain-text passwords.

JWT should contain:

```json
{
  "sub": "userId",
  "username": "student",
  "role": "user"
}
```

### Flashcards

Partition key:

```text
userId
```

Sort key:

```text
cardId
```

Attributes:

```text
userId
cardId
word
meaning
wordform
category
sourceUrl
sourceTitle
createdAt
updatedAt
```

Rules:

* Query flashcards by current user ID.
* Do not scan the full table for normal user flashcard loading.
* Use ISO timestamps for `createdAt` and `updatedAt`.

### Categories

Partition key:

```text
userId
```

Sort key:

```text
categoryName
```

Attributes:

```text
userId
categoryName
createdAt
updatedAt
```

Rules:

* Categories are user-scoped.
* Support listing, creating, and deleting user categories.
* Deleting a category should move affected flashcards to `"Uncategorized"` instead of deleting the flashcards.

## Auth Rules

* Keep existing login/register UX if present.
* Use bcrypt or an existing safe password hashing library.
* Use JWT for authenticated API requests.
* Store JWT secret in `JWT_SECRET`.
* Protected routes must identify the current user from JWT `sub`.
* Include `role` in user records and JWT for future compatibility. Do not add role-specific UI unless the current project already has it.

## Translate Rules

* Replace local/mock translate behavior with Amazon Translate.
* Endpoint:
  `POST /api/translate`
* This endpoint must require JWT auth in AWS mode.
* During migration, accept both the current UI payload `{ "word": "..." }` and the target payload `{ "text": "..." }`.
* Limit input length to avoid accidental high cost.
* Amazon Translate only translates text. Do not expect it to provide reliable wordform detection.
* Return a UI-compatible response:

```json
{
  "ok": true,
  "word": "resilient",
  "meaning": "translated text",
  "wordform": "unknown",
  "provider": "amazon-translate"
}
```

## Export Rules

If export currently writes local files:

* Replace local export folder with private S3 object storage.
* Generate JSON in Lambda.
* Upload export JSON to private S3 bucket.
* Return a pre-signed download URL.
* Do not make the export bucket public.
* Keep export files user-scoped.

## Chrome Extension Rules

* Find all hard-coded `http://localhost:3000` references.
* Replace with configurable API base URL.
* Preserve highlight -> context menu -> add flashcard -> edit popup -> save flow.
* Update `manifest.json` host permissions carefully.
* Add API Gateway endpoint permission.
* Keep permissions needed for webpage highlighting/context menu behavior.
* Do not break Manifest V3 behavior.

## Study Web / Landing Page Rules

* The study page should work as a static frontend.
* It should not assume it is served from Express in production.
* Its API base URL should point to API Gateway.
* Static assets should use relative paths compatible with S3 Static Website Hosting.
* For demo, S3 Static Website Hosting is acceptable.
* For production, document that CloudFront in front of S3 is preferred for HTTPS/custom domain.

## CORS Rules

* Configure CORS using `ALLOWED_ORIGINS`.
* Support localhost during development.
* Support S3 static website URL.
* Support Chrome Extension origin:

```text
chrome-extension://<extension-id>
```

* Note that unpacked extension ID and published extension ID may be different.
* Do not use fully open CORS in final production mode unless clearly documented as demo-only.

## Deployment Documentation Rules

Create or update:

```text
AWS_DEPLOYMENT.md
```

Primary path:

* Manual AWS Console deployment.

Optional path:

* `infra/template.yaml` using AWS SAM or CloudFormation.

Manual deployment is required for learning/demo documentation. Add the optional template only when it can stay simple and aligned with the manual guide.

`AWS_DEPLOYMENT.md` should include:

* DynamoDB table creation steps.
* Provisioned capacity recommendation: 1 RCU / 1 WCU for demo.
* Lambda creation steps.
* Backend zip deployment steps.
* Lambda environment variables.
* Minimum IAM permissions.
* API Gateway HTTP API setup.
* CORS setup.
* Chrome Extension endpoint update.
* S3 Static Website Hosting setup.
* Full manual test checklist.

## Cost-Control Rules

* Keep DynamoDB provisioned capacity low for demo.
* Avoid unnecessary AWS calls.
* Limit Translate input length.
* Document services that may create cost.
* Do not add paid AWS services unless necessary.

## Implementation Phases

Prefer this order:

### Phase 1

* Inspect repository.
* Identify current routes and frontend API calls.
* Refactor Express app for local + Lambda.
* Add Lambda handler.
* Add DynamoDB repositories.
* Migrate users, flashcards, and categories to DynamoDB.
* Update extension/study API base URL configuration.

### Phase 2

* Add Amazon Translate integration.
* Add private S3 export with pre-signed URLs.
* Add `AWS_DEPLOYMENT.md`.
* Add optional `infra/template.yaml`.
* Add final test checklist.

## Final Response Expected From Codex

After making changes, summarize:

* Files changed.
* Features migrated.
* Environment variables required.
* How to run locally.
* How to deploy to AWS.
* Any remaining TODOs or limitations.
