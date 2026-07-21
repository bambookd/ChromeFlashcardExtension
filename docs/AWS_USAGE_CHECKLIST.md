# AWS Usage and Deployment Checklist

Snapshot: 2026-07-21. Region: `ap-southeast-1`. Stack:
`chrome-flashcard-dev` (`UPDATE_COMPLETE`).

Update 2026-07-21: Amazon Translate was deliberately removed from the extension,
backend and Lambda permissions because this account does not provide that
service. Meanings are entered manually. This checklist has been fully refreshed
for that removal; Translate is no longer a service of this project. The removal
is recorded in `LOG.md` and the historical blocker analysis stays there only.

The source tree no longer references Translate, but the deployed Lambda role
still carries the old `translate`/`comprehend` statements until the next SAM
deployment applies the updated `infra/template.yaml`. See section 6.

This document distinguishes resources that were created from services that have
actually been called at runtime. It contains no AWS credentials, account ID, or
JWT secret.

## 1. Fast links for inspection

Sign in with the IAM user, then use these links. All infrastructure resources
are in `ap-southeast-1` (Singapore) unless noted otherwise.

| What to inspect | Link / name |
| --- | --- |
| Project overview: CloudFormation stack | [CloudFormation stacks](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1) → select `chrome-flashcard-dev` → **Resources** tab |
| Lambda API function | [ApiFunction](https://ap-southeast-1.console.aws.amazon.com/lambda/home?region=ap-southeast-1#/functions/chrome-flashcard-dev-ApiFunction-n92GBqOQnAwI?tab=code) |
| API Gateway HTTP API | [HTTP API `YOUR_API_ID`](https://ap-southeast-1.console.aws.amazon.com/apigateway/main/apis/YOUR_API_ID/routes?region=ap-southeast-1) |
| DynamoDB Users | [Users table](https://ap-southeast-1.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-1#table?name=chrome-flashcard-dev-UsersTable-G5F8DXL37I2E&tab=overview) |
| DynamoDB Flashcards | [Flashcards table](https://ap-southeast-1.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-1#table?name=chrome-flashcard-dev-FlashcardsTable-16RL84N3MZJUG&tab=overview) |
| DynamoDB Categories | [Categories table](https://ap-southeast-1.console.aws.amazon.com/dynamodbv2/home?region=ap-southeast-1#table?name=chrome-flashcard-dev-CategoriesTable-1F37JWDLC5Y5H&tab=overview) |
| Static Study/Game bucket | [Public static S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/YOUR_SITE_BUCKET?region=ap-southeast-1&tab=objects) |
| Private export bucket | [Private export S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/YOUR_EXPORT_BUCKET?region=ap-southeast-1&tab=objects) |
| SAM artifact bucket | [SAM source S3 bucket](https://s3.console.aws.amazon.com/s3/buckets/aws-sam-cli-managed-default-samclisourcebucket-jrtjgdyplprv?region=ap-southeast-1&tab=objects) |
| Lambda logs | [CloudWatch Logs](https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-southeast-1#logsV2:log-groups) → open `/aws/lambda/chrome-flashcard-dev-ApiFunction-n92GBqOQnAwI` |
| Lambda execution role | [IAM role](https://us-east-1.console.aws.amazon.com/iam/home#/roles/details/chrome-flashcard-dev-ApiFunctionRole-AOy1xyQigoi0) |
| Budget alerts | [AWS Budgets](https://console.aws.amazon.com/costmanagement/home#/budgets) |
| Study web | [Open Study](https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/study/index.html) |
| Game web | [Open Game](https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/game/index.html) |
| API health check | [Open API health](https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/api/health) |

The CloudFormation stack is the fastest and safest console entry point. Its
**Resources** tab lists the Lambda, HTTP API, DynamoDB tables, IAM role and
private export bucket created by the stack. The public static S3 bucket and SAM
artifact bucket were created outside this stack, so use their direct links above.

## 2. AWS services used so far

| Service | Status | What has been used | Cost / safety note |
| --- | --- | --- | --- |
| IAM | In use | Existing IAM user authenticated the AWS CLI; SAM created the Lambda execution role. | No access key is stored in this repository. |
| STS | Read-only use | `get-caller-identity` verified the IAM user. | Identity check only. |
| CloudFormation / SAM | In use | Created and updated `chrome-flashcard-dev`. | Orchestrates resources; no application data was seeded. |
| Lambda | Deployed | One Node.js 24 API function; health and CORS smoke requests reached it. | Lambda log group currently stores about 9.4 KB; retention is 7 days. |
| API Gateway HTTP API | Deployed | Fronts the Lambda API; health and CORS preflight were tested. | Throttle is live: 2 requests/second, burst 5. |
| DynamoDB | In use | Users, Flashcards, and Categories tables were created; account creation, card save and sync have passed in the web test. | Tables use 1 RCU / 1 WCU each. |
| S3 | In use | SAM artifact bucket, private export bucket, and public Study/Game static bucket were created. | Export bucket stays private and objects expire after 7 days. |
| CloudWatch Logs | In use | Lambda log group was created by smoke requests. | Retention is set to 7 days. |
| Amazon Translate | Removed from project | The feature was dropped because this account returned `OptInRequired`. No application code calls Translate, and `infra/template.yaml` no longer grants `translate:TranslateText`. | The deployed role keeps the stale grant until the next SAM deployment. No Translate call is billable now. |
| Amazon Comprehend | Removed from project | Only ever an indirect dependency of Translate auto-detection. Never independently used. | Same stale-grant note as Translate; removed from the template. |
| AWS Budgets | In use | Monthly cost alerts exist at 1 USD and 5 USD. | Alerts are warnings, not a hard spending cap. |

## 3. Current deployment progress

- [x] AWS CLI and SAM CLI installed and authenticated with IAM.
- [x] Serverless backend deployed: Lambda, API Gateway, DynamoDB, private export S3.
- [x] Study/Game static files uploaded to a separate public S3 bucket.
- [x] HTTPS S3 REST URLs work for Study and Game.
- [x] CORS allows localhost, the Chrome extension origin, the HTTP website origin, and the HTTPS S3 REST origin.
- [x] Cost guardrails applied: API throttle, 7-day export lifecycle, 7-day log retention, Budget alerts.
- [x] Local extension configuration points to API Gateway and the HTTPS Study URL.
- [x] Reload the unpacked extension and connect it to AWS.
- [x] Create an AWS Study account and log in.
- [x] Add a manual flashcard and sync it; Study shows the synced word after refresh.
- [x] Translate feature removed from the extension, backend and Lambda IAM; meanings are entered manually.
- [ ] Run one export and verify the private pre-signed download.
- [ ] Record E2E evidence and test results in `LOG.md`.
- [ ] Reconcile the next SAM deployment so the stored CloudFormation template includes the live throttle/lifecycle configuration.
- [ ] Configure GitHub OIDC and run CI/CD only after manual E2E passes.

## 4. Viewing this as one project

### What exists now

Use the `chrome-flashcard-dev` CloudFormation stack as the project boundary for
the backend. AWS CloudFormation records which physical resources were created by
the stack and exposes them in one Resources view. This is why it can show the
backend as one unit even though Lambda, API Gateway, DynamoDB, IAM and S3 have
separate service consoles.

```text
Chrome extension / Study browser
        │ HTTPS + CORS
        ▼
API Gateway HTTP API
        │ Lambda integration + invoke permission
        ▼
Lambda API function
   ├── environment variables → DynamoDB table names / export bucket name
   ├── IAM execution role → permissions for DynamoDB and S3
   └── pre-signed URL → private S3 export download

S3 Study/Game static files ── config.js API URL ──► API Gateway
```

The "links" are therefore explicit configuration, not a hidden connection:

- CloudFormation `Ref` values supply table and bucket names to Lambda.
- API Gateway has a Lambda integration and a Lambda invoke permission.
- Lambda's IAM role grants only the AWS actions it needs.
- Browser CORS accepts only the configured extension/site origins.
- The static site's generated `config.js` contains the API Gateway base URL.

### Better project view later: Resource Groups and tags

If you want one view that includes the static bucket too, create a tag-based
Resource Group later. Suggested non-sensitive tags:

```text
Project = ChromeFlashcardExtension
Environment = dev
```

Apply these tags to the Lambda, API, DynamoDB tables, export bucket and the
manually-created static bucket. Then create a Resource Group in
`ap-southeast-1` that queries `Project=ChromeFlashcardExtension`. It will show
matching resources across services in one list. Do not put passwords, tokens or
personal data in tags.

There is also a CloudFormation stack-based Resource Group, but it would not
include the static bucket because that bucket was created outside the stack.
For project-level cost reporting, activate the `Project` tag as a cost allocation
tag in Billing; AWS notes that tag appearance and activation can each take up to
24 hours.

Useful consoles:

- [AWS Resource Groups & Tag Editor](https://ap-southeast-1.console.aws.amazon.com/resource-groups/home?region=ap-southeast-1#!/home)
- [Cost allocation tags](https://console.aws.amazon.com/costmanagement/home#/tags)

### Step-by-step: create the two recommended groups

Do this in the AWS Console when the connection is stable. Creating a group does
not create a server, database, or paid service.

#### Group A — backend stack view (recommended first)

1. Open [AWS Resource Groups & Tag Editor](https://ap-southeast-1.console.aws.amazon.com/resource-groups/home?region=ap-southeast-1#!/home).
2. Confirm the Region selector is `Asia Pacific (Singapore) ap-southeast-1`.
3. Choose **Create group**.
4. Choose **CloudFormation stack-based**.
5. Choose stack `chrome-flashcard-dev`.
6. Name the group `chrome-flashcard-core-dev`.
7. Create the group.

This group should show the resources that CloudFormation created: Lambda, HTTP
API, DynamoDB tables, Lambda IAM role and private export bucket. It does not
include the public static bucket because that bucket was created manually.

#### Group B — complete project view using tags (recommended second)

1. In Resource Groups & Tag Editor, choose **Tag Editor** → **Find resources to tag**.
2. Keep Region `ap-southeast-1` and choose only the resource types you need.
   Do not choose all resources if the account contains unrelated coursework.
3. Find and select only these resource names:

   ```text
   chrome-flashcard-dev-ApiFunction-n92GBqOQnAwI
   YOUR_API_ID
   chrome-flashcard-dev-UsersTable-G5F8DXL37I2E
   chrome-flashcard-dev-FlashcardsTable-16RL84N3MZJUG
   chrome-flashcard-dev-CategoriesTable-1F37JWDLC5Y5H
   YOUR_EXPORT_BUCKET
   YOUR_SITE_BUCKET
   ```

4. Choose **Manage tags of selected resources** and add:

   ```text
   Project = ChromeFlashcardExtension
   Environment = dev
   ```

5. Do not put passwords, JWTs, access keys, usernames or personal information in tags.
6. Return to **Resource Groups** → **Create group** → **Tag-based**.
7. Set the tag query to `Project = ChromeFlashcardExtension`.
8. Name the group `chrome-flashcard-all-dev` and create it.

The second group is the day-to-day project view: it can include the static
bucket alongside the serverless backend. If a resource type is not shown by Tag
Editor, keep it in Group A and use its direct console link in this document.

### Future maintenance rule

When a new resource is added for this project, apply the same two tags. During
the next SAM deployment, add equivalent tags to the infrastructure template so
new CloudFormation-managed resources receive them automatically. The existing
manually-created static bucket will still need its tag managed separately.

## 5. Tomorrow's low-cost test order

1. Confirm Wi-Fi, Budget emails, IAM identity, and stack status with read-only commands.
2. Reload the extension and visually open Study/Game. Do not create data yet.
3. Create one test account with a unique username and a demo-only password.
4. Create one category and one flashcard manually; sync once.
5. Export once, then verify DynamoDB/S3/CloudWatch with read-only commands.
6. Stop and inspect Budget alerts if anything unusual appears.

## 6. Removing Translate from the deployed stack

The Translate subscription blocker no longer applies: the feature was removed
instead of enabled. Nothing needs to be turned on in the Translate console, and
no account-provider request is required.

One AWS action is still outstanding. The source template is already clean, but
the **live** Lambda execution role still carries the old statements until a
deployment applies it:

1. Redeploy the backend so CloudFormation applies the updated
   `infra/template.yaml` to `chrome-flashcard-dev`. Follow the existing
   deployment path in `AWS_DEPLOYMENT.md`.
2. Keep `JwtSecret` with `UsePreviousValue=true`. Do not generate or print a new
   JWT secret as part of this change.
3. After the stack reaches `UPDATE_COMPLETE`, confirm with a read-only check
   that the role's inline policy no longer contains `translate:TranslateText`
   or `comprehend:DetectDominantLanguage`.

Only Lambda code and configuration change. The static Study/Game bundle is
unaffected by this removal, so no S3 sync is required for it.

Until that deployment runs, the stale grant is unused permission breadth rather
than an active cost or a broken feature: no code path calls either service.

Never paste an AWS Access Key ID or Secret Access Key into the extension,
`extension-config.js`, Lambda environment variables, or the repository.

## 7. Important limitations

- `student/password123` and `teacher/password123` exist only in local JSON sample
  data; they were intentionally not seeded to public AWS.
- Study/Game use direct HTTPS S3 REST object URLs, so links must include
  `index.html`. CloudFront is the future option for HTTPS + clean URLs/custom
  domain.
- Realtime multiplayer remains local-only and is not part of this AWS MVP.
- The source `infra/template.yaml` contains the throttle/lifecycle settings.
  Those settings were applied directly to the live resources to avoid an
  unnecessary Lambda artifact redeploy while preserving the existing JWT. The
  next SAM deployment should reconcile that temporary CloudFormation drift.
