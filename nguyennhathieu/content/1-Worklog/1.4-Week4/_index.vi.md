---
title: "Nhật ký công việc Tuần 4"
date: 2026-07-06
weight: 4
chapter: false
pre: " <b> 1.4. </b> "
---

# Tuần 4 — 06/07 – 12/07/2026

## Tổng quan

Chuẩn bị backend cho Lambda và thiết kế dữ liệu DynamoDB.

## Công việc cần thực hiện

* Chuẩn bị backend để có thể chạy trên AWS Lambda.
* Thiết kế dữ liệu phù hợp với DynamoDB.
* Xây dựng hạ tầng serverless có thể triển khai lặp lại.
* Triển khai môi trường cloud và kiểm thử tích hợp từ Extension đến DynamoDB.

## Công việc đã thực hiện

* Tách logic ứng dụng khỏi tiến trình chạy local để backend tương thích với Lambda.
* Thiết kế ba bảng Users, Flashcards và Categories.
* Tạo AWS SAM template và cấu hình CORS bằng biến môi trường.

## Kết quả

Backend chạy được ở cả local và chế độ tương thích Lambda; SAM template đã sẵn sàng.

**Công việc chưa hoàn thành:** Chưa thể kiểm thử tích hợp cloud từ Extension đến DynamoDB vì stack AWS chưa được triển khai
