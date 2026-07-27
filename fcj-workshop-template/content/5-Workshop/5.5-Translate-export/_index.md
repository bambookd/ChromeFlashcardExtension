---
title: "Study Web Application & Data Export"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Overview & Integration Details

This section details the implementation of the **Study Web Application** and secure document exports using **Amazon S3 Pre-signed URLs** for domain `axiza.net`.

#### Study Web Application Architecture

The Study Web Application is hosted using AWS Amplify pointing to an S3 bucket with static web assets, accessible via the custom domain `https://axiza.net/study` managed by Route 53.

```text
User Browser ─── REST API + JWT ───> Route 53 (api.axiza.net) ───> API Gateway ───> AWS Lambda ───> DynamoDB (Flashcards)
     │                                                                                                             │
     └─── View Active Recall Flashcards (https://axiza.net/study) <── Route 53 ──> AWS Amplify Hosting (S3) ───────┘
```

1. **Authentication State**: Users authenticate using JWT tokens obtained during login.
2. **Category Selection & Study Session Queue**: Flashcards stored in DynamoDB are retrieved by partition key (`userId`) and category filter.
3. **Active Recall Queue Algorithm**: Users rate card difficulty (`Again`, `Hard`, `Good`, `Easy`). Cards rated `Again` are re-inserted into the active session queue to maximize retention.

#### Secure S3 Data Export & Pre-signed URL Security

To export flashcard datasets without embedding static credentials in client code or exposing public S3 bucket policies, the system implements **Amazon S3 Pre-signed URLs**:

```text
Client Popup / App          API Gateway / AWS Lambda             Amazon S3 (Private Bucket)
        │                              │                                      │
        │─── POST /api/export ────────>│                                      │
        │    (https://api.axiza.net)   │─── 1. Write JSON File ──────────────>│
        │                              │    (key: userId/flashcards-ts.json)  │
        │                              │                                      │
        │                              │─── 2. Generate Signed GET URL ──────>│
        │                              │    (expiresIn: 900 seconds)          │
        │<── Return Signed GET URL ────│                                      │
        │                                                                     │
        │─── Direct HTTPS GET Request with Signature Query Parameters ───────>│
        │<── Return Encrypted JSON Download Payload ──────────────────────────│
```

```javascript
// Module: backend/src/exportService.js
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { httpError } from "./errors.js";

export function createExportService(config) {
  const s3 = new S3Client({ region: config.awsRegion });

  return {
    async exportFlashcards(user, flashcards) {
      const generatedAt = new Date();
      const fileName = `flashcards-${user.username}-${formatTimestamp(generatedAt)}.json`;
      const body = `${JSON.stringify({
        generatedAt: generatedAt.toISOString(),
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role || "user"
        },
        count: flashcards.length,
        flashcards
      }, null, 2)}\n`;

      if (config.dataStore === "dynamodb") {
        if (!config.exportBucket) {
          throw httpError(500, "EXPORT_BUCKET is required for cloud export");
        }

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

      await mkdir(config.paths.exportDir, { recursive: true });
      await writeFile(path.join(config.paths.exportDir, fileName), body, "utf8");

      return { ok: true, fileName, downloadUrl: `/exports/${fileName}` };
    }
  };
}
```

#### Security Validation & Access Policy Evaluation

- **Public Bucket Policy Verification**: Direct HTTP GET requests to the raw S3 object URI (`https://<bucket>.s3.amazonaws.com/<key>`) return `HTTP 403 Forbidden` due to `BlockPublicAccess` restrictions.
- **Signed Request Verification**: Accessing the object via the pre-signed URL succeeds, confirming time-bounded token-based access control.
