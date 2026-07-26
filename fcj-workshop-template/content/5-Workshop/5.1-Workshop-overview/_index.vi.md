---
title: "Tổng quan Kiến trúc & Thiết kế Hệ thống"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

#### Tóm tắt tổng quan

Phần này trình bày chi tiết kiến trúc hệ thống, các thành phần kỹ thuật và luồng dữ liệu của ứng dụng serverless **Chrome Flashcard Extension** trên Amazon Web Services (AWS).

#### Mô hình kiến trúc

Hệ thống áp dụng pattern thiết kế offline-first ở tầng client kết hợp với kiến trúc serverless định hướng microservices trên AWS:

```text
+-----------------------+        HTTPS REST         +--------------------------+
|  Chrome Extension     |-------------------------->|  API Gateway (HTTP API)  |
|  (Manifest V3)        |                           +--------------------------+
+-----------------------+                                        |
            | (Lưu tạm ở bộ nhớ Local)                           v
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
                            |  (Users, Cards,    |    |  (Dịch tự động     |    |  (Private Export   |
                            |   Categories)      |    |   + Comprehend)    |    |   Pre-signed URLs) |
                            +--------------------+    +--------------------+    +--------------------+
```

#### Thông số chi tiết các thành phần AWS

| Thành phần | Vai trò trong Kiến trúc | Thông số Vận hành & Đặc tính Kỹ thuật |
|---|---|---|
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Cung cấp endpoint HTTPS, quản lý authorization CORS preflight, và route toàn bộ request qua proxy integration (`/{proxy+}`) tới Lambda. |
| **AWS Lambda** | Tầng tính toán Stateless | Thực thi backend Express.js thông qua `serverless-http` trên runtime Node.js 24.x, hỗ trợ khả năng scale-to-zero để tối ưu chi phí. |
| **Amazon DynamoDB** | Tầng lưu trữ dữ liệu (Persistent Storage) | Các bảng NoSQL (Provisioned/On-demand): `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), và `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon Translate** | Engine dịch thuật tự động | Được gọi từ Lambda để thực hiện dịch từ vựng Anh - Việt theo ngữ cảnh. |
| **Amazon S3 (Private)** | Kho lưu trữ tài liệu mã hóa | Lưu trữ dữ liệu export dạng JSON với policy hạn chế quyền truy cập, chỉ có thể truy cập qua Pre-signed GET URL tạm thời có hiệu lực 15 phút. |
| **Amazon S3 (Public)** | Hosting Web Asset | Cung cấp các tệp tĩnh HTML, CSS, JavaScript và tệp cấu hình cho Study Web Application. |
| **Amazon CloudWatch** | Nền tảng Observability | Thu thập execution log, metric vận hành, theo dõi thời gian cold start và tỉ lệ lỗi hệ thống. |

#### Phân tích luồng dữ liệu các thành phần

1. **Giai đoạn thu thập từ vựng**: Browser extension bắt văn bản được bôi đen qua context menu listener. Content script (`contentScript.js`) sẽ render một inline modal và lưu các bản ghi local vào `chrome.storage.local`.
2. **Giai đoạn đồng bộ Cloud**: Khi người dùng xác thực hoặc chủ động bấm sync, extension gửi danh sách các bản ghi local qua `POST /api/sync` tới API Gateway. Lambda xác thực JWT credential và thực thi batch operation ghi vào DynamoDB.
3. **Giai đoạn dịch tự động**: Yêu cầu dịch từ background service worker của extension sẽ trigger Lambda gọi `Amazon Translate` (`@aws-sdk/client-translate`), sau đó trả payload kết quả dịch về UI của extension.
4. **Giai đoạn ôn tập tương tác**: Study Web App tải các flashcard của người dùng từ DynamoDB thông qua REST call đã xác thực, quản lý queue ôn tập và điểm số ghi nhớ.
5. **Giai đoạn xuất dữ liệu an toàn**: Yêu cầu export sẽ trigger Lambda tạo một JSON snapshot có cấu trúc, ghi tệp vào private S3 bucket và trả về một Pre-signed URL tải xuống tạm thời.
