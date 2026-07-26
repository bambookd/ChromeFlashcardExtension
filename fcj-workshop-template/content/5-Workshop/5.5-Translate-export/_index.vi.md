---
title: "Ứng dụng Web Ôn tập, Bộ máy Dịch thuật & Xuất Dữ liệu"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Tổng quan & Chi tiết Tích hợp

Phần này trình bày chi tiết việc triển khai **Study Web Application**, tính năng dịch tự động qua **Amazon Translate**, và export dữ liệu an toàn bằng **Amazon S3 Pre-signed URLs**.

#### Engine Tích hợp Amazon Translate SDK

Tính năng dịch tự động được tích hợp vào Express serverless backend thông qua `@aws-sdk/client-translate`. Khi client gửi request tới `POST /api/translate`, Lambda sẽ gọi API service của Amazon Translate.

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

#### Kiến trúc Study Web Application

Study Web Application được host qua static route trong ứng dụng Express (`/study`) hoặc từ public S3 static website bucket (`http://<bucket-name>.s3-website.amazonaws.com/study/`).

```text
User Browser ─── REST API + JWT ───> API Gateway ───> AWS Lambda ───> DynamoDB (Flashcards)
     │                                                                     │
     └─── Xem Active Recall Flashcards <── Trả về Bộ sưu tập thẻ ──────────┘
```

1. **Trạng thái xác thực**: Người dùng xác thực bằng JWT token nhận được khi login.
2. **Chọn danh mục & Queue phiên học**: Các flashcard lưu trong DynamoDB được truy vấn theo partition key (`userId`) và bộ lọc danh mục.
3. **Thuật toán Active Recall Queue**: Người dùng đánh giá độ khó của thẻ (`Again`, `Hard`, `Good`, `Easy`). Các thẻ được đánh giá `Again` sẽ được đưa lại vào active session queue để tối ưu khả năng ghi nhớ.

#### Data Export An toàn với Amazon S3 Pre-signed URL

Để export dữ liệu flashcard mà không cần nhúng credential tĩnh trong client code hoặc công khai S3 bucket policy, hệ thống triển khai **Amazon S3 Pre-signed URLs**:

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

#### Xác minh Bảo mật & Kiểm tra Access Policy

- **Xác minh Public Bucket Policy**: Các HTTP GET request trực tiếp tới URI S3 object (`https://<bucket>.s3.amazonaws.com/<key>`) đều trả về `HTTP 403 Forbidden` do cơ chế `BlockPublicAccess`.
- **Xác minh Request có chữ ký**: Truy cập object qua pre-signed URL thành công, xác nhận cơ chế kiểm soát truy cập bằng token mã hóa có thời hạn.
