---
title: "Triển khai Backend Serverless & Hạ tầng AWS"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Tổng quan Quy trình Triển khai

Phần này chi tiết hóa khai báo Hạ tầng dưới dạng Mã (Infrastructure as Code - IaC), quy trình đóng gói serverless stack và các bước triển khai lên nền tảng AWS cho stack `chrome-flashcard-axiza` kết hợp với tên miền tùy chỉnh `axiza.net` thông qua công cụ **AWS SAM (Serverless Application Model)**.

#### Khai báo Hạ tầng dưới dạng Mã (`infra/template.yaml`)

Toàn bộ hạ tầng serverless được định nghĩa theo chuẩn AWS Serverless Application Model specification. Chi tiết cấu hình tài nguyên chính bao gồm:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: Template triển khai backend serverless cho chrome-flashcard-axiza trên axiza.net.

Parameters:
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key dùng để xác thực chữ ký JWT.
  AllowedOrigins:
    Type: String
    Default: "https://axiza.net"
    Description: Các origin được phép truy cập cho API Gateway CORS validation.

Globals:
  Function:
    Runtime: nodejs24.x
    Timeout: 15
    MemorySize: 256
    Environment:
      Variables:
        DATA_STORE: dynamodb
        USERS_TABLE: !Ref UsersTable
        FLASHCARDS_TABLE: !Ref FlashcardsTable
        CATEGORIES_TABLE: !Ref CategoriesTable
        EXPORT_BUCKET: !Ref ExportBucket
        JWT_SECRET: !Ref JwtSecret
        SERVE_STUDY_STATIC: "false"

Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowMethods: [GET, POST, PUT, DELETE, OPTIONS]
        AllowHeaders: [Content-Type, Authorization]
        AllowOrigins: !Split [",", !Ref AllowedOrigins]

  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ../backend/
      Handler: lambda.handler
      Policies:
        - DynamoDBCrudPolicy: { TableName: !Ref UsersTable }
        - DynamoDBCrudPolicy: { TableName: !Ref FlashcardsTable }
        - DynamoDBCrudPolicy: { TableName: !Ref CategoriesTable }
        - S3CrudPolicy: { BucketName: !Ref ExportBucket }
      Events:
        HttpApi:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /{proxy+}
            Method: ANY
```

#### Quy trình Xây dựng & Triển khai (Build & Deployment Workflow)

1. **Giai đoạn Đóng gói Tài nguyên (Artifact Compilation Stage)**:
   ```bash
   cd infra
   sam build
   ```
   AWS SAM kiểm tra tính hợp lệ của `template.yaml`, tự động tải các gói phụ thuộc (production dependencies) và biên dịch gói nén zip tối ưu cho môi trường thực thi Node.js.

2. **Khởi tạo Stack trên CloudFormation (Provisioning Stage)**:
   ```bash
   sam deploy --guided
   ```
   Các tham số cấu hình được thiết lập trong quá trình triển khai:
   - **Stack Name**: `chrome-flashcard-axiza`
   - **Target Region**: `ap-southeast-1`
   - **Parameter JwtSecret**: *(Chuỗi khóa bí mật được bảo mật tại thời điểm triển khai)*
   - **Parameter AllowedOrigins**: `https://axiza.net`

3. **Cấu hình Tên miền Tùy chỉnh trên Amazon Route 53 (`axiza.net` & `api.axiza.net`)**:
   Khởi tạo liên kết tên miền tùy chỉnh trong Hosted Zone của Route 53 cho tên miền apex `axiza.net` (điều hướng tới AWS Amplify Hosting) và subdomain `api.axiza.net` (điều hướng tới API Gateway HTTP API):
   ```bash
   # Điều hướng apex domain axiza.net tới AWS Amplify Hosting
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
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

   # Điều hướng subdomain api.axiza.net tới API Gateway HTTP API
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
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

4. **Tổng hợp Tài nguyên Đám mây được Khởi tạo (Provisioned Resources Summary)**:
   - `AWS::Route53::RecordSet` -> Bản ghi Alias A-record điều hướng apex domain `axiza.net` về AWS Amplify Hosting và subdomain `api.axiza.net` về API Gateway.
   - `AWS::Amplify::App` / Amplify Hosting -> Trình phân phối ứng dụng Web Frontend kết nối S3 bucket, phục vụ giao diện tại `https://axiza.net`.
   - `AWS::Serverless::HttpApi` -> Cổng REST API Gateway cấu hình tên miền tùy chỉnh `https://api.axiza.net`.
   - `AWS::Lambda::Function` -> Hàm tính toán serverless gán IAM Role chứa quyền thao tác CRUD trên DynamoDB và S3.
   - `AWS::DynamoDB::Table` (3 bảng) -> Cơ sở dữ liệu NoSQL gồm `UsersTable`, `FlashcardsTable`, và `CategoriesTable`.
   - `AWS::S3::Bucket` -> Bucket chứa dữ liệu tĩnh giao diện cho Amplify và Bucket private lưu trữ tập tin xuất dữ liệu.

#### Xác minh Vận hành Endpoint Backend (Operational Health Check)

Trạng thái vận hành của hệ thống được xác minh sau khi triển khai bằng cách gửi request kiểm tra sức khỏe (Health Check) tới endpoint thực tế:

```bash
curl https://api.axiza.net/api/health
```

**Kết quả kỳ vọng (Expected Output)**:
```json
{"ok":true,"service":"flashcard-backend"}
```

Kết quả phản hồi xác nhận kết nối HTTPS thông suốt giữa Amazon Route 53, API Gateway, AWS Lambda và tầng ứng dụng backend.
