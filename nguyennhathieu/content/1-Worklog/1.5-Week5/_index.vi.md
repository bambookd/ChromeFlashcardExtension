---
title: "Nhật ký công việc Tuần 5"
date: 2026-07-13
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Tuần 5 — 13/07 – 19/07/2026

## Tổng quan

Triển khai AWS MVP và khắc phục các lỗi tích hợp đầu tiên.

## Công việc cần thực hiện

* Triển khai các thành phần AWS của MVP.
* Kết nối Extension và Study với cloud API.
* Kiểm thử bảo mật truy cập và xuất dữ liệu.
* Tiếp tục công việc Tuần 4: kiểm thử tích hợp cloud từ Extension đến DynamoDB.

## Công việc đã thực hiện

* Deploy API Gateway HTTP API, Lambda và ba bảng DynamoDB.
* Tạo private S3 bucket cho export và pre-signed URL.
* Cập nhật API endpoint cho Extension và Study.
* Sửa lỗi CORS giữa Chrome Extension, S3 origin và API Gateway.
* Tiếp tục kiểm thử bị hoãn từ Tuần 4 và xác minh dữ liệu được lưu đúng theo từng người dùng trong DynamoDB.
* Tổ chức team meetup để đánh giá kết quả deployment, cùng phân tích lỗi CORS và thống nhất checklist kiểm thử E2E.

## Kết quả

Các API chính hoạt động trên AWS. Công việc kiểm thử tích hợp chưa hoàn thành ở Tuần 4 đã được tiếp tục và hoàn tất trong Tuần 5.
