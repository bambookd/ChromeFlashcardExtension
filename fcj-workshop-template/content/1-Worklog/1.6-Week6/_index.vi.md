---
title: "Nhật ký công việc Tuần 6"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.6. </b> "
---

# Tuần 6 — 20/07 – 26/07/2026

## Mục tiêu

Các mục tiêu cho Tuần 6 bao gồm:

* Kiểm thử toàn diện các luồng công việc (Workflows) end-to-end trên môi trường AWS thực tế.
* Cấu hình điều hướng tên miền tùy chỉnh trên Amazon Route 53 cho `axiza.net` (AWS Amplify Hosting + S3) và `api.axiza.net` (API Gateway HTTP API).
* Cấp phát chứng chỉ số SSL/TLS công cộng thông qua dịch vụ AWS Certificate Manager (ACM).
* Xác minh tính giao tiếp bảo mật giữa Chrome Extension (MV3), Study Web App và serverless backend API.
* Đánh giá thời gian phản hồi hệ thống và tối ưu hóa hiệu năng ứng dụng.

## Các Công việc Đã Thực hiện

| Nhiệm vụ | Trạng thái | Ngày Bắt đầu | Ngày Hoàn thành |
| :--- | :--- | :--- | :--- |
| Chuẩn bị kịch bản kiểm thử E2E cho thu thập từ vựng, lưu trữ local đệm, đồng bộ cloud hàng loạt và xuất dữ liệu. | ✅ Hoàn thành | 20/07/2026 | 20/07/2026 |
| Khởi tạo và xác thực chứng chỉ số ACM SSL/TLS cho tên miền tùy chỉnh `axiza.net` và `*.axiza.net`. | ✅ Hoàn thành | 21/07/2026 | 21/07/2026 |
| Cấu hình các bản ghi Alias A/AAAA trong Route 53 Hosted Zone điều hướng `axiza.net` về Amplify và `api.axiza.net` về API Gateway. | ✅ Hoàn thành | 21/07/2026 | 22/07/2026 |
| Xác minh request API, thực thi Lambda, thao tác batch trên DynamoDB và chính sách cấp quyền CORS cho `https://axiza.net`. | ✅ Hoàn thành | 22/07/2026 | 23/07/2026 |
| Khắc phục các vấn đề chức năng và tích hợp phát sinh trong quá trình kiểm thử custom domain. | ✅ Hoàn thành | 23/07/2026 | 24/07/2026 |
| Tối ưu độ trễ cold start của Lambda, thời gian tải static assets và tốc độ render phía frontend client. | ✅ Hoàn thành | 24/07/2026 | 25/07/2026 |
| Kiểm thử lại toàn bộ luồng ứng dụng qua tên miền tùy chỉnh và xác nhận tính ổn định E2E. | ✅ Hoàn thành | 25/07/2026 | 26/07/2026 |

## Kết quả Đạt được

* Cấu hình thành công điều hướng tên miền tùy chỉnh cho `axiza.net` (Frontend Web) và `api.axiza.net` (Backend API) qua Amazon Route 53 & ACM.
* Xác minh tích hợp thông suốt giữa Chrome Extension, API Gateway, AWS Lambda, DynamoDB và Amazon S3.
* Cải thiện thời gian phản hồi của ứng dụng và tốc độ hiển thị giao diện người dùng.
* Xác minh lệnh kiểm tra sức khỏe hệ thống thành công tại `curl https://api.axiza.net/api/health`.