---
title: "Nhật ký công việc Tuần 3"
date: 2026-06-29
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Tuần 3 — 29/06 – 05/07/2026

## Tổng quan

Nghiên cứu thiết kế backend, xác thực và mô hình dữ liệu trước khi xây dựng REST API cùng trang Study chạy local.

## Công việc cần thực hiện

* Nguyên tắc REST, HTTP method, status code và định dạng phản hồi API nhất quán.
* Khác biệt giữa xác thực và phân quyền; cách JWT bảo vệ các thao tác của người dùng.
* Băm mật khẩu, kiểm tra dữ liệu đầu vào và tránh để lộ thông tin nhạy cảm.
* So sánh mô hình dữ liệu dạng file với NoSQL và cách phân tách dữ liệu theo người dùng.
* Active Recall, chọn flashcard ngẫu nhiên và quản lý danh mục phục vụ việc ôn tập.
* CORS và lý do Extension, ứng dụng web và backend cần cấu hình origin phù hợp.

## Công việc đã thực hiện

* Xây dựng đăng ký, đăng nhập và bảo vệ các API yêu cầu xác thực.
* Hoàn thiện các thao tác quản lý flashcard, category và chọn thẻ ngẫu nhiên.
* Tạo lớp lưu trữ local để có thể thay thế bằng DynamoDB ở giai đoạn sau.
* Phát triển giao diện Study và luồng đồng bộ từ Extension.
* Kiểm thử dữ liệu của nhiều người dùng để tránh truy cập nhầm flashcard.
* Tổ chức team meetup để trình bày prototype local, thống nhất API contract và phân chia công việc chuẩn bị chuyển sang AWS.

## Kết quả

Ứng dụng local hoàn thành luồng đăng nhập, đồng bộ, quản lý và ôn tập. Nhóm xác định cần chuẩn hóa khóa người dùng và khóa flashcard trước khi chuyển dữ liệu sang DynamoDB.
