---
title: "Giải phóng Tài nguyên & Đánh giá Vận hành"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Tóm tắt Teardown & Vận hành

Phần này trình bày chi tiết quy trình teardown tài nguyên, workflow hủy stack, quản lý chi phí và các bước xác minh sau vận hành cho hạ tầng AWS cloud đã triển khai.

#### Quy trình Decommission Hạ tầng Tự động

Để tránh phát sinh chi phí không cần thiết và đảm bảo dọn dẹp toàn bộ tài nguyên sau khi hoàn tất đánh giá dự án, quy trình teardown được thực thi theo các bước:

1. **Giai đoạn Xóa sạch Dữ liệu**:
   Trước khi xóa CloudFormation stack, toàn bộ object trong private và public S3 bucket đều được dọn dẹp sạch:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

2. **Hủy CloudFormation Stack**:
   Chạy lệnh xóa stack của SAM CLI để hủy toàn bộ tài nguyên đã được provision trong `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Danh mục Hạ tầng đã Decommission

Quá trình gỡ bỏ stack tự động đã giải phóng thành công các tài nguyên đám mây sau:

| Tài nguyên AWS | Tên / Pattern Tài nguyên | Hành động Thực hiện |
|---|---|---|
| **API Gateway** | `HttpApi` (`chrome-flashcard-backend-*`) | Đã hủy & giải phóng các HTTP endpoint |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-backend-*`) | Đã xóa function, runtime container & IAM Execution Role |
| **Bảng DynamoDB** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Đã xóa các bảng & giải phóng RCU/WCU đã provision |
| **Amazon S3** | `ExportBucket` | Đã xóa bucket policy và container lưu trữ |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Đã gỡ liên kết policy và xóa role |

#### Xác minh & Audit Sau Vận hành

Việc hoàn tất quy trình teardown được xác minh trực tiếp bằng AWS CLI:

1. **CloudFormation Audit**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-backend
   ```
   *Kết quả*: `Stack with id chrome-flashcard-backend does not exist` (Đã xác nhận trạng thái).

2. **DynamoDB Audit**:
   ```bash
   aws dynamodb list-tables
   ```
   *Kết quả*: Xác minh không còn bảng nào liên quan đến dự án.

3. **CloudWatch Log Audit**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard"
   ```
   *Kết quả*: Các log group đã được dọn dẹp thành công hoặc đặt retention window ngắn, hoàn tất quá trình decommission hệ thống.

#### Kết luận Dự án

Dự án đã chứng minh thành công mô hình **offline-first Chrome Extension (MV3)** kết hợp với hạ tầng **AWS Serverless** bảo mật và có khả năng mở rộng (API Gateway, Lambda, DynamoDB, Amazon Translate và S3). Quá trình xác minh hệ thống khẳng định sự ổn định khi vận hành, cơ chế đồng bộ dữ liệu tin cậy và khả năng quản lý hoàn chỉnh vòng đời tài nguyên trên cloud.
