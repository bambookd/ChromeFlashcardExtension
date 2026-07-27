---
title: "Nhật ký công việc Tuần 3"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.3. </b> "
---

# Tuần 3 — 29/06 – 05/07/2026

## Tổng quan

Logic phiên học, quản lý danh mục, Express.js REST API, và template DynamoDB SAM.

### Các Công việc Đã Thực hiện

* **Thuật toán Phiên học Active Recall**: Thiết kế và triển khai luồng ôn tập chính, bao gồm sắp xếp câu hỏi, ghi nhận câu trả lời, tính toán tiến độ và đánh giá mức độ khó của từ vựng.
* **Quản lý Danh mục (Categories)**: Xây dựng các chức năng CRUD danh mục cho phép người dùng phân loại thẻ học theo chủ đề hoặc cấp độ.
* **Tối ưu Express.js REST API**: Mở rộng các endpoint backend Express.js local hỗ trợ lọc thẻ, gán danh mục và cấu trúc dữ liệu đa người dùng.
* **Mô hình Dữ liệu DynamoDB & SAM Template**: Thiết kế cấu trúc bảng NoSQL (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) và biên soạn bản thảo file hạ tầng AWS SAM (`infra/template.yaml`).

### Kết quả Đạt được

* **Logic Sản phẩm Cốt lõi**: Hoàn thành luồng phiên học ôn tập Active Recall và tính năng quản lý danh mục từ vựng.
* **Hạ tầng Backend SAM**: Tạo file template `template.yaml` khởi tạo hạ tầng AWS SAM chứa định nghĩa các bảng DynamoDB, API Gateway HTTP API và Lambda function.