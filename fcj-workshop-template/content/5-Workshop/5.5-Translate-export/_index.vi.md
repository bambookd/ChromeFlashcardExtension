---
title: "Ứng dụng Web Ôn tập & Xuất Dữ liệu"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Tổng quan & Chi tiết Tích hợp

Phần này mô tả chi tiết việc phát triển **Study Web Application** và giải pháp xuất (export) dữ liệu an toàn sử dụng **Amazon S3 Pre-signed URL**.

#### Kiến trúc Study Web Application

Study Web Application được host dưới dạng static route trong ứng dụng Express (`/study`) hoặc phục vụ từ public S3 static website bucket (`http://<bucket-name>.s3-website.amazonaws.com/study/`).

```text
User Browser ─── REST API + JWT ───> API Gateway ───> AWS Lambda ───> DynamoDB (Flashcards)
     │                                                                     │
     └─── Xem Active Recall Flashcards <── Trả về Bộ sưu tập thẻ ──────────┘
```

1. **Quản lý trạng thái xác thực (Authentication State)**: Người dùng xác thực bằng JWT token nhận được khi login.
2. **Lựa chọn danh mục & Hàng chờ phiên học (Study Queue)**: Các flashcard lưu trong DynamoDB được truy vấn theo partition key (`userId`) và bộ lọc danh mục.
3. **Thuật toán hàng chờ Active Recall**: Người dùng đánh giá độ khó của thẻ (`Again`, `Hard`, `Good`, `Easy`). Các thẻ được đánh giá `Again` sẽ được đưa lại vào hàng chờ của phiên học (active session queue) để tối ưu hiệu quả ghi nhớ.

#### Xuất dữ liệu an toàn với Amazon S3 Pre-signed URL

Để export dữ liệu flashcard mà không cần nhúng static credential trong mã client hoặc công khai S3 bucket policy, hệ thống sử dụng **Amazon S3 Pre-signed URL**:

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

#### Kiểm tra Bảo mật & Đánh giá Access Policy

- **Kiểm tra Public Bucket Policy**: Các request HTTP GET trực tiếp tới URI của S3 object (`https://<bucket>.s3.amazonaws.com/<key>`) đều bị từ chối với lỗi `HTTP 403 Forbidden` do cơ chế `BlockPublicAccess`.
- **Kiểm tra Signed Request**: Truy cập object thông qua pre-signed URL thành công, xác nhận cơ chế kiểm soát truy cập giới hạn thời gian bằng token hoạt động đúng thiết kế.
