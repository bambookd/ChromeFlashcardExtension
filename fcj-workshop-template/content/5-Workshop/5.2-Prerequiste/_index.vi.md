---
title: "Yêu cầu Môi trường & Thông số Kỹ thuật"
date: 2024-01-01
weight: 2
chapter: false
pre: " <b> 5.2. </b> "
---

#### Yêu cầu Môi trường Phát triển & Công cụ

Phần này mô tả chi tiết các thông số phần mềm, dependency phát triển và cấu hình hệ thống cần thiết để build và vận hành ứng dụng.

#### Dependency Kỹ thuật & Yêu cầu Phiên bản

| Dependency | Phiên bản Tối thiểu | Mục đích Sử dụng | Lệnh Kiểm tra |
|---|---|---|---|
| **Node.js** | `v18.x` / `v20.x` / `v24.x` | Môi trường thực thi JavaScript (runtime) cho backend và quản lý package npm | `node -v` |
| **npm** | `v9.x`+ | Trình quản lý package dependency cho Node.js | `npm -v` |
| **AWS CLI** | `v2.x` | Công cụ dòng lệnh (CLI) để xác thực (authentication) và quản lý dịch vụ AWS | `aws sts get-caller-identity` |
| **AWS SAM CLI** | `v1.100.x`+ | Đóng gói, điều phối (orchestration) serverless application và triển khai (deploy) CloudFormation | `sam --version` |
| **Google Chrome** | Current Stable (hỗ trợ MV3) | Trình duyệt chạy extension Manifest V3 và phục vụ kiểm thử thủ công (manual testing) | N/A |

#### Cấu trúc Repository & Layout Tài nguyên

Repository của dự án (`ChromeFlashcardExtension`) được tổ chức tách biệt rõ ràng các thành phần (separation of concerns):

```text
ChromeFlashcardExtension/
├── manifest.json                # Cấu hình Chrome Extension Manifest V3
├── background.js                # Background service worker của extension
├── contentScript.js             # Script inject vào DOM trang web & listener sự kiện bôi đen văn bản
├── extension-config.js          # Cấu hình mapping API endpoint phía client
├── popup.html / popup.js        # Giao diện Popup extension & auth controller
├── backend/                     # Ứng dụng Serverless Express backend
│   ├── app.js                   # Khởi tạo ứng dụng Express & middleware
│   ├── server.js                # File entry chạy HTTP server standalone (môi trường local)
│   ├── lambda.js                # Wrapper handler cho AWS Lambda qua serverless-http
│   └── src/
│       ├── dynamoRepositories.js # Các thao tác CRUD với DynamoDB
│       └── exportService.js     # Tạo pre-signed URL cho Amazon S3
└── infra/
    └── template.yaml            # Định nghĩa hạ tầng CloudFormation bằng AWS SAM
```

#### Kiểm thử Kiến trúc Môi trường Local

Trước khi deploy lên cloud AWS, backend ứng dụng được kiểm thử ở môi trường local sử dụng cơ chế lưu trữ file JSON (`localRepositories.js`):

```bash
# Di chuyển vào module backend
cd backend
npm install

# Khởi chạy local development server
npm run dev
```

Kiểm tra ở local xác nhận dịch vụ hoạt động bình thường tại `http://localhost:3000/api/health`, trả về response payload trạng thái:
```json
{"status":"ok","store":"local"}
```
Thiết kế đa môi trường này cho phép chuyển đổi linh hoạt giữa lưu trữ file local (`local`) và lưu trữ DynamoDB trên cloud (`dynamodb`) chỉ bằng việc thay đổi biến môi trường (`DATA_STORE`).
