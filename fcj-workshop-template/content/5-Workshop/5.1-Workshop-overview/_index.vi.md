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

Hệ thống áp dụng design pattern offline-first ở tầng client kết hợp với kiến trúc serverless hướng microservices trên AWS:

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
                                       |                                                   |
                                       v                                                   v
                            +--------------------+                               +--------------------+
                            |  Amazon DynamoDB   |                               |  Amazon S3 Bucket  |
                            |  (Users, Cards,    |                               |  (Private Export   |
                            |   Categories)      |                               |   Pre-signed URLs) |
                            +--------------------+                               +--------------------+
```

#### Thông số chi tiết các thành phần AWS

| Thành phần | Vai trò trong Kiến trúc | Thông số Vận hành & Đặc tính Kỹ thuật |
|---|---|---|
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Cung cấp endpoint HTTPS, xử lý các request CORS preflight, và route toàn bộ request thông qua proxy integration (`/{proxy+}`) tới Lambda. |
| **AWS Lambda** | Tầng tính toán Stateless (Stateless Compute Layer) | Thực thi backend Express.js thông qua `serverless-http` trên Node.js 24.x runtime, hỗ trợ khả năng scale-to-zero giúp tối ưu chi phí. |
| **Amazon DynamoDB** | Tầng lưu trữ bền vững (Persistent Storage Layer) | Bảng NoSQL (Provisioned/On-demand): `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), và `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon S3 (Private)** | Kho lưu trữ dữ liệu mã hóa (Encrypted Document Store) | Lưu trữ file export JSON với access policy nghiêm ngặt, chỉ cho phép truy cập qua pre-signed GET URL tạm thời có hiệu lực trong 15 phút. |
| **Amazon S3 (Public)** | Host tài nguyên Web (Web Asset Hosting) | Phục vụ các file HTML, CSS, JavaScript tĩnh và file cấu hình cho Study Web App. |
| **Amazon CloudWatch** | Nền tảng giám sát (Observability) | Ghi nhận execution log, các metric vận hành, thời gian cold start và tỷ lệ lỗi hệ thống. |

#### Phân tích luồng dữ liệu các thành phần

1. **Giai đoạn thu thập từ vựng**: Extension bắt đoạn văn bản được chọn thông qua context menu listener. Content script (`contentScript.js`) hiển thị (render) một modal nổi (inline modal) và lưu dữ liệu cục bộ vào `chrome.storage.local`.
2. **Giai đoạn đồng bộ với Cloud**: Khi người dùng đăng nhập hoặc chủ động kích hoạt đồng bộ (sync), extension gửi danh sách các bản ghi lưu cục bộ qua `POST /api/sync` tới API Gateway. Lambda xác thực JWT token và thực hiện batch operation với DynamoDB.
3. **Giai đoạn ôn tập tương tác**: Study Web App tải các flashcard của người dùng từ DynamoDB thông qua các REST API call đã được xác thực, quản lý hàng chờ (queue) ôn tập và điểm số ghi nhớ.
4. **Giai đoạn xuất dữ liệu an toàn**: Yêu cầu export sẽ kích hoạt (trigger) Lambda tạo file JSON snapshot có cấu trúc, lưu file vào private S3 bucket và trả về pre-signed URL tạm thời để tải xuống.
