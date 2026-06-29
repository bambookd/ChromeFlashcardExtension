# AWS Deployment Guide

This guide deploys the ChromeFlashcardExtension backend to AWS Lambda + API Gateway + DynamoDB, hosts the study page from S3 Static Website Hosting, and keeps export files private in S3.

## Local Checks

From the repository root:

```bash
cd backend
npm install
npm run check
npm run dev
```

Open:

```text
http://localhost:3000/api/health
http://localhost:3000/study
```

Local development uses `DATA_STORE=local` by default and stores mock data under `backend/data/`.

## Environment Variables

Set these on Lambda:

```text
DATA_STORE=dynamodb
AWS_REGION=ap-southeast-1
USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
JWT_SECRET=<strong random secret>
EXPORT_BUCKET=<private export bucket name>
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://EXTENSION_ID,http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com
USE_AMAZON_TRANSLATE=true
REQUIRE_TRANSLATE_AUTH=true
TRANSLATE_MAX_LENGTH=120
SERVE_STUDY_STATIC=false
```

`ALLOWED_ORIGINS` must include your S3 website URL and Chrome Extension origin. The unpacked extension ID and published extension ID can differ.

## DynamoDB Tables

Create three DynamoDB tables using provisioned capacity `1 RCU / 1 WCU` for demo usage.

### Users

Table name from `USERS_TABLE`, for example `FlashcardUsers`.

Partition key:

```text
username string
```

Attributes stored by the app:

```text
userId, username, passwordHash, role, createdAt, updatedAt
```

### Flashcards

Table name from `FLASHCARDS_TABLE`, for example `FlashcardCards`.

Keys:

```text
Partition key: userId string
Sort key: cardId string
```

The app queries flashcards by current JWT user ID. Normal flashcard loading does not scan the full table.

### Categories

Table name from `CATEGORIES_TABLE`, for example `FlashcardCategories`.

Keys:

```text
Partition key: userId string
Sort key: categoryName string
```

Deleting a category moves matching flashcards to `Uncategorized`.

## Export Bucket

Create a private S3 bucket for exports. Keep all public access blocked. Lambda uploads JSON exports and returns a pre-signed download URL.

Required permissions:

```text
s3:PutObject
s3:GetObject
```

Scope the resource to:

```text
arn:aws:s3:::YOUR_EXPORT_BUCKET/*
```

## Lambda Function

Runtime:

```text
Node.js 20.x
```

Handler:

```text
lambda.handler
```

Build a zip from `backend/` after installing production dependencies:

```bash
cd backend
npm install --omit=dev
Compress-Archive -Path app.js,server.js,lambda.js,package.json,package-lock.json,node_modules,src -DestinationPath flashcard-backend.zip -Force
```

Upload `flashcard-backend.zip` to Lambda.

Minimum IAM permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardUsers",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardCards",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardCategories"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "translate:TranslateText",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_EXPORT_BUCKET/*"
    }
  ]
}
```

## API Gateway HTTP API

Create an HTTP API and connect all routes to the Lambda function.

Routes:

```text
ANY /{proxy+}
```

Enable CORS for:

```text
Content-Type
Authorization
```

Allowed origins should match `ALLOWED_ORIGINS`. Avoid `*` for production.

Test:

```text
GET https://YOUR_API_ID.execute-api.REGION.amazonaws.com/api/health
```

Expected:

```json
{
  "ok": true,
  "service": "flashcard-backend"
}
```

## Study Web on S3

Upload these files to your S3 static website bucket:

```text
backend/public/study/index.html
backend/public/study/styles.css
backend/public/study/app.js
backend/public/study/config.js
```

Before upload, update `backend/public/study/config.js`:

```js
window.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://YOUR_API_ID.execute-api.REGION.amazonaws.com"
};
```

For a demo, S3 Static Website Hosting is acceptable. For production, put CloudFront in front of S3 for HTTPS and custom domain support.

## Chrome Extension Config

Update `extension-config.js`:

```js
globalThis.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://YOUR_API_ID.execute-api.REGION.amazonaws.com",
  STUDY_URL: "http://YOUR_STUDY_BUCKET.s3-website-REGION.amazonaws.com"
};
```

Update `manifest.json` host permissions if you want a tighter production manifest:

```json
"host_permissions": [
  "https://YOUR_API_ID.execute-api.REGION.amazonaws.com/*",
  "http://*/*",
  "https://*/*"
]
```

Keep `http://*/*` and `https://*/*` only if the context-menu highlight flow must work broadly across websites.

## Optional SAM Deployment

An optional starter template is available at:

```text
infra/template.yaml
```

Manual deployment remains the primary path for this project. If you use SAM:

```bash
cd infra
sam build
sam deploy --guided
```

Review generated resources and CORS settings before using it beyond demo.

## Full Test Checklist

1. Register a new user through the extension popup or study web.
2. Login and confirm `/api/me` works.
3. Highlight a word on a normal web page.
4. Right-click and add it as a flashcard.
5. Use Translate.
6. Save locally.
7. Sync to cloud.
8. Open the study page.
9. Confirm flashcards load from DynamoDB.
10. Add, edit, and delete categories.
11. Start a study session and grade cards.
12. Export flashcards and confirm the pre-signed URL downloads JSON.

## Cost Notes

Services that may create cost:

- Lambda invocations
- API Gateway requests
- DynamoDB provisioned capacity
- Amazon Translate requests
- S3 storage and requests

Keep Translate input short and DynamoDB capacity low for demo usage.
