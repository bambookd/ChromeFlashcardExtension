---
title: "Nhật ký công việc Tuần 6"
date: 2026-06-15
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Tuần 6 — 20/07 – 24/07/2026

## Mục tiêu

Các mục tiêu trọng tâm cho Tuần 6 bao gồm:

* Thực hiện kiểm thử tích hợp end-to-end các luồng nghiệp vụ ứng dụng trên môi trường AWS cloud live.
* Thiết lập định tuyến tên miền tùy chỉnh qua Amazon Route 53 cho `www.axiza.net` (AWS Amplify Hosting CDN) và `api.axiza.net` (API Gateway HTTP API).
* Cấp phát và xác minh chứng chỉ SSL/TLS công cộng thông qua AWS Certificate Manager (ACM).
* Kiểm tra và đảm bảo giao thức truyền thông mã hóa an toàn giữa Chrome Extension (MV3), Study Web Client và serverless backend API.
* Đánh giá độ trễ phản hồi của hệ thống và tiến hành các giải pháp tối ưu hóa hiệu năng ban đầu.

## Các Công việc Đã Thực hiện

| Nhiệm vụ | Trạng thái | Ngày Bắt đầu | Ngày Hoàn thành |
| :--- | :--- | :--- | :--- |
| Xây dựng các kịch bản kiểm thử tích hợp E2E bao gồm thu thập từ vựng, bộ nhớ đệm cục bộ, đồng bộ nền và xuất dữ liệu. | ✅ Hoàn thành | 20/07/2026 | 20/07/2026 |
| Khởi tạo và xác thực chứng chỉ số ACM SSL/TLS cho tên miền tùy chỉnh `axiza.net` và `*.axiza.net`. | ✅ Hoàn thành | 21/07/2026 | 21/07/2026 |
| Cấu hình các bản ghi Alias A/AAAA trong Route 53 Hosted Zone liên kết `axiza.net` tới Amplify và `api.axiza.net` tới API Gateway. | ✅ Hoàn thành | 21/07/2026 | 22/07/2026 |
| Kiểm tra chính sách truy cập tài nguyên (CORS), luồng thực thi Lambda và xử lý ghi dữ liệu theo lô trên DynamoDB qua custom domain. | ✅ Hoàn thành | 22/07/2026 | 23/07/2026 |
| Chẩn đoán và khắc phục các sự cố tích hợp phát sinh trong quá trình xác minh tên miền thực tế. | ✅ Hoàn thành | 23/07/2026 | 24/07/2026 |
| Tối ưu hóa thời gian khởi tạo Lambda cold start, phân phối tài nguyên tĩnh và tiến trình render phía frontend client. | ✅ Hoàn thành | 24/07/2026 | 24/07/2026 |
| Tái kiểm thử toàn bộ hệ thống qua các đầu endpoint tên miền tùy chỉnh (`https://axiza.net` & `https://api.axiza.net`). | ✅ Hoàn thành | 24/07/2026 | 24/07/2026 |

## Kết quả Đạt được

* Thiết lập thành công điều hướng tên miền tùy chỉnh cho `axiza.net` (Frontend Web Client) và `api.axiza.net` (Backend API) qua Amazon Route 53 & ACM.
* Xác minh tính tương tác và đồng bộ thông suốt giữa Chrome Extension (MV3), API Gateway, AWS Lambda, DynamoDB và Amazon S3.
* Cải thiện tốc độ phản hồi API và nâng cao hiệu suất hiển thị giao diện người dùng web client.
* Xác minh trạng thái vận hành ổn định của hệ thống thông qua kiểm tra health check (`curl https://api.axiza.net/api/health`).