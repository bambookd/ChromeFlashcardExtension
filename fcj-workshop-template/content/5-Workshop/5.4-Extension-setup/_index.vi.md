---
title: "Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client"
date: 2024-01-01
weight: 4
chapter: false
pre: " <b> 5.4. </b> "
---

#### Kiến trúc Thành phần Phía Client (Client Component System Architecture)

Phần này trình bày chi tiết việc triển khai tiêu chuẩn Manifest V3 cho **Chrome Flashcard Extension**, kiến trúc lưu trữ đệm cục bộ, cơ chế chịu lỗi ngoại tuyến (offline resilience) và luồng đồng bộ dữ liệu đám mây với tên miền `axiza.net`.

#### Kiến trúc Manifest V3 & Quy chuẩn Thành phần

Extension được thiết kế tuân thủ tiêu chuẩn Google Chrome Extension Manifest V3 mới nhất, tăng cường tính bảo mật trình duyệt và tối ưu hóa hiệu năng tài nguyên hệ thống:

```text
+----------------------------------------------------------------------------+
|                         Chrome Extension (MV3)                             |
|                                                                            |
|  +---------------------+   Messaging    +----------------------------+     |
|  | Context Menu Event  |--------------->| Background Service Worker  |     |
|  | (Browser Selection) |                | (background.js)            |     |
|  +---------------------+                +----------------------------+     |
|             |                                        |                     |
|             v                                        v                     |
|  +---------------------+   Local Storage   +----------------------------+  |
|  | Injected DOM Modal  |------------------>| chrome.storage.local       |  |
|  | (contentScript.js)  |                   | (Offline Persistence Cache)|  |
|  +---------------------+                   +----------------------------+  |
|                                                      ^                     |
|                                                      | Ghi/Đọc Dữ Liệu     |
|  +---------------------+                             | & Auth Token        |
|  | Extension Popup UI  |-----------------------------+                     |
|  | (popup.js / html)   |                                                   |
|  +----------+----------+                                                   |
+-------------|--------------------------------------------------------------+
              |
              v HTTPS REST API (https://api.axiza.net) [Login / Sync / Export]
+----------------------------------------------------------------------------+
|                       Amazon Route 53 / API Gateway                        |
+----------------------------------------------------------------------------+
```

#### Các Thành phần Cốt lõi & Vai trò Từng Tập tin

1. **`manifest.json`**: Khai báo các quyền truy cập theo quy chuẩn Manifest V3 (`storage`, `contextMenus`, `activeTab`), đăng ký Background Service Worker script vàHost Permissions.
2. **`background.js` (Service Worker)**: Đăng ký các mục trong menu ngữ cảnh (`Lưu "..." thành flashcard`) và quản lý cơ chế truyền nhận thông điệp (message passing) giữa các script được nhúng và extension core.
3. **`contentScript.js` (DOM Controller)**: Nhúng một giao diện chỉnh sửa nổi (Floating Edit Dialog) trực tiếp vào trang web đang xem khi nhận sự kiện từ context menu, cho phép người dùng hiệu chỉnh định nghĩa, từ loại và danh mục trước khi lưu.
4. **`popup.html / popup.js`**: Giao diện chính của extension phục vụ đăng ký, đăng nhập tài khoản (lưu trữ an toàn JWT Token), quản lý thẻ lưu cục bộ, kích hoạt đồng bộ hàng loạt (`POST /api/sync`) và gửi yêu cầu xuất dữ liệu.
5. **`extension-config.js`**: Thiết lập ánh xạ cấu hình môi trường qua đối tượng global `globalThis.FLASHCARD_CONFIG`:
   ```javascript
   globalThis.FLASHCARD_CONFIG = {
     API_BASE_URL: "https://api.axiza.net",
     STUDY_URL: "https://axiza.net/study"
   };
   ```

#### Cơ chế Lưu trữ Ngoại tuyến & Quy trình Đồng bộ Dữ liệu (Offline Storage & Data Sync)

1. **Cấu trúc Dữ liệu Lưu trữ Cục bộ**: Các flashcard được khởi tạo khi không có kết nối mạng (offline) sẽ được đóng gói theo định dạng JSON và lưu trữ đệm trong mảng `flashcards` thuộc `chrome.storage.local`:
   ```json
   {
     "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
     "word": "serverless",
     "meaning": "không cần máy chủ",
     "wordform": "adjective",
     "category": "AWS",
     "syncedAt": null,
     "createdAt": "2026-07-26T21:30:00.000Z"
   }
   ```

2. **Quy trình Đồng bộ Hàng loạt lên Đám mây (Cloud Batch Sync)**:
   - Người dùng thực hiện xác thực thông qua Popup UI (`POST https://api.axiza.net/api/auth/login`), lưu trữ an toàn mã token JWT nhận được vào bộ nhớ đệm cục bộ.
   - Khi người dùng chọn **Sync Now**, script `popup.js` lọc các bản ghi chưa đồng bộ (`syncedAt === null`) và gửi gói dữ liệu JSON payload tới endpoint `POST /api/sync` tại `https://api.axiza.net`.
   - AWS Lambda tiếp nhận payload, thực hiện thao tác ghi có tính chất lặp lại không đổi trạng thái (idempotent conditional write - `PutItem`) vào bảng DynamoDB `FlashcardsTable`, và phản hồi metadata xác nhận.
   - Client gán dấu thời gian dạng chuỗi ISO `syncedAt: "2026-07-26T21:30:05.000Z"` cho các bản ghi local, bảo đảm tính nhất quán dữ liệu (Data Consistency) giữa storage cục bộ và cơ sở dữ liệu cloud.
