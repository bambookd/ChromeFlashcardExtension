---
title: "Yêu cầu Môi trường & Thông số Kỹ thuật"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

#### Hạ tầng Phát triển & Cấu hình Công cụ (Development Infrastructure & Tooling)

Phần này ghi nhận chi tiết các thông số phần mềm, thư viện phụ thuộc (dependencies) và cấu hình hệ thống cần thiết để đóng gói, xây dựng (build) và vận hành ứng dụng.

#### Danh mục Thư viện Phụ thuộc & Yêu cầu Phiên bản (Technical Dependencies)

| Thư viện / Công cụ | Phiên bản Tối thiểu | Mục đích Vận hành | Lệnh Kiểm tra |
|---|---|---|---|
| **Node.js** | `v18.x` / `v20.x` / `v24.x` | Môi trường thực thi JavaScript (Runtime Engine) cho backend & quản lý gói package | `node -v` |
| **npm** | `v9.x`+ | Trình quản lý thư viện phụ thuộc (Package Manager) cho các module Node.js | `npm -v` |
| **AWS CLI** | `v2.x` | Công cụ dòng lệnh quản lý xác thực (Authentication) và điều khiển tài nguyên AWS | `aws sts get-caller-identity` |
| **AWS SAM CLI** | `v1.100.x`+ | Đóng gói, điều phối (Orchestration) ứng dụng serverless và triển khai tự động qua CloudFormation | `sam --version` |
| **Google Chrome** | Bản ổn định (Hỗ trợ MV3) | Trình duyệt chạy extension Manifest V3 và phục vụ kiểm thử thủ công (manual testing) | N/A |

#### Cấu trúc Repository & Tổ chức Tài nguyên

Repository chính của dự án (`ChromeFlashcardExtension`) được thiết kế tuân thủ nguyên tắc phân tách trách nhiệm (Separation of Concerns):

```text
ChromeFlashcardExtension/
├── manifest.json                 # Khai báo cấu hình Chrome Extension Manifest V3
├── background.js                 # Extension Background Service Worker
├── contentScript.js              # Script nhúng DOM trang web & lắng nghe sự kiện bôi đen từ vựng
├── extension-config.js           # Cấu hình ánh xạ API Endpoint phía client (globalThis.FLASHCARD_CONFIG)
├── popup.html / popup.js         # Giao diện Popup extension & Bộ điều khiển xác thực (Auth Controller)
├── backend/                      # Ứng dụng Serverless Express backend
│   ├── app.js                    # Khởi tạo ứng dụng Express & các Middleware
│   ├── server.js                 # File entry khởi chạy HTTP Server đơn lập (chế độ Local)
│   ├── lambda.js                 # Wrapper Handler cho AWS Lambda qua serverless-http
│   └── src/
│       ├── dynamoRepositories.js # Thao tác dữ liệu CRUD với Amazon DynamoDB
│       └── exportService.js      # Khởi tạo Amazon S3 Pre-signed URL
└── infra/
    └── template.yaml             # Khai báo hạ tầng CloudFormation bằng AWS SAM
```

#### Xác minh Kiến trúc tại Môi trường Cục bộ (Local Development Architecture)

Trước khi triển khai lên đám mây AWS, backend ứng dụng được xác minh tính sẵn sàng tại môi trường cục bộ bằng cơ chế lưu trữ tập tin JSON (`localRepositories.js`):

```bash
# Di chuyển vào thư mục ứng dụng backend
cd backend
npm install

# Khởi chạy server phát triển cục bộ
npm run dev
```

Kiểm tra tại môi trường local xác nhận service sẵn sàng phục vụ tại `http://localhost:3000/api/health`.

**Kết quả kỳ vọng (Expected Output)**:
```json
{"ok":true,"service":"flashcard-backend"}
```

Thiết kế đa môi trường này cho phép chuyển đổi linh hoạt giữa lưu trữ tập tin cục bộ (`local`) và lưu trữ đám mây DynamoDB (`dynamodb`) thông qua biến môi trường cấu hình (`DATA_STORE`).
