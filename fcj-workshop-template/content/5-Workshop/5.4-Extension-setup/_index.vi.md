---
title: "Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

#### Kiến trúc Thành phần Client

Phần này mô tả chi tiết việc triển khai Manifest V3 cho **Chrome Flashcard Extension**, kiến trúc lưu trữ local, cơ chế chịu lỗi offline (offline resilience) và luồng đồng bộ dữ liệu với cloud.

#### Kiến trúc & Thông số Kỹ thuật Manifest V3

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

1. **`manifest.json`**: Khai báo các permission của Manifest V3 (`storage`, `contextMenus`, `activeTab`), script background service worker và host permissions.
2. **`background.js` (Service Worker)**: Đăng ký item trên context menu (`Save "..." as flashcard`) và quản lý việc truyền nhận thông điệp (message passing) giữa các injected content script và các thành phần của extension.
3. **`contentScript.js` (DOM Controller)**: Inject dialog chỉnh sửa dạng nổi (floating dialog) vào trang web đang mở khi kích hoạt từ context menu, cho phép người dùng chỉnh sửa nghĩa, loại từ và danh mục trước khi lưu.
4. **`popup.html / popup.js`**: Cung cấp giao diện popup của extension cho phép đăng ký người dùng, xác thực (lưu JWT token), quản lý thẻ lưu ở local, thực hiện đồng bộ theo lô (batch sync - `POST /api/sync`) và gửi yêu cầu export dữ liệu.
5. **`extension-config.js`**: Định nghĩa cấu hình mapping endpoint theo môi trường:
   ```javascript
   window.EXTENSION_CONFIG = {
     API_BASE_URL: "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com",
     STUDY_APP_URL: "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/study"
   };
   ```

#### Luồng Lưu trữ Offline & Đồng bộ Dữ liệu

1. **Local Storage Schema**: Các flashcard tạo khi offline được định dạng dưới dạng item JSON và ghi trực tiếp vào `chrome.storage.local` trong mảng `flashcards`:
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

2. **Quy trình đồng bộ dữ liệu theo lô với Cloud (Batch Synchronization)**:
   - Người dùng đăng nhập qua Popup UI (`POST /api/auth/login`), lưu JWT token nhận được vào local state của extension.
   - Khi nhấn **Sync Now**, `popup.js` trích xuất các bản ghi chưa đồng bộ (unsynced) từ local storage và gửi batch request payload dạng JSON tới `POST /api/sync`.
   - AWS Lambda xử lý payload, thực hiện các thao tác ghi có điều kiện đảm bảo tính lặp lại (idempotent conditional write - `PutItem`) vào bảng DynamoDB `FlashcardsTable`, sau đó trả về metadata xác nhận.
   - Phía client đánh dấu các bản ghi thành `synced: true`, đảm bảo tính nhất quán dữ liệu giữa local storage của client và database trên cloud.
