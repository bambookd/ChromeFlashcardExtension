---
title: "Resource Teardown & Operational Verification"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Teardown & Operational Summary

This section documents the resource teardown procedures, stack destruction workflow, cost management practices, and post-operational verification steps for the deployed AWS cloud infrastructure.

#### Automated Resource Decommissioning Workflow

To prevent unnecessary billing and ensure total resource cleanup upon completion of project evaluation, the following teardown sequence was executed:

1. **Storage Purging Phase**:
   Prior to CloudFormation stack deletion, all persistent objects within private and public S3 buckets were purged:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

2. **CloudFormation Stack Destruction**:
   Executing the SAM CLI stack removal command deletes all provisioned resources defined within `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Decommissioned Infrastructure Inventory

The automated stack destruction process cleanly removed the following AWS cloud resources:

| AWS Resource | Resource Name / Pattern | Action Taken |
|---|---|---|
| **API Gateway** | `HttpApi` (`chrome-flashcard-dev-*`) | Terminated and HTTP endpoints released |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-dev-*`) | Function, execution runtime, and IAM Execution Roles deleted |
| **DynamoDB Tables** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Tables destroyed & provisioned RCUs/WCUs released |
| **Amazon S3** | `ExportBucket` | Bucket policy and storage container removed |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Role policies detached and deleted |

#### Post-Operational Verification & Auditing

Completion of the teardown process was empirically verified using the AWS CLI:

1. **CloudFormation Audit**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1
   ```
   *Result*: `Stack with id chrome-flashcard-dev does not exist` (Status confirmed).

2. **DynamoDB Audit**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   *Result*: Verified zero remaining project-related table instances.

3. **CloudWatch Log Audit**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   *Result*: Log groups successfully purged or set to short retention windows, completing system decommissioning.

#### Project Conclusion

The project successfully demonstrated an **offline-first Chrome Extension (MV3)** combined with a scalable, secure **AWS Serverless infrastructure** (API Gateway, Lambda, DynamoDB, and S3). System verification confirms operational stability, robust data synchronization, and complete cloud resource lifecycle control.
