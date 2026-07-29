---
title: "Triển khai Backend Serverless & Hạ tầng AWS"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Tổng quan

Phần này mô tả cấu hình Hạ tầng dưới dạng Mã (IaC), quá trình biên dịch serverless stack và quy trình triển khai lên AWS được thực thi thông qua **AWS SAM (Serverless Application Model)** cho stack `chrome-flashcard-axiza` với các tên miền `www.axiza.net` và `api.axiza.net`.

#### Thông số Kỹ thuật Template Hạ tầng (`infra/template.yaml`)

Hạ tầng serverless được định nghĩa sử dụng chuẩn AWS Serverless Application Model. Dưới đây là cấu trúc các tài nguyên chính:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: ChromeFlashcardExtension demo serverless backend stack.

Parameters:
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key utilized for JWT signature verification.
  AllowedOrigins:
    Type: String
    Default: "https://www.axiza.net,https://axiza.net,http://axiza.net"
    Description: Comma-separated origins allowed by backend CORS.

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
        ALLOWED_ORIGINS: !Ref AllowedOrigins
        SERVE_STUDY_STATIC: "false"

Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      DefaultRouteSettings:
        ThrottlingBurstLimit: 40
        ThrottlingRateLimit: 20
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

  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: username
          AttributeType: S
      KeySchema:
        - AttributeName: username
          KeyType: HASH
```

#### Quy trình Xây dựng & Triển khai

1. **Giai đoạn Đóng gói Tài nguyên**:
   ```bash
   cd infra
   sam build
   ```
   AWS SAM kiểm tra `template.yaml`, tải các dependency npm sản phẩm và đóng gói file zip tối ưu.

2. **Giai đoạn Triển khai CloudFormation Stack**:
   ```bash
   sam deploy --guided
   ```
   Các tham số đầu vào được cung cấp trong quá trình deploy:
   - **Stack Name**: `chrome-flashcard-axiza`
   - **Target Region**: `ap-southeast-1`
   - **Parameter JwtSecret**: *(Chuỗi bảo mật được cung cấp lúc deploy)*
   - **Parameter AllowedOrigins**: `https://www.axiza.net,https://axiza.net,http://axiza.net`

3. **Cấu hình Tên miền Tùy chỉnh trên Amazon Route 53 (`www.axiza.net` & `api.axiza.net`)**:

   Để điều hướng `api.axiza.net` tới API Gateway HTTP API, một API Gateway **Custom Domain Name** được tạo trước nhằm sinh ra **Regional Domain Name** (`d-xxxx.execute-api.ap-southeast-1.amazonaws.com`) và **Regional Hosted Zone ID** (`Z2FDTNDATAQYW2`). Bản ghi Route 53 Alias A/AAAA sẽ trỏ tới Regional endpoint này:

   ```bash
   # Bước 1: Tạo API Gateway Custom Domain Name sử dụng ACM Certificate
   aws apigatewayv2 create-domain-name \
     --domain-name api.axiza.net \
     --domain-name-configurations TargetDomainName=api.axiza.net,CertificateArn=arn:aws:acm:ap-southeast-1:123456789012:certificate/abc-123,EndpointType=REGIONAL

   # Bước 2: Tạo API Gateway Mapping ($default stage)
   aws apigatewayv2 create-api-mapping \
     --domain-name api.axiza.net \
     --api-id <api-id> \
     --stage '$default'

   # Bước 3: Route 53 Alias A-record trỏ vào API Gateway Regional Domain Name
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
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

   # Điều hướng tên miền chuẩn www.axiza.net qua CNAME tới AWS Amplify Hosting CDN
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC \
     --change-batch '{
       "Changes": [{
         "Action": "UPSERT",
         "ResourceRecordSet": {
           "Name": "www.axiza.net",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [{"Value": "d123456789abcdef.amplifyapp.com"}]
         }
       }]
     }'
   ```

4. **Tóm tắt Tài nguyên AWS đã Khởi tạo**:
   - `AWS::Route53::RecordSet` -> Bản ghi CNAME cho tên miền chuẩn `www.axiza.net` (Amplify CDN distribution) kèm điều hướng apex, và bản ghi Alias A/AAAA cho `api.axiza.net` trỏ tới API Gateway Regional Domain Name.
   - `AWS::Amplify::App` / Amplify Hosting -> Host ứng dụng web tĩnh phục vụ trực tiếp qua mạng lưới CDN edge toàn cầu dưới tên miền `https://www.axiza.net`.
   - `AWS::Serverless::HttpApi` -> API Gateway HTTP API backend gắn custom domain `https://api.axiza.net`.
   - `AWS::Lambda::Function` -> Lambda function được gán IAM role cấp quyền CRUD DynamoDB & S3.
   - `AWS::DynamoDB::Table` (3 bảng) -> `UsersTable`, `FlashcardsTable`, và `CategoriesTable` hoạt động ở chế độ `PAY_PER_REQUEST`.
   - `AWS::S3::Bucket` -> Private encrypted S3 export bucket lưu file JSON export với quy tắc vòng đời 7 ngày.

#### Kiểm tra Vận hành Endpoint

Tính sẵn sàng của hệ thống được xác nhận sau khi triển khai thông qua lệnh health check kiểm tra endpoint thực tế:

```bash
curl https://api.axiza.net/api/health
```

**Kết quả trả về dự kiến**:
```json
{"ok":true,"service":"flashcard-backend"}
```
Kết quả xác nhận kết nối vận hành live giữa Route 53, API Gateway, AWS Lambda và ứng dụng backend.
