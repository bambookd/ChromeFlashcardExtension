---
title: "Study Web Application & Data Export"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Overview & Integration Details

This section details the implementation of the **Study Web Application** and secure document exports using **Amazon S3 Pre-signed URLs**.

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
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createExportService(config) {
  const s3 = new S3Client({ region: config.awsRegion });

  return {
    async exportFlashcards(user, flashcards) {
      const generatedAt = new Date();
      const fileName = `flashcards-${user.username}-${formatTimestamp(generatedAt)}.json`;
      const body = `${JSON.stringify({
        generatedAt: generatedAt.toISOString(),
        user: { userId: user.userId, username: user.username },
        count: flashcards.length,
        flashcards
      }, null, 2)}\n`;

      if (config.dataStore === "dynamodb") {
        const key = `${user.userId}/${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: config.exportBucket,
          Key: key,
          Body: body,
          ContentType: "application/json"
        }));

        const downloadUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: config.exportBucket, Key: key }),
          { expiresIn: 900 }
        );

        return { ok: true, fileName, downloadUrl };
      }
    }
  };
}
```

#### Security Validation & Access Policy Evaluation

- **Public Bucket Policy Verification**: Direct HTTP GET requests to the raw S3 object URI (`https://<bucket>.s3.amazonaws.com/<key>`) return `HTTP 403 Forbidden` due to `BlockPublicAccess` restrictions.
- **Signed Request Verification**: Accessing the object via the pre-signed URL succeeds, confirming time-bounded token-based access control.
