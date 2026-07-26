---
title: "Triển khai Backend Serverless & Hạ tầng AWS"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Tổng quan

Phần này trình bày chi tiết cấu hình Infrastructure-as-Code (IaC), quy trình build serverless stack và các bước triển khai lên AWS thông qua **AWS SAM (Serverless Application Model)**.

#### Khai báo Hạ tầng (`infra/template.yaml`)

Toàn bộ hạ tầng serverless được khai báo theo chuẩn AWS Serverless Application Model. Chi tiết cấu hình tài nguyên bao gồm:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: Template triển khai backend serverless cho ChromeFlashcardExtension.

Parameters:
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key dùng để xác thực chữ ký JWT.
  AllowedOrigins:
    Type: String
    Default: "*"
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

#### Quy trình Build & Deployment

1. **Giai đoạn Build Artifact**:
   ```bash
   cd infra
   sam build
   ```
   SAM kiểm tra `template.yaml`, cài đặt các production npm dependency và build các package zip tối ưu cho Node.js 24.x runtime.

2. **Khởi tạo CloudFormation Stack**:
   ```bash
   sam deploy --guided
   ```
   Các giá trị parameter được cung cấp trong quá trình deployment:
   - **Stack Name**: `chrome-flashcard-backend`
   - **Target Region**: `us-east-1`
   - **Parameter JwtSecret**: *(Chuỗi secret key cung cấp tại thời điểm deployment)*
   - **Parameter AllowedOrigins**: `*`

3. **Tóm tắt Tài nguyên Cloud đã Provision**:
   - `AWS::Serverless::HttpApi` -> API Gateway endpoint URL được khởi tạo: `https://<api-id>.execute-api.us-east-1.amazonaws.com`
   - `AWS::Lambda::Function` -> Lambda function được gán IAM role có quyền CRUD với DynamoDB & S3.
   - `AWS::DynamoDB::Table` (3 bảng) -> `UsersTable`, `FlashcardsTable`, và `CategoriesTable`.
   - `AWS::S3::Bucket` -> Private encrypted S3 bucket lưu trữ export file kèm các quy tắc lifecycle tự động hết hạn.

#### Xác minh Endpoint Vận hành

Khả năng hoạt động của hệ thống được xác minh sau deployment thông qua health check tới live API Gateway HTTP API endpoint:

```bash
curl https://<api-id>.execute-api.us-east-1.amazonaws.com/api/health
```

Kết quả thực thi:
```json
{"status":"ok","store":"dynamodb"}
```
Response xác nhận kết nối trực tiếp đang hoạt động giữa AWS Lambda và tầng lưu trữ Amazon DynamoDB.
