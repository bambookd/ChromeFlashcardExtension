---
title: "Giải phóng Tài nguyên & Đánh giá Vận hành"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Tóm tắt Quy trình Teardown & Vận hành

Phần này mô tả chi tiết quy trình teardown (giải phóng) tài nguyên, workflow hủy stack, quản lý chi phí và các bước kiểm tra (audit) sau vận hành cho hạ tầng AWS cloud đã triển khai.

#### Quy trình Decommission (Gỡ bỏ) Hạ tầng Tự động

Để tránh phát sinh chi phí không cần thiết và đảm bảo dọn dẹp toàn bộ tài nguyên sau khi hoàn tất đánh giá dự án, quy trình teardown được thực thi theo các bước:

1. **Giai đoạn Xóa Dữ liệu**:
   Trước khi xóa CloudFormation stack, toàn bộ object trong private và public S3 bucket đều được xóa sạch:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

2. **Hủy CloudFormation Stack (Stack Deletion)**:
   Chạy lệnh xóa stack của SAM CLI để hủy toàn bộ tài nguyên đã được provision trong `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Danh mục các tài nguyên hạ tầng đã gỡ bỏ (Decommissioned)

Quá trình gỡ bỏ stack tự động đã giải phóng thành công các tài nguyên cloud sau:

| Tài nguyên AWS | Tên / Pattern Tài nguyên | Hành động Thực hiện |
|---|---|---|
| **API Gateway** | `HttpApi` (`chrome-flashcard-dev-*`) | Hủy và giải phóng các HTTP endpoint |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-dev-*`) | Xóa function, runtime container và IAM Execution Role |
| **Bảng DynamoDB** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Xóa các bảng và giải phóng RCU/WCU đã provision |
| **Amazon S3** | `ExportBucket` | Xóa bucket policy và container lưu trữ |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Gỡ liên kết policy và xóa role |

#### Kiểm tra & Audit Sau Vận hành

Việc hoàn tất quy trình teardown được xác minh trực tiếp bằng AWS CLI:

1. **Kiểm tra CloudFormation Stack**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1
   ```
   *Kết quả*: `Stack with id chrome-flashcard-dev does not exist` (Đã xác nhận trạng thái).

2. **Kiểm tra Bảng DynamoDB**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   *Kết quả*: Xác minh không còn bảng nào liên quan đến dự án.

3. **Kiểm tra Log Group CloudWatch**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   *Kết quả*: Các log group đã được dọn dẹp thành công hoặc cấu hình thời hạn lưu trữ (retention window) ngắn, hoàn tất quá trình decommission hệ thống.

#### Kết luận

Dự án đã chứng minh sự hiệu quả của mô hình **offline-first Chrome Extension (MV3)** kết hợp với hạ tầng **AWS Serverless** bảo mật và có khả năng mở rộng (API Gateway, Lambda, DynamoDB và S3). Quá trình kiểm thử khẳng định hệ thống vận hành ổn định, cơ chế đồng bộ dữ liệu tin cậy và khả năng kiểm soát hoàn toàn vòng đời (lifecycle) tài nguyên trên cloud.
