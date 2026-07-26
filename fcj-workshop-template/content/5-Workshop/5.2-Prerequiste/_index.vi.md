---
title: "Yêu cầu Môi trường & Thông số Kỹ thuật"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

#### Yêu cầu Môi trường Phát triển & Công cụ

Phần này thông tin chi tiết về thông số phần mềm, dependency phát triển và cấu hình hệ thống cần thiết để build và vận hành ứng dụng.

#### Dependency Kỹ thuật & Yêu cầu Phiên bản

| Dependency | Phiên bản Tối thiểu | Mục đích Sử dụng | Lệnh Kiểm tra |
|---|---|---|---|
| **Node.js** | `v18.x` / `v20.x` / `v24.x` | JavaScript runtime engine cho backend execution & npm package management | `node -v` |
| **npm** | `v9.x`+ | Package dependency manager cho các Node module | `npm -v` |
| **AWS CLI** | `v2.x` | Command-line interface cho AWS authentication & quản lý dịch vụ | `aws sts get-caller-identity` |
| **AWS SAM CLI** | `v1.100.x`+ | Serverless application orchestration, packaging và CloudFormation deployment | `sam --version` |
| **Google Chrome** | Current Stable (hỗ trợ MV3) | Host browser runtime để load Manifest V3 extension và manual test | N/A |

#### Cấu trúc Repository & Layout Tài nguyên

Repository của dự án (`ChromeFlashcardExtension`) được cấu trúc theo nguyên tắc phân tách vai trò rõ ràng (separation of concerns):

```text
ChromeFlashcardExtension/
├── manifest.json                # Cấu hình Chrome Extension Manifest V3
├── background.js                # Background service worker của extension
├── contentScript.js             # Script inject vào DOM trang web & listener bôi đen văn bản
├── extension-config.js          # Cấu hình mapping API endpoint phía client
├── popup.html / popup.js        # Giao diện Popup extension & auth controller
├── backend/                     # Ứng dụng Serverless Express backend
│   ├── app.js                   # Khởi tạo ứng dụng Express & middleware
│   ├── server.js                # File entry chạy HTTP server standalone (phát triển Local)
│   ├── lambda.js                # Wrapper handler cho AWS Lambda qua serverless-http
│   └── src/
│       ├── dynamoRepositories.js # Các thao tác CRUD với DynamoDB
│       ├── translateService.js  # Tích hợp SDK Amazon Translate
│       └── exportService.js     # Khởi tạo Pre-signed URL cho Amazon S3
└── infra/
    └── template.yaml            # Khai báo hạ tầng CloudFormation bằng AWS SAM
```

#### Xác minh Kiến trúc Phát triển Local

Trước khi triển khai lên cloud AWS, backend ứng dụng được xác minh trong môi trường local bằng cơ chế lưu trữ file JSON (`localRepositories.js`):

```bash
# Di chuyển vào module backend
cd backend
npm install

# Khởi chạy local development server
npm run dev
```

Xác minh local xác nhận dịch vụ hoạt động tại `http://localhost:3000/api/health`, trả về response payload trạng thái:
```json
{"status":"ok","store":"local"}
```
Thiết kế đa môi trường này đảm bảo việc chuyển đổi mượt mà giữa lưu trữ file local (`local`) và lưu trữ DynamoDB trên cloud (`dynamodb`) thông qua biến môi trường (`DATA_STORE`).
