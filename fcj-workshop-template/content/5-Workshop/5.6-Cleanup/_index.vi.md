---
title: "Resource Teardown & Operational Verification"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Tóm tắt Quy trình Giải phóng Tài nguyên & Đánh giá Vận hành

Phần này tài liệu hóa quy trình giải phóng tài nguyên dự kiến, luồng hủy CloudFormation stack, các biện pháp quản lý chi phí và các bước kiểm tra xác nhận sau khi vận hành đối với hạ tầng đám mây AWS (`chrome-flashcard-axiza`) dưới các tên miền `www.axiza.net` và `api.axiza.net`.

#### Quy trình Tự động Hủy Tài nguyên Dự kiến

Để tránh phát sinh chi phí không cần thiết và bảo đảm giải phóng hoàn toàn tài nguyên sau khi kết thúc đánh giá workshop, quy trình hủy tài nguyên được thiết kế để thực thi theo các bước sau:

1. **Dọn dẹp Bản ghi Tên miền Tùy chỉnh trên Route 53**:
   Xóa các tập bản ghi tên miền tùy chỉnh (bản ghi CNAME `www.axiza.net` và bản ghi Alias A-record `api.axiza.net`) khỏi Hosted Zone `axiza.net`:
   ```bash
   # Xóa bản ghi CNAME của tên miền chuẩn www.axiza.net
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "DELETE",
         "ResourceRecordSet": {
           "Name": "www.axiza.net",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [{"Value": "d123456789abcdef.amplifyapp.com"}]
         }
       }]
     }'

   # Xóa bản ghi Alias A-record của subdomain backend api.axiza.net trỏ vào API Gateway Regional endpoint
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "DELETE",
         "ResourceRecordSet": {
           "Name": "api.axiza.net",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "Z2FDTNDATAQYW2",
             "DNSName": "d-xxxx.execute-api.ap-southeast-1.amazonaws.com",
             "EvaluateTargetHealth": false
           }
         }
       }]
     }'
   ```

2. **Giai đoạn Xóa Dữ liệu Lưu trữ**:
   Trước khi tiến hành xóa CloudFormation stack, toàn bộ các đối tượng file JSON export trong S3 export bucket private sẽ được dọn sạch:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

3. **Thực thi Hủy CloudFormation Stack**:
   Sử dụng lệnh xóa stack của SAM CLI để hủy toàn bộ các tài nguyên đã định nghĩa trong `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Danh mục Hạ tầng Sẽ Giải phóng

Khi lệnh hủy stack tự động được thực thi, các tài nguyên AWS cloud sau đây sẽ được giải phóng và loại bỏ hoàn toàn:

| Tài nguyên AWS | Tên Tài nguyên / Pattern | Hành động Thực hiện |
|---|---|---|
| **Bản ghi Route 53** | `www.axiza.net` & `api.axiza.net` | Xóa bản ghi CNAME (`www.axiza.net`) và bản ghi Alias A-record (`api.axiza.net`) trong hosted zone `axiza.net` |
| **AWS Amplify** | `Amplify App` (`chrome-flashcard-axiza`) | Hủy liên kết tên miền `www.axiza.net` và giải phóng host ứng dụng web |
| **API Gateway** | `HttpApi` (`api.axiza.net`) | Chấm dứt mapping tên miền tùy chỉnh và hủy các HTTP API endpoint |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-axiza-*`) | Xóa Lambda function, môi trường thực thi và IAM Execution Role |
| **DynamoDB Tables** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Xóa các bảng NoSQL (chấm dứt chế độ tính phí `PAY_PER_REQUEST` On-Demand) |
| **Amazon S3** | Private `ExportBucket` | Xóa chính sách bucket và giải phóng container lưu trữ private export |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Gỡ bỏ và xóa các chính sách cấp quyền role |

#### Đánh giá & Kiểm tra Xác nhận sau khi Hủy Tài nguyên

Sau khi thực thi lệnh dọn dẹp, quy trình kiểm tra xác nhận được tiến hành bằng AWS CLI để chứng minh tài nguyên đã được xóa sạch hoàn toàn:

1. **Kiểm tra CloudFormation Stack**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-axiza --region ap-southeast-1
   ```
   **Kết quả dự kiến**: `Stack with id chrome-flashcard-axiza does not exist` (Xác nhận stack không còn tồn tại).

2. **Kiểm tra DynamoDB Tables**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   **Kết quả dự kiến**: Xác nhận không còn bất kỳ bảng dữ liệu nào của dự án.

3. **Kiểm tra CloudWatch Log Groups**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   **Kết quả dự kiến**: Xác nhận các log group đã bị xóa hoặc hết hạn lưu trữ.

#### Kết luận & Thực tiễn Vận hành Đã rút ra

Quy trình triển khai và dọn dẹp có tính lặp lại chứng minh lợi ích vượt trội của Hạ tầng dưới dạng Mã (IaC) thông qua AWS SAM. Việc quản lý toàn bộ tài nguyên qua tệp cấu hình giúp lập trình viên kiểm soát môi trường đám mây, tuân thủ các quy tắc bảo mật và giải phóng tài nguyên một cách an toàn mà không để lại các tài nguyên mồ côi gây phát sinh chi phí.
