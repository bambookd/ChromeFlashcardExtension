---
title: "Nhật ký công việc Tuần 3"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.3. </b> "
---

# Tuần 3 — 29/06 – 05/07/2026

### Mục tiêu

Các mục tiêu của Tuần 3 là:

* Cải thiện trải nghiệm học tập cốt lõi của ứng dụng flashcard (thẻ ghi nhớ).
* Phát triển một luồng (workflow) phiên học tập rõ ràng hơn để ôn tập từ vựng.
* Thêm các tính năng quản lý danh mục để sắp xếp các flashcard.
* Mở rộng ứng dụng web Học tập (Study) với một chế độ kiểm tra (test mode) bổ sung.
* Phân tích những hạn chế của nguyên mẫu lưu trữ và backend ở môi trường máy cá nhân (local) hiện tại.
* Xác định lộ trình chuyển đổi từ nguyên mẫu local sang kiến trúc serverless trên AWS.
* Chuẩn bị mô hình dữ liệu DynamoDB ban đầu và template AWS SAM cho việc triển khai trong tương lai.

### Các công việc cần thực hiện

| Nhiệm vụ | Trạng thái | Ngày bắt đầu | Ngày hoàn thành |
| :--- | :--- | :--- | :--- |
| Đánh giá tiện ích mở rộng Chrome và ứng dụng web Học tập hiện tại để xác định các tính năng phiên học tập còn thiếu và những hạn chế trong việc quản lý dữ liệu. | ✅ Hoàn thành | 29/06/2026 | 29/06/2026 |
| Thiết kế luồng phiên học tập, bao gồm thứ tự câu hỏi, theo dõi câu trả lời, tính toán tiến độ, xử lý khi hoàn thành và xem lại kết quả. | ✅ Hoàn thành | 30/06/2026 | 30/06/2026 |
| Triển khai các chức năng quản lý danh mục để người dùng có thể tạo, cập nhật, xóa và sử dụng các danh mục để phân loại flashcard. | ✅ Hoàn thành | 01/07/2026 | 03/07/2026 |
| Cải thiện ứng dụng web Học tập và thêm chế độ kiểm tra để thực hành từ vựng thông qua các câu hỏi có cấu trúc và đánh giá câu trả lời. | ✅ Hoàn thành | 03/07/2026 | 05/07/2026 |
| Xác định kiến trúc serverless ban đầu sử dụng Amazon API Gateway, AWS Lambda, Amazon DynamoDB, Amazon S3, IAM và Amazon CloudWatch. | ✅ Hoàn thành | 05/07/2026 | 05/07/2026 |
| Chuẩn bị cấu trúc thực thể (entity) DynamoDB ban đầu và phác thảo một template AWS SAM cho hạ tầng backend. | ✅ Hoàn thành | 05/07/2026 | 05/07/2026 |

### Kết quả

* Đã cải thiện luồng phiên học tập flashcard và tính năng theo dõi câu trả lời.
* Bổ sung tính năng quản lý danh mục và một chế độ kiểm tra có cấu trúc.
* Xác định xong kiến trúc serverless AWS ban đầu và mô hình dữ liệu DynamoDB.
* Chuẩn bị bản phác thảo template AWS SAM để triển khai trong tương lai.