---
title: "Resource Teardown & Operational Verification"
date: 2024-01-01
weight: 6
chapter: false
pre: " <b> 5.6. </b> "
---

#### Teardown & Operational Summary

This section documents the planned resource teardown procedure, stack destruction workflow, cost management practices, and post-operational verification steps for the AWS cloud infrastructure (`chrome-flashcard-axiza`) under domains `www.axiza.net` and `api.axiza.net`.

#### Automated Resource Decommissioning Procedure

To prevent unnecessary billing and ensure total resource cleanup upon completion of workshop evaluation, the following teardown procedure is designed to be executed:

1. **Route 53 Custom Domains Record Cleanup**:
   Remove the custom domain record sets (`www.axiza.net` CNAME and `api.axiza.net` Alias A-record) from Route 53 Hosted Zone `axiza.net`:
   ```bash
   # Remove canonical frontend domain www.axiza.net CNAME record
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

   # Remove backend subdomain api.axiza.net Alias A-record mapping to API Gateway Regional endpoint
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

2. **Storage Purging Phase**:
   Prior to CloudFormation stack deletion, all persistent JSON export objects within the private S3 export bucket are purged:
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

Executing the automated stack destruction process will release and remove the following AWS cloud resources:

| AWS Resource | Resource Name / Pattern | Action Taken |
|---|---|---|
| **Route 53 Records** | `www.axiza.net` & `api.axiza.net` | Delete CNAME record (`www.axiza.net`) and Alias A-record (`api.axiza.net`) in `axiza.net` hosted zone |
| **AWS Amplify** | `Amplify App` (`chrome-flashcard-axiza`) | Disassociate domain `www.axiza.net` and release frontend web host |
| **API Gateway** | `HttpApi` (`api.axiza.net`) | Terminate custom domain mapping and HTTP API endpoints |
| **AWS Lambda** | `ApiFunction` (`chrome-flashcard-axiza-*`) | Function, execution runtime, and IAM Execution Roles deleted |
| **DynamoDB Tables** | `UsersTable`, `FlashcardsTable`, `CategoriesTable` | Tables destroyed (`PAY_PER_REQUEST` On-Demand billing mode terminated) |
| **Amazon S3** | Private `ExportBucket` | Private export bucket policies and storage containers removed |
| **IAM Policies** | Inline SAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) | Role policies detached and deleted |

#### Post-Operational Verification & Auditing

Upon completion of the teardown command, post-cleanup verification is conducted using the AWS CLI to confirm complete resource deletion:

1. **CloudFormation Audit**:
   ```bash
   aws cloudformation describe-stacks --stack-name chrome-flashcard-axiza --region ap-southeast-1
   ```
   **Expected result**: `Stack with id chrome-flashcard-axiza does not exist` (Confirms stack removal).

2. **DynamoDB Audit**:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```
   **Expected result**: Confirms zero remaining project-related table instances.

3. **CloudWatch Log Audit**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/chrome-flashcard" --region ap-southeast-1
   ```
   **Expected result**: Confirms deletion or retention expiration of log groups.

#### Conclusion & Operational Best Practices

The reproducible deployment and teardown process demonstrates the benefits of Infrastructure-as-Code (IaC) via AWS SAM. By managing resources through a declarative template, developers maintain full control over cloud environments, enforce security policies, and ensure clean resource decommissioning without leaving orphan billing assets.
