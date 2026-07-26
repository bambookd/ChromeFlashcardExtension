---
title: "Study Web Application, Translation Engine & Data Export"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Overview & Integration Details

This section details the implementation of the **Study Web Application**, automated translation via **Amazon Translate**, and secure document exports using **Amazon S3 Pre-signed URLs**.

#### Amazon Translate SDK Integration Engine

Machine translation is integrated into the Express serverless backend via `@aws-sdk/client-translate`. When a client sends a request to `POST /api/translate`, Lambda programmatically calls the Amazon Translate service.

```javascript
// Module: backend/src/translateService.js
const { TranslateClient, TranslateTextCommand } = require('@aws-sdk/client-translate');

async function translateText(text, sourceLang = 'en', targetLang = 'vi') {
  const client = new TranslateClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const command = new TranslateTextCommand({
    Text: text.trim(),
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang
  });
  
  const response = await client.send(command);
  return {
    translatedText: response.TranslatedText,
    sourceLanguage: response.SourceLanguageCode,
    targetLanguage: response.TargetLanguageCode
  };
}
```

#### Study Web Application Architecture

The Study Web Application is hosted via static routes within the Express application (`/study`) or served from a public S3 static website bucket (`http://<bucket-name>.s3-website.amazonaws.com/study/`).

```text
User Browser ─── REST API + JWT ───> API Gateway ───> AWS Lambda ───> DynamoDB (Flashcards)
     │                                                                     │
     └─── View Active Recall Flashcards <── Return Card Collection ────────┘
```

1. **Authentication State**: Users authenticate using JWT tokens obtained during login.
2. **Category Selection & Study Session Queue**: Flashcards stored in DynamoDB are retrieved by partition key (`userId`) and category filter.
3. **Active Recall Queue Algorithm**: Users rate card difficulty (`Again`, `Hard`, `Good`, `Easy`). Cards rated `Again` are re-inserted into the active session queue to maximize retention.

#### Secure S3 Data Export & Pre-signed URL Security

To export flashcard datasets without embedding static credentials in client code or exposing public S3 bucket policies, the system implements **Amazon S3 Pre-signed URLs**:

```text
Client Popup / App               AWS Lambda                         Amazon S3 (Private Bucket)
        │                            │                                           │
        │─── POST /api/export ──────>│                                           │
        │                            │─── 1. Write JSON File ───────────────────>│
        │                            │    (keys: userId/flashcards-timestamp.json)│
        │                            │                                           │
        │                            │─── 2. Generate Signed GET URL ───────────>│
        │                            │    (expiresIn: 900 seconds)               │
        │<── Return Signed URL ──────│                                           │
        │                                                                        │
        │─── Direct HTTPS GET Request with Signature Query Parameters ──────────>│
        │<── Return Encrypted JSON Download Payload ─────────────────────────────│
```

```javascript
// Module: backend/src/exportService.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

async function exportUserFlashcards(userId, username, flashcards) {
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const objectKey = `${userId}/flashcards-${username}-${Date.now()}.json`;
  const bucketName = process.env.EXPORT_BUCKET;

  // Write JSON payload to private S3 bucket
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    Body: JSON.stringify(flashcards, null, 2),
    ContentType: 'application/json'
  }));

  // Generate 15-minute Pre-signed GET URL (900 seconds)
  const getCommand = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
  const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 });

  return { downloadUrl, objectKey, expiresInSeconds: 900 };
}
```

#### Security Validation & Access Policy Evaluation

- **Public Bucket Policy Verification**: Direct HTTP GET requests to the raw S3 object URI (`https://<bucket>.s3.amazonaws.com/<key>`) return `HTTP 403 Forbidden` due to `BlockPublicAccess` restrictions.
- **Signed Request Verification**: Accessing the object via the pre-signed URL succeeds, confirming time-bounded token-based access control.
