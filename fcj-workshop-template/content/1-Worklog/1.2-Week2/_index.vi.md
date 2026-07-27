---
title: "Nhật ký công việc Tuần 2"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---

# Tuần 2 — 22/06 – 28/06/2026

### Mục tiêu

Đảm bảo tài khoản AWS an toàn để sử dụng, chọn một vấn đề đáng để giải quyết và chạy thử phiên bản đầu tiên của sản phẩm trên môi trường máy cá nhân (local).

## Các công việc đã thực hiện

**Hội nhập chương trình (Onboarding)**
* Thiết lập tài khoản AWS, bật MFA (Xác thực đa yếu tố) cho người dùng root và tạo một người dùng IAM cho công việc hàng ngày để không bao giờ phải sử dụng lại thông tin đăng nhập root nữa.
* Tạo **AWS Budget** (Ngân sách AWS) với các cảnh báo ở mức 1 USD và 5 USD *trước khi* tạo bất kỳ tài nguyên nào có tính phí.
* Cài đặt bộ công cụ: AWS CLI, Node.js 24, Git, VS Code.

**Xác định vấn đề**

* Vấn đề đặt ra: từ vựng gặp phải khi đọc các trang web tiếng Anh thường bị lãng quên vì việc lưu lại chúng làm gián đoạn mạch đọc.
* Thu thập từ vựng trên trình duyệt, lưu trữ trên đám mây.

**Triển khai ban đầu**

* Xây dựng bộ khung tiện ích mở rộng (extension) Chrome trên Manifest V3: service worker `background.js`, menu ngữ cảnh khi nhấp chuột phải và `contentScript.js` để chèn một trình chỉnh sửa ngay cạnh từ được chọn.
* Xây dựng một backend Express ở local với xác thực JWT và kho lưu trữ bằng file JSON để có thể tinh chỉnh mô hình dữ liệu một cách dễ dàng và ít tốn kém.
* Xây dựng phiên bản đầu tiên của trang web Học tập (Study) để liệt kê các thẻ đã lưu.

## Kết quả

* Tài khoản AWS đã sẵn sàng sử dụng và có rào chắn bảo vệ chi phí (cost guardrail).
* Một bản demo đã hoạt động ở local: chọn một từ trên trang bất kỳ → nhấp chuột phải → lưu → xem lại từ đó trên trang Học tập.
* Commit mã nguồn đầu tiên: `Initial flashcard extension and study app` (22/06/2026).