---
title: "Nhật ký công việc Tuần 3"
date: 2026-06-29
weight: 3
chapter: false
pre: " <b> 1.3. </b> "
---

# Tuần 3 — 29/06 – 05/07/2026

## Trọng tâm

Phát triển logic phiên học, hệ thống danh mục, mở rộng API và biên soạn bản thiết kế hạ tầng ban đầu.

## Các công việc đã thực hiện

- **Thuật toán phiên học:** Xây dựng luồng ôn tập Active Recall — sắp xếp thứ tự câu hỏi, theo dõi câu trả lời, tính toán tiến độ và đánh giá mức độ khó.
- **Quản lý danh mục:** Thêm các thao tác CRUD hoàn chỉnh cho danh mục để phân loại thẻ theo chủ đề hoặc độ khó.
- **Mở rộng API:** Phát triển backend Express.js để xử lý lọc thẻ, liên kết danh mục và cấu trúc dữ liệu đa người dùng.
- **Mô hình dữ liệu + Bản thảo SAM:** Thiết kế schema DynamoDB (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) và viết bản thảo đầu tiên của `infra/template.yaml`.

## Kết quả đạt được

- Logic phiên học Active Recall và tính năng quản lý danh mục hoạt động hoàn chỉnh.
- Bản thảo `template.yaml` định nghĩa các bảng DynamoDB, HTTP API Gateway và Lambda functions.
