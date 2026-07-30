---
title: "Nhật ký công việc Tuần 2"
date: 2026-06-22
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Tuần 2 — 22/06 – 28/06/2026

## Trọng tâm

Tìm hiểu các nền tảng AWS cơ bản, xác định chính xác bài toán và phát triển phiên bản đầu tiên của extension.

## Các công việc đã thực hiện

- **Nền tảng AWS:** Nghiên cứu các dịch vụ serverless cốt lõi cần thiết — API Gateway, Lambda, DynamoDB và S3.
- **Xác định bài toán:** Chuẩn hóa vấn đề thực tế — người đọc gặp từ vựng tiếng Anh chuyên ngành khi đọc bài viết, việc lưu từ làm gián đoạn luồng đọc và dữ liệu lưu cục bộ trên trình duyệt không được sao lưu trên đám mây.
- **Xây dựng extension đầu tiên:** Đã tạo bộ khung Manifest V3 bao gồm `background.js` service worker, menu ngữ cảnh nhấp chuột phải và modal nổi `contentScript.js` để chỉnh sửa từ đã chọn.
- **Backend local + web app:** Xây dựng Express.js REST API local với xác thực JWT, cùng trang web Study cơ bản để hiển thị danh sách thẻ đã lưu.

## Kết quả đạt được

- Prototype Manifest V3 hoạt động ổn định với lưu trữ dữ liệu ngoại tuyến qua `chrome.storage.local`.
- Xác nhận luồng thao tác local hoàn chỉnh: bôi đen từ → nhấp chuột phải → lưu → xem trong ứng dụng Study local.
- Commit mã nguồn đầu tiên được đẩy lên repository vào ngày 22/06/2026: *"Initial flashcard extension and study app."*
