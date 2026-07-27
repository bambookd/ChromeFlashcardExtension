---
title: "Resource Teardown & Operational Verification"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Teardown & Operational Summary

This section documents the resource teardown procedures, stack destruction workflow, cost management practices, and post-operational verification steps for the deployed AWS cloud infrastructure (`chrome-flashcard-axiza`) under domain `axiza.net`.

#### Automated Resource Decommissioning Workflow

To prevent unnecessary billing and ensure total resource cleanup upon completion of project evaluation, the following teardown sequence was executed:

1. **Route 53 Custom Domains Record Cleanup**:
   Remove the custom domain Alias record sets (`axiza.net` and `api.axiza.net`) from Route 53 Hosted Zone `axiza.net`:
   ```bash
   # Remove apex domain axiza.net Alias record
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

   # Remove backend subdomain api.axiza.net Alias record
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

2. **Storage Purging Phase**:
   Prior to CloudFormation stack deletion, all persistent objects within the private S3 bucket and frontend static asset S3 bucket were purged:
   ```bash
   aws s3 rm s3://<export-bucket-name> --recursive
   ```

3. **CloudFormation Stack Destruction**:
   Executing the SAM CLI stack removal command deletes all provisioned resources defined within `template.yaml`:
   ```bash
   cd infra
   sam delete --no-prompts
   ```

#### Decommissioned Infrastructure Inventory

The automated stack destruction process cleanly removed the following AWS cloud resources:

| AWS Resource | Resource Name / Pattern | Action Taken |
|---|---|---|
| **Route 53 Records** | `axiza.net` & `api.axiza.net` | Deleted Alias A-records mapping to AWS Amplify and API Gateway in `axiza.net` hosted zone |
| **AWS Amplify** | `Amplify App` (`chrome-flashcard-axiza`) | Disassociated domain `axiza.net` and released frontend web host |
| **API Gateway** | `HttpApi` (`api.axiza.net`) | Terminated custom domain mapping and HTTP endpoints |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-axiza-*`) | Function, execution runtime, and IAM Execution Roles deleted |
| **DynamoDB Tables** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Tables destroyed & provisioned RCUs/WCUs released |
| **Amazon S3** | Static Web Bucket & `ExportBucket` | Bucket policies and storage containers removed |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Role policies detached and deleted |

#### Post-Operational Verification & Auditing

Completion of the teardown process was empirically verified using the AWS CLI:

1. **CloudFormation Audit**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-axiza --region ap-southeast-1
   ```
   **Expected result**: `Stack with id chrome-flashcard-axiza does not exist` (Status confirmed).

2. **DynamoDB Audit**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   **Expected result**: Verified zero remaining project-related table instances.

3. **CloudWatch Log Audit**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   **Expected result**: Log groups successfully purged or set to short retention windows, completing system decommissioning.

#### Project Conclusion

The project successfully demonstrated an **offline-first Chrome Extension (MV3)** combined with frontend hosting on **AWS Amplify** (pointing to S3) under custom domain `axiza.net` managed by **Route 53**, and a scalable, secure **AWS Serverless backend API** mapped to custom domain `api.axiza.net`. System verification confirms operational stability, robust data synchronization, and complete cloud resource lifecycle control.
