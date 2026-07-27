---
title: "Nhật ký công việc Tuần 2"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.2. </b> "
---

# Tuần 2 — 22/06 – 28/06/2026

## Tổng quan

Nghiên cứu các dịch vụ AWS, định nghĩa bài toán dự án và xây dựng prototype Chrome Extension ban đầu.

### Các Công việc Đã Thực hiện

* **Nghiên cứu Dịch vụ AWS**: Tìm hiểu chuyên sâu các thành phần serverless AWS gồm Amazon API Gateway, AWS Lambda, Amazon DynamoDB và Amazon S3.
* **Định nghĩa Bài toán**: Chuẩn hóa bài toán thực tế—việc thu thập từ vựng tiếng Anh chuyên ngành khi đọc trang web làm gián đoạn luồng đọc, và bộ nhớ trình duyệt local thông thường không có khả năng đồng bộ đám mây.
* **Xây dựng Prototype Chrome Extension**: Phát triển bộ khung tiện ích mở rộng Manifest V3 tích hợp `background.js` service worker, menu ngữ cảnh khi nhấp chuột phải và `contentScript.js` chèn dialog chỉnh sửa nổi.
* **Local Backend & Study App**: Xây dựng ứng dụng backend Express.js REST API local với xác thực JWT và giao diện web Study ban đầu để hiển thị danh sách thẻ.

### Kết quả Đạt được

* **Prototype Sản phẩm**: Tiện ích mở rộng Chrome Manifest V3 prototype hoạt động với bộ nhớ đệm cục bộ (`chrome.storage.local`).
* **Xác minh Luồng Local**: Kiểm thử thành công luồng thao tác local: bôi đen từ $\rightarrow$ chuột phải $\rightarrow$ lưu $\rightarrow$ xem thẻ trên trang Study local.
* **Commit Mã nguồn Đầu tiên**: Khởi tạo repository dự án và push commit nền tảng `Initial flashcard extension and study app` (22/06/2026).