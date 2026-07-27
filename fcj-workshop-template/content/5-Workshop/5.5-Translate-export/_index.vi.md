---
title: "Ứng dụng Web Ôn tập & Xuất Dữ liệu"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5.5. </b> "
---

#### Tổng quan Kiến trúc & Chi tiết Tích hợp

Phần này chi tiết hóa việc xây dựng ứng dụng **Study Web Application** và giải pháp xuất dữ liệu an toàn (Secure Data Export) áp dụng cơ chế **Amazon S3 Pre-signed URLs** liên kết với tên miền tùy chỉnh `axiza.net`.

#### Kiến trúc Ứng dụng Web Ôn tập (Study Web App Architecture)

Ứng dụng Study Web App được lưu trữ trên AWS Amplify Hosting kết nối với S3 bucket chứa tập tin giao diện tĩnh, phục vụ thông qua tên miền tùy chỉnh `https://axiza.net/study` quản lý bởi Amazon Route 53.

```text
User Browser ─── REST API + JWT ───> Route 53 (api.axiza.net) ───> API Gateway ───> AWS Lambda ───> DynamoDB (Flashcards)
     │                                                                                                             │
     └─── Ôn tập thẻ flashcard (https://axiza.net/study) <── Route 53 ──> AWS Amplify Hosting (S3) ────────────────┘
```

1. **Quản lý Trạng thái Xác thực (Authentication State)**: Người dùng xác thực hệ thống thông qua mã Token JWT cấp phát từ phiên đăng nhập.
2. **Lọc Danh mục & Hàng chờ Học tập (Study Queue)**: Dữ liệu flashcard lưu trên Amazon DynamoDB được truy vấn nhanh chóng dựa trên Partition Key (`userId`) kết hợp bộ lọc danh mục.
3. **Thuật toán Hàng chờ Ôn tập Chủ động (Active Recall Queue)**: Người dùng đánh giá mức độ ghi nhớ của thẻ (`Again`, `Hard`, `Good`, `Easy`). Thẻ đánh giá `Again` được tự động chèn lại vào hàng chờ của phiên học nhằm tối đa hóa khả năng ghi nhớ dài hạn.

#### Cơ chế Xuất Dữ liệu An toàn bằng Amazon S3 Pre-signed URL

Nhằm bảo đảm an toàn dữ liệu xuất (Export Dataset) mà không cần nhúng thông tin xác thực tĩnh (Static Credentials) vào mã client hoặc mở công khai S3 Bucket Policy, hệ thống áp dụng cơ chế **Amazon S3 Pre-signed URLs**:

```text
Client Popup / App          API Gateway / AWS Lambda             Amazon S3 (Private Bucket)
        │                              │                                     │
        │─── POST /api/export ────────>│                                     │
        │    (https://api.axiza.net)   │─── 1. Ghi tập tin JSON ────────────>│
        │                              │    (key: userId/flashcards-ts.json) │
        │                              │                                     │
        │                              │─── 2. Khởi tạo Pre-signed GET URL ──>│
        │                              │    (expiresIn: 900 seconds)         │
        │<── Trả về Pre-signed URL ────│                                     │
        │                                                                    │
        │─── Tải trực tiếp qua HTTPS GET với Tham số Chữ ký Query ─────────>│
        │<── Trả về Tập tin Dữ liệu JSON Export từ S3 ───────────────────────│
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

#### Verification An ninh & Đánh giá Chính sách Truy cập (Security Audit & Access Policy)

- **Xác minh Chính sách Public Bucket Policy**: Các request HTTP GET trực tiếp tới đường dẫn gốc của S3 Object (`https://<bucket>.s3.amazonaws.com/<key>`) đều bị chặn và trả về lỗi `HTTP 403 Forbidden` nhờ quy tắc `BlockPublicAccess`.
- **Xác minh Truy cập qua Pre-signed URL**: Việc truy cập tập tin thông qua Pre-signed URL chứa chữ ký xác thực diễn ra thành công, khẳng định cơ chế kiểm soát truy cập giới hạn thời hạn (Time-bounded Token Access Control) vận hành chính xác theo thiết kế.
