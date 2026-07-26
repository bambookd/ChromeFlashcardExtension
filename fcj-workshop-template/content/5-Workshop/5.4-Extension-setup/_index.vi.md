---
title: "Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

#### Kiến trúc Thành phần Client

Phần này chi tiết triển khai Manifest V3 của **Chrome Flashcard Extension**, kiến trúc local storage, cơ chế offline resilience và luồng đồng bộ với cloud.

#### Kiến trúc Manifest V3 & Specifications

Extension được xây dựng tuân thủ tiêu chuẩn Chrome Extension Manifest V3 mới nhất, nâng cao tính bảo mật và tối ưu hiệu năng vận hành:

```text
+-------------------------------------------------------------------------+
|                         Chrome Extension (MV3)                          |
|                                                                         |
|  +---------------------+   Messaging    +----------------------------+  |
|  | Context Menu Event  |--------------->| Background Service Worker  |  |
|  | (Browser Selection) |                | (background.js)            |  |
|  +---------------------+                +----------------------------+  |
|             |                                        |                  |
|             v                                        v                  |
|  +---------------------+   Local Storage   +----------------------------+  |
|  | Injected DOM Modal  |------------------>| chrome.storage.local       |  |
|  | (contentScript.js)  |                   | (Offline Persistence)      |  |
|  +---------------------+                   +----------------------------+  |
|                                                      ^                  |
|                                                      | Auth & Sync      |
|  +---------------------+                             v                  |
|  | Extension Popup UI  |------------------------------------------------+  |
|  | (popup.js / html)   |                                                |
+--+---------------------+------------------------------------------------+
                                                       |
                                                       v HTTPS REST API
                                        +------------------------------+
                                        | AWS API Gateway / Lambda     |
                                        +------------------------------+
```

#### Các Thành phần Cốt lõi & Vai trò File

1. **`manifest.json`**: Khai báo các permission của Manifest V3 (`storage`, `contextMenus`, `activeTab`), background service worker script và host permissions.
2. **`background.js` (Service Worker)**: Đăng ký menu ngữ cảnh (`Save "..." as flashcard`), quản lý message passing giữa các injected content script, và route các request dịch thuật tới AWS API Gateway để tránh hạn chế CORS phía client.
3. **`contentScript.js` (DOM Controller)**: Inject dialog chỉnh sửa floating vào trang web đang mở khi click context menu, cho phép người dùng tùy chỉnh nghĩa, loại từ và danh mục trước khi lưu.
4. **`popup.html / popup.js`**: Cung cấp giao diện popup extension cho đăng ký người dùng, xác thực (lưu JWT token), quản lý thẻ local, thực hiện batch sync (`POST /api/sync`) và yêu cầu export dữ liệu.
5. **`extension-config.js`**: Định nghĩa cấu hình mapping môi trường:
   ```javascript
   window.EXTENSION_CONFIG = {
     API_BASE_URL: "https://<api-id>.execute-api.us-east-1.amazonaws.com",
     STUDY_APP_URL: "https://<api-id>.execute-api.us-east-1.amazonaws.com/study"
   };
   ```

#### Luồng Lưu trữ Offline & Đồng bộ Dữ liệu

1. **Local Storage Schema**: Các flashcard được tạo khi offline được format dưới dạng JSON item và ghi trực tiếp vào `chrome.storage.local` dưới key array `flashcards`:
   ```json
   {
     "id": "card-1722000000000",
     "word": "serverless",
     "meaning": "không cần máy chủ",
     "wordForm": "adjective",
     "category": "AWS",
     "synced": false,
     "createdAt": 1722000000000
   }
   ```

2. **Quy trình Cloud Batch Synchronization**:
   - Người dùng đăng nhập qua Popup UI (`POST /api/auth/login`), lưu JWT token nhận được vào local state của extension.
   - Khi bấm **Sync Now**, `popup.js` trích xuất các bản ghi chưa sync ở local và gửi JSON batch request payload tới `POST /api/sync`.
   - AWS Lambda xử lý payload, thực thi các idempotent conditional write (`PutItem`) vào DynamoDB `FlashcardsTable`, và trả về metadata xác nhận.
   - Client đánh dấu các bản ghi thành `synced: true`, đảm bảo tính nhất quán dữ liệu giữa local storage phía client và database trên cloud.
