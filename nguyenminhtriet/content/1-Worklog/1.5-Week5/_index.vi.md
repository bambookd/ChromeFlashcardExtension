---
title: "Nhật ký công việc Tuần 5"
date: 2026-07-13
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Tuần 5 — 13/07 – 19/07/2026

## Trọng tâm

Triển khai dự án trực tiếp lên AWS lần đầu tiên, đi kèm kiểm soát chi phí chặt chẽ ngay từ ngày đầu.

## Các công việc đã thực hiện

- **Chuẩn bị môi trường:** Thiết lập deployment credentials và sẵn sàng môi trường AWS SAM CLI cho việc triển khai.
- **Triển khai thực tế:** Thực thi `sam build` và `sam deploy --guided` để khởi tạo stack `chrome-flashcard-dev` tại region `ap-southeast-1`.
- **Xác minh tài nguyên:** Xác nhận mọi tài nguyên được tạo chính xác — HTTP API Gateway, Node.js Lambda (qua `serverless-http`), ba bảng DynamoDB và S3 bucket riêng tư cho việc export.
- **Kiểm soát chi phí:** Kiểm tra lại cảnh báo ngân sách, thiết lập thời gian lưu trữ CloudWatch logs thành 7 ngày và xác nhận cơ chế tự động giảm về 0 (scale-to-zero) cho compute.

## Kết quả đạt được

- Stack `chrome-flashcard-dev` hoạt động trực tiếp trên AWS.
- API health check xác nhận trả về `HTTP 200 OK`.
- Thiết lập lưu trữ log và hàng rào ngân sách được kích hoạt, giữ chi phí cố định dưới $5/tháng.
