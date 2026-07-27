---
title: "Serverless Backend Implementation & AWS Deployment"
date: 2024-01-01
weight: 3
chapter: false
pre: " <b> 5.3. </b> "
---

#### Overview

This section documents the Infrastructure-as-Code (IaC) configuration, serverless stack compilation, and AWS deployment procedure executed via **AWS SAM (Serverless Application Model)** for stack `chrome-flashcard-axiza` under domain `axiza.net`.

#### Infrastructure Template Specification (`infra/template.yaml`)

The serverless infrastructure is specified using the AWS Serverless Application Model specification. Below is an overview of the primary resource definitions:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: ChromeFlashcardExtension production serverless backend stack for axiza.net.

Parameters:
  JwtSecret:
    Type: String
    NoEcho: true
    Description: Secret key utilized for JWT signature verification.
  AllowedOrigins:
    Type: String
    Default: "https://axiza.net"
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
   - **Parameter AllowedOrigins**: `https://axiza.net`

3. **Amazon Route 53 Custom Domains Configuration (`axiza.net` & `api.axiza.net`)**:
   Create custom domain mappings in Route 53 Hosted Zone for `axiza.net` (pointing to AWS Amplify Hosting for frontend assets) and `api.axiza.net` (pointing to API Gateway HTTP API):
   ```bash
   # Route apex domain axiza.net to AWS Amplify Hosting
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

   # Route backend subdomain api.axiza.net to API Gateway HTTP API
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

4. **Provisioned Cloud Resources Summary**:
   - `AWS::Route53::RecordSet` -> Custom domain apex `axiza.net` routed to AWS Amplify Hosting (S3 static web assets), and subdomain `api.axiza.net` routed to API Gateway.
   - `AWS::Amplify::App` / Amplify Hosting -> Frontend website host connected to S3 bucket, serving UI under `https://axiza.net`.
   - `AWS::Serverless::HttpApi` -> Provisioned API Gateway custom domain endpoint URL: `https://api.axiza.net`.
   - `AWS::Lambda::Function` -> Execution function configured with IAM role granting DynamoDB & S3 CRUD permissions.
   - `AWS::DynamoDB::Table` (3 instances) -> `UsersTable`, `FlashcardsTable`, and `CategoriesTable`.
   - `AWS::S3::Bucket` -> Private encrypted S3 export bucket with lifecycle expiration rules, plus S3 bucket for Amplify static web assets.

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
