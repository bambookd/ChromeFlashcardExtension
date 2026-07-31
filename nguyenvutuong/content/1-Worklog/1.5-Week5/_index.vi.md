---
title: "Nhật ký công việc Tuần 5"
date: 2026-06-15
weight: 5
chapter: false
pre: " <b> 1.5. </b> "
---

# Tuần 5 — 13/07 – 19/07/2026

## Tổng quan

Triển khai thực tế lần đầu lên AWS cloud, deploy SAM stack, và thiết lập guardrail chi phí.

### Các Công việc Đã Thực hiện

* **Chuẩn bị Môi trường AWS Cloud**: Cấu hình quyền triển khai IAM và chuẩn bị công cụ AWS SAM CLI để tạo stack đám mây thực tế.
* **Deploy AWS SAM Stack**: Thực thi các lệnh `sam build` và `sam deploy --guided` triển khai stack đám mây đầu tiên (`chrome-flashcard-dev`) tại khu vực `ap-southeast-1`.
* **Xác minh Tài nguyên Khởi tạo**: Kiểm tra tính hoạt động của các tài nguyên AWS: API Gateway HTTP API, AWS Lambda Function (`serverless-http`), 3 bảng DynamoDB NoSQL (`UsersTable`, `FlashcardsTable`, `CategoriesTable`), và private S3 export bucket.
* **Guardrail Chi phí**: Xác minh cảnh báo ngân sách AWS Budgets, cấu hình quy tắc lưu vết nhật ký CloudWatch Log Group 7 ngày và kích hoạt chế độ scale-to-zero.

### Kết quả Đạt được

* **Live Cloud Stack**: Triển khai thành công hạ tầng đám mây thực tế stack `chrome-flashcard-dev`.
* **Endpoint Vận hành**: Kiểm tra endpoint API thực tế trả về phản hồi `HTTP 200 OK`.
* **Bảo vệ Tài chính**: Áp dụng thành công các rào chắn ngân sách bảo đảm chi phí duy trì dưới $5 USD/tháng.