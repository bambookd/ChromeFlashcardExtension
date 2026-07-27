---
title: "Giải phóng Tài nguyên & Đánh giá Vận hành"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Tóm tắt Quy trình Giải phóng Tài nguyên & Vận hành

Phần này chi tiết hóa các bước giải phóng tài nguyên (Teardown Procedures), quy trình hủy stack tự động, quản lý chi phí vận hành và các thao tác kiểm soát (Post-Operational Audit) đối với hạ tầng AWS Cloud đã triển khai cho stack `chrome-flashcard-axiza` với tên miền tùy chỉnh `axiza.net`.

#### Quy trình Hủy Triển khai Hạ tầng Tự động (Automated Decommissioning)

Để ngăn ngừa phát sinh chi phí phát sinh ngoài ý muốn và bảo đảm thu hồi toàn bộ tài nguyên đám mây sau khi kết thúc đánh giá dự án, quy trình hủy triển khai được thực thi theo thứ tự:

1. **Gỡ bỏ Bản ghi Route 53 Custom Domains**:
   Thu hồi các bản ghi Alias A-record của tên miền tùy chỉnh (`axiza.net` và `api.axiza.net`) khỏi Hosted Zone Route 53 `axiza.net`:
   ```bash
   # Xóa bản ghi Alias apex domain axiza.net
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "DELETE",
         "ResourceRecordSet": {
           "Name": "axiza.net",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2",
             "DNSName": "d123456789abcdef.amplifyapp.com",
             "EvaluateTargetHealth": false
           }
         }
       }]
     }'

   # Xóa bản ghi Alias subdomain api.axiza.net
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "DELETE",
         "ResourceRecordSet": {
           "Name": "api.axiza.net",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2",
             "DNSName": "<api-id>.execute-api.ap-southeast-1.amazonaws.com",
             "EvaluateTargetHealth": false
           }
         }
       }]
     }'
   ```

2. **Dọn dẹp Dữ liệu Lưu trữ (Storage Purging Stage)**:
   Trước khi tiến hành hủy CloudFormation Stack, toàn bộ dữ liệu trong Private S3 Export Bucket và S3 Bucket của Amplify Frontend được xóa hoàn toàn:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

3. **Hủy Stack CloudFormation (CloudFormation Stack Destruction)**:
   Thực thi lệnh xóa stack từ công cụ AWS SAM CLI để hủy toàn bộ tài nguyên đã được khởi tạo trong `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Danh mục Tài nguyên Hạ tầng Đã Thu hồi (Decommissioned Infrastructure Inventory)

Quy trình gỡ bỏ tự động đã giải phóng hoàn toàn các tài nguyên đám mây sau:

| Tài nguyên AWS | Tên / Định danh Tài nguyên | Hành động Thu hồi |
|---|---|---|
| **Bản ghi Route 53** | `axiza.net` & `api.axiza.net` | Xóa các bản ghi Alias A-record điều hướng tới AWS Amplify và API Gateway trong Hosted Zone `axiza.net` |
| **AWS Amplify** | `Amplify App` (`chrome-flashcard-axiza`) | Hủy liên kết tên miền `axiza.net` và thu hồi trình phân phối giao diện web frontend |
| **API Gateway** | `HttpApi` (`api.axiza.net`) | Hủy cấu hình tên miền tùy chỉnh và thu hồi các HTTP Endpoints |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-axiza-*`) | Xóa hàm tính toán, môi trường thực thi và IAM Execution Role |
| **Bảng DynamoDB** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Xóa hoàn toàn các bảng NoSQL và thu hồi năng lực tính toán RCU/WCU |
| **Amazon S3** | Static Web Bucket & `ExportBucket` | Xóa các Bucket Policy và container lưu trữ tập tin |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Gỡ bỏ chính sách truy cập và xóa các vai trò (Roles) tương ứng |

#### Xác minh & Kiểm soát Sau Vận hành (Post-Operational Audit)

Quy trình giải phóng tài nguyên được xác minh thực tế thông qua bộ công cụ AWS CLI:

1. **Kiểm soát CloudFormation Stack**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-axiza --region ap-southeast-1
   ```
   **Kết quả kỳ vọng (Expected Output)**: `Stack with id chrome-flashcard-axiza does not exist` (Xác nhận stack đã bị hủy).

2. **Kiểm soát Bảng DynamoDB**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   **Kết quả kỳ vọng (Expected Output)**: Xác minh không còn bảng dữ liệu nào thuộc về dự án trên AWS Region.

3. **Kiểm soát Nhật ký CloudWatch Logs**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   **Kết quả kỳ vọng (Expected Output)**: Các nhóm nhật ký đã được dọn dẹp hoặc cài đặt chu kỳ lưu trữ ngắn, hoàn tất toàn bộ quy trình thu hồi hệ thống.

#### Kết luận

Dự án đã chứng minh thành công tính hiệu quả của mô hình **offline-first Chrome Extension (MV3)** tích hợp cùng giao diện frontend lưu trữ trên **AWS Amplify Hosting** (kết nối S3 bucket) phục vụ dưới tên miền tùy chỉnh `axiza.net` quản lý bởi **Amazon Route 53**, kết hợp với hạ tầng backend API serverless bảo mật, linh hoạt trên tên miền tùy chỉnh `api.axiza.net`. Đánh giá vận hành khẳng định hệ thống hoạt động ổn định, bảo đảm tính nhất quán dữ liệu và khả năng làm chủ hoàn toàn vòng đời tài nguyên trên đám mây AWS.
