---
title: "Serverless Backend Implementation & AWS Deployment"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Overview

This section documents the Infrastructure-as-Code (IaC) configuration, serverless stack compilation, and AWS deployment procedure executed via **AWS SAM (Serverless Application Model)**.

#### Infrastructure Template Specification (`infra/template.yaml`)

The serverless infrastructure is specified using the AWS Serverless Application Model specification. Below is an overview of the primary resource definitions:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: ChromeFlashcardExtension production serverless backend stack.

Parameters:
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key utilized for JWT signature verification.
  AllowedOrigins:
    Type: String
    Default: "*"
    Description: Permitted origins for API Gateway CORS validation.

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

#### Build & Deployment Execution Workflow

1. **Artifact Compilation Stage**:
   ```bash
   cd infra
   sam build
   ```
   SAM validates `template.yaml`, pulls npm production dependencies, and builds optimized zip packages targeting the Node.js 24.x runtime.

2. **CloudFormation Stack Provisioning**:
   ```bash
   sam deploy --guided
   ```
   Stack parameter inputs provided during deployment:
   - **Stack Name**: `chrome-flashcard-backend`
   - **Target Region**: `us-east-1`
   - **Parameter JwtSecret**: *(Secured string provided at deployment time)*
   - **Parameter AllowedOrigins**: `*`

3. **Provisioned Cloud Resources Summary**:
   - `AWS::Serverless::HttpApi` -> Provisioned API Gateway endpoint URL: `https://<api-id>.execute-api.us-east-1.amazonaws.com`
   - `AWS::Lambda::Function` -> Execution function configured with an IAM role granting DynamoDB & S3 CRUD permissions.
   - `AWS::DynamoDB::Table` (3 instances) -> `UsersTable`, `FlashcardsTable`, and `CategoriesTable`.
   - `AWS::S3::Bucket` -> Private encrypted S3 export bucket with lifecycle expiration rules.

#### Operational Endpoint Verification

System availability was confirmed post-deployment via an automated health check against the live API Gateway HTTP API endpoint:

```bash
curl https://<api-id>.execute-api.us-east-1.amazonaws.com/api/health
```

Execution Output:
```json
{"status":"ok","store":"dynamodb"}
```
The response verifies active production connectivity between AWS Lambda and the Amazon DynamoDB storage layer.
