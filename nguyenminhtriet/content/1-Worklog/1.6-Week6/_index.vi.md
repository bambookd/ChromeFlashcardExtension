---
title: "Nhật ký công việc Tuần 6"
date: 2026-07-20
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Tuần 6 — 20/07 – 26/07/2026

## Mục tiêu

- Chạy kiểm thử end-to-end hoàn chỉnh trên môi trường AWS thực tế.
- Trỏ các custom domain đến đúng dịch vụ qua Route 53 — `www.axiza.net` tới Amplify Hosting, `api.axiza.net` tới API Gateway HTTP API.
- Cấp chứng chỉ SSL/TLS công khai qua AWS Certificate Manager (ACM).
- Xác minh giao tiếp an toàn giữa extension, ứng dụng web và backend API.
- Đo lường và cải thiện thời gian phản hồi của hệ thống.

## Nhật ký công việc

| Nhiệm vụ | Trạng thái | Bắt đầu | Hoàn thành |
| --- | --- | --- | --- |
| Viết kịch bản kiểm thử E2E cho lưu thẻ, bộ nhớ offline, batch sync và export | Hoàn thành | 20/07/2026 | 20/07/2026 |
| Yêu cầu cấp chứng chỉ ACM cho `axiza.net` và `*.axiza.net` | Hoàn thành | 21/07/2026 | 21/07/2026 |
| Thiết lập Route 53 Alias A/AAAA records — `axiza.net` → Amplify, `api.axiza.net` → API Gateway | Hoàn thành | 21/07/2026 | 22/07/2026 |
| Xác minh gọi API, thực thi Lambda, ghi DynamoDB batch và CORS trên `https://axiza.net` | Hoàn thành | 22/07/2026 | 23/07/2026 |
| Xử lý các sự cố phát hiện trong quá trình kiểm thử domain | Hoàn thành | 23/07/2026 | 24/07/2026 |
| Tối ưu Lambda cold start, tải static assets và client-side rendering | Hoàn thành | 24/07/2026 | 24/07/2026 |
| Chạy lại toàn bộ luồng trên custom domain để đảm bảo độ ổn định | Hoàn thành | 24/07/2026 | 24/07/2026 |

## Kết quả đạt được

- Các custom domain hoạt động chính thức: `axiza.net` (frontend) và `api.axiza.net` (backend), được điều hướng qua Route 53 và ACM.
- Tích hợp hoàn chỉnh giữa Extension, API Gateway, Lambda, DynamoDB và S3.
- Cải thiện rõ rệt tốc độ phản hồi và thời gian render frontend.
- Xác minh health check: `curl https://api.axiza.net/api/health`.
