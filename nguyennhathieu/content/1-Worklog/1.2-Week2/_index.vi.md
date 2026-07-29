---
title: "Nhật ký công việc Tuần 2"
date: 2026-06-22
weight: 2
chapter: false
pre: " <b> 1.2. </b> "
---

# Tuần 2 — 22/06 – 28/06/2026

## Tổng quan

Nghiên cứu kiến trúc Chrome Extension và xây dựng prototype trước khi kết nối cloud.

## Công việc cần thực hiện

* Mô hình hoạt động của Chrome Extension Manifest V3 và giới hạn của service worker.
* Quyền truy cập cần thiết cho menu ngữ cảnh, lưu trữ và tương tác với trang web.
* Sự khác nhau giữa lưu trữ local, đồng bộ cloud và chiến lược offline-first.
* Nguyên tắc UI/UX cho form nhập nhanh, thông báo trạng thái và xử lý lỗi.

## Công việc đã thực hiện

* Tạo thao tác lưu từ thông qua menu ngữ cảnh.
* Hiển thị form để người dùng kiểm tra từ, nghĩa, loại từ và danh mục.
* Lưu flashcard tạm thời trong bộ nhớ trình duyệt.
* Thiết kế popup để xem, sửa.
* Kiểm thử luồng trên nhiều trang web và ghi nhận các trường hợp bị giới hạn quyền.

## Kết quả

Luồng bôi đen từ → mở form → lưu local hoạt động ổn định. Prototype vẫn chưa có đăng nhập hoặc đồng bộ giữa nhiều trình duyệt, nên đây là đầu vào cho thiết kế backend ở Tuần 3.
