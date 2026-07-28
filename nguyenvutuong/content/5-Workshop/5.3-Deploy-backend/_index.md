---
title: "Serverless Backend Implementation & AWS Deployment"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Overview

This section documents the Infrastructure-as-Code (IaC) configuration, serverless stack compilation, and AWS deployment procedure executed via **AWS SAM (Serverless Application Model)** for stack `chrome-flashcard-axiza` under domains `www.axiza.net` and `api.axiza.net`.

#### Infrastructure Template Specification (`infra/template.yaml`)

The serverless infrastructure is specified using the AWS Serverless Application Model specification. Below is an overview of the primary resource definitions:

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

#### Build & Deployment Execution Workflow

1. **Artifact Compilation Stage**:
   ```bash
   cd infra
   sam build
   ```
   SAM validates `template.yaml`, pulls npm production dependencies, and builds optimized zip packages.

2. **CloudFormation Stack Provisioning**:
   ```bash
   sam deploy --guided
   ```
   Stack parameter inputs provided during deployment:
   - **Stack Name**: `chrome-flashcard-axiza`
   - **Target Region**: `ap-southeast-1`
   - **Parameter JwtSecret**: *(Secured string provided at deployment time)*
   - **Parameter AllowedOrigins**: `https://www.axiza.net,https://axiza.net,http://axiza.net`

3. **Amazon Route 53 Custom Domains Configuration (`www.axiza.net` & `api.axiza.net`)**:

   To map `api.axiza.net` to API Gateway HTTP API, an API Gateway **Custom Domain Name** is created first to generate a **Regional Domain Name** (`d-xxxx.execute-api.ap-southeast-1.amazonaws.com`) and **Regional Hosted Zone ID** (`Z2FDTNDATAQYW2`). Route 53 Alias A/AAAA records point to this Regional endpoint:

   ```bash
   # Step 1: Create API Gateway Custom Domain Name using ACM Certificate
   aws apigatewayv2 create-domain-name \
     --domain-name api.axiza.net \
     --domain-name-configurations TargetDomainName=api.axiza.net,CertificateArn=arn:aws:acm:ap-southeast-1:123456789012:certificate/abc-123,EndpointType=REGIONAL

   # Step 2: Create API Gateway API Mapping ($default stage)
   aws apigatewayv2 create-api-mapping \
     --domain-name api.axiza.net \
     --api-id <api-id> \
     --stage '$default'

   # Step 3: Route 53 Alias A-record trỏ vào API Gateway Regional Domain Name
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

   # Route canonical frontend domain www.axiza.net via CNAME to AWS Amplify Hosting CDN
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

4. **Provisioned Cloud Resources Summary**:
   - `AWS::Route53::RecordSet` -> CNAME record for canonical frontend domain `www.axiza.net` (Amplify CDN distribution) with apex HTTP/HTTPS redirection, and Alias A/AAAA record for `api.axiza.net` routed to API Gateway Regional Domain Name.
   - `AWS::Amplify::App` / Amplify Hosting -> Web App host distributing static web assets directly via global CDN edge nodes under `https://www.axiza.net`.
   - `AWS::Serverless::HttpApi` -> Provisioned API Gateway HTTP API backend mapping to custom domain `https://api.axiza.net`.
   - `AWS::Lambda::Function` -> Execution function configured with IAM role granting DynamoDB & S3 CRUD permissions.
   - `AWS::DynamoDB::Table` (3 instances) -> `UsersTable`, `FlashcardsTable`, and `CategoriesTable` operating in `PAY_PER_REQUEST` mode.
   - `AWS::S3::Bucket` -> Private encrypted S3 export bucket dedicated exclusively to JSON data exports with 7-day lifecycle expiration.

#### Operational Endpoint Verification

System availability was confirmed post-deployment via an automated health check against the live API endpoint:

```bash
curl https://api.axiza.net/api/health
```

**Expected result**:
```json
{"ok":true,"service":"flashcard-backend"}
```
The response verifies active production connectivity between Route 53, API Gateway, AWS Lambda, and the backend application layer.
