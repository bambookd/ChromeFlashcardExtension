# Flashcard Vocabulary — Chrome Extension

Extension bắt từ vựng khi đọc web, lưu offline, rồi đồng bộ lên cloud để ôn tập
trên Study Web. Bản này để **cài thủ công (unpacked)** vì chưa phát hành lên
Chrome Web Store.

Nếu bạn chỉ muốn học/ôn tập (không cần bắt từ khi lướt web), bạn **không cần
extension** — vào thẳng Study Web:

> 🌐 **https://axiza.net/study/**

Extension chỉ cần khi bạn muốn bôi đen từ trên bất kỳ trang web nào rồi lưu nhanh
vào bộ thẻ của mình.

---

## Cài đặt (Chrome / Edge / Brave)

1. Tải mã nguồn này về (nút **Code → Download ZIP**, rồi giải nén — hoặc
   `git clone` nhánh này).
2. Mở trình duyệt, vào `chrome://extensions`.
3. Bật **Developer mode** (góc trên bên phải).
4. Bấm **Load unpacked**.
5. Chọn **thư mục vừa giải nén** (thư mục có chứa file `manifest.json`).
6. Extension **Flashcard Vocabulary** xuất hiện trên thanh công cụ. Xong.

> Extension này đã **ghim ID cố định**, nên mọi người cài đều dùng chung một
> danh tính và đồng bộ cloud chạy được ngay — không cần xin cấp quyền gì thêm.

## Cách dùng

1. **Đăng nhập / đăng ký:** bấm icon extension → tạo tài khoản (hoặc dùng tài
   khoản bạn đã tạo ở Study Web — chung một hệ thống).
2. **Bắt từ:** bôi đen một từ/cụm từ trên trang web → chuột phải → **Save "…" as
   flashcard** → cửa sổ nhỏ hiện ra cho bạn sửa nghĩa, loại từ, category → **Save**.
   Thẻ được lưu ngay vào máy (hoạt động cả khi offline).
3. **Đồng bộ:** mở popup extension → **Sync** để đẩy các thẻ mới lên cloud.
4. **Ôn tập:** vào https://axiza.net/study/ để học, làm test, chỉnh sửa thẻ.

## Cấu hình

File `extension-config.js` đã trỏ sẵn tới backend đang chạy:

```js
API_BASE_URL: "https://api.axiza.net"
STUDY_URL:    "https://axiza.net/study/"
```

Bạn không cần sửa gì. (Nếu tự dựng backend riêng thì thay hai giá trị này.)

## File trong extension

| File | Vai trò |
|---|---|
| `manifest.json` | Khai báo Manifest V3, quyền, và key ghim extension ID |
| `background.js` | Service worker: context menu, điều phối message |
| `contentScript.js` | Chèn cửa sổ sửa thẻ vào trang web đang đọc |
| `popup.html` / `popup.js` / `popup.css` | Giao diện đăng nhập, quản lý thẻ, sync, export |
| `extension-config.js` | Địa chỉ API / Study Web |

## Ghi chú

- Extension lưu thẻ vào `chrome.storage.local` trước, nên bắt từ được cả khi
  không có mạng; đồng bộ khi online.
- Dữ liệu demo, không dùng cho thông tin nhạy cảm.
- Mã nguồn đầy đủ của cả project (backend, hạ tầng, tài liệu) nằm ở nhánh
  `final-ver`.
