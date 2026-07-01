# AWS End-to-End Test Guide

This guide verifies the full AWS flow for `ChromeFlashcardExtension` after deploying the backend to Lambda/API Gateway, storing data in DynamoDB, hosting the study web on S3, using Amazon Translate, and exporting JSON through a private S3 pre-signed URL.

## 1. Fill In Test Values

Replace these placeholders before testing:

```text
AWS_REGION=ap-southeast-1
API_BASE_URL=https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com
STUDY_URL=http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com
CHROME_EXTENSION_ORIGIN=chrome-extension://YOUR_EXTENSION_ID
EXPORT_BUCKET=YOUR_PRIVATE_EXPORT_BUCKET
USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
```

PowerShell helper variables:

```powershell
$ApiBaseUrl = "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com"
$StudyUrl = "http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com"
$TestUsername = "aws-test-user"
$TestPassword = "Password123!"
```

## 2. Pre-Test Deployment Checks

Confirm Lambda environment variables:

```text
DATA_STORE=dynamodb
AWS_REGION=ap-southeast-1
USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
JWT_SECRET=<strong secret>
EXPORT_BUCKET=<private export bucket>
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://YOUR_EXTENSION_ID,http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com
USE_AMAZON_TRANSLATE=true
REQUIRE_TRANSLATE_AUTH=true
TRANSLATE_MAX_LENGTH=120
SERVE_STUDY_STATIC=false
```

Confirm Lambda IAM permissions include:

```text
dynamodb:GetItem
dynamodb:PutItem
dynamodb:UpdateItem
dynamodb:DeleteItem
dynamodb:Query
translate:TranslateText
s3:PutObject
s3:GetObject
logs:CreateLogGroup
logs:CreateLogStream
logs:PutLogEvents
```

Confirm API Gateway has route:

```text
ANY /{proxy+}
```

Confirm API Gateway CORS allows:

```text
Authorization
Content-Type
```

Confirm allowed origins include the S3 study URL and Chrome extension origin.

## 3. Backend Health Test

Run:

```powershell
Invoke-RestMethod -Method Get -Uri "$ApiBaseUrl/api/health"
```

Expected:

```json
{
  "ok": true,
  "service": "flashcard-backend"
}
```

If this fails, check Lambda logs in CloudWatch before testing anything else.

## 4. Register Test User

Run:

```powershell
$RegisterBody = @{
  username = $TestUsername
  password = $TestPassword
} | ConvertTo-Json

$RegisterResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/auth/register" `
  -ContentType "application/json" `
  -Body $RegisterBody

$RegisterResponse
```

Expected:

```text
ok = true
token exists
user.username = aws-test-user
user.userId exists
user.role = user
```

Save token:

```powershell
$Token = $RegisterResponse.token
$AuthHeaders = @{
  Authorization = "Bearer $Token"
}
```

If user already exists, run the login test instead.

## 5. Login Test

Run:

```powershell
$LoginBody = @{
  username = $TestUsername
  password = $TestPassword
} | ConvertTo-Json

$LoginResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/auth/login" `
  -ContentType "application/json" `
  -Body $LoginBody

$Token = $LoginResponse.token
$AuthHeaders = @{
  Authorization = "Bearer $Token"
}

$LoginResponse
```

Expected:

```text
ok = true
token exists
user.username matches test username
```

## 6. Authenticated User Test

Run:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "$ApiBaseUrl/api/me" `
  -Headers $AuthHeaders
```

Expected:

```text
ok = true
user.username = aws-test-user
```

## 7. Category API Test

Create category:

```powershell
$CategoryBody = @{
  category = "AWS Test"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/categories" `
  -Headers $AuthHeaders `
  -ContentType "application/json" `
  -Body $CategoryBody
```

List categories:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "$ApiBaseUrl/api/categories" `
  -Headers $AuthHeaders
```

Expected:

```text
categories includes Uncategorized
categories includes AWS Test
```

## 8. Translate API Test

Run:

```powershell
$TranslateBody = @{
  text = "resilient"
  sourceLanguageCode = "en"
  targetLanguageCode = "vi"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/translate" `
  -Headers $AuthHeaders `
  -ContentType "application/json" `
  -Body $TranslateBody
```

Expected:

```json
{
  "ok": true,
  "word": "resilient",
  "meaning": "<translated text>",
  "wordform": "unknown",
  "provider": "amazon-translate"
}
```

If this returns `local-mock-translate`, Lambda is not running with `USE_AMAZON_TRANSLATE=true` or `DATA_STORE=dynamodb`.

## 9. Flashcard API Test

Create flashcard:

```powershell
$CardBody = @{
  word = "resilient"
  meaning = "Kien cuong"
  wordform = "adjective"
  category = "AWS Test"
  sourceUrl = "https://example.com"
  sourceTitle = "AWS Test Page"
} | ConvertTo-Json

$CreateCardResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/flashcards" `
  -Headers $AuthHeaders `
  -ContentType "application/json" `
  -Body $CardBody

$CreateCardResponse
```

Save card ID:

```powershell
$CardId = $CreateCardResponse.flashcard.cardId
```

List flashcards:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "$ApiBaseUrl/api/flashcards" `
  -Headers $AuthHeaders
```

Expected:

```text
count >= 1
flashcards contains resilient
flashcards[0].cardId exists
```

Update flashcard:

```powershell
$UpdateBody = @{
  word = "resilient"
  meaning = "Co kha nang phuc hoi nhanh"
  wordform = "adjective"
  category = "AWS Test"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Put `
  -Uri "$ApiBaseUrl/api/flashcards/$CardId" `
  -Headers $AuthHeaders `
  -ContentType "application/json" `
  -Body $UpdateBody
```

Expected:

```text
ok = true
flashcard.meaning updated
```

## 10. Study Random API Test

Run:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "$ApiBaseUrl/api/study/random?category=AWS%20Test" `
  -Headers $AuthHeaders
```

Expected:

```text
ok = true
count >= 1
flashcard.category = AWS Test
```

## 11. Export API Test

Run:

```powershell
$ExportResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$ApiBaseUrl/api/export" `
  -Headers $AuthHeaders `
  -ContentType "application/json" `
  -Body "{}"

$ExportResponse
```

Expected:

```text
ok = true
fileName ends with .json
downloadUrl is a pre-signed S3 URL
```

Download export:

```powershell
Invoke-WebRequest `
  -Uri $ExportResponse.downloadUrl `
  -OutFile ".\aws-export-test.json"

Get-Content ".\aws-export-test.json"
```

Expected:

```text
JSON contains generatedAt
JSON contains user.username
JSON contains flashcards array
```

Confirm the export bucket is still private. Opening the raw S3 object URL without the signature should fail.

## 12. DynamoDB Data Verification

In AWS Console, inspect the tables.

Users table:

```text
Partition key username = aws-test-user
userId exists
passwordHash exists
role = user
```

Flashcards table:

```text
Partition key userId = user ID from login/register response
Sort key cardId = created card ID
word = resilient
category = AWS Test
```

Categories table:

```text
Partition key userId = user ID from login/register response
Sort key categoryName = AWS Test
```

Normal flashcard loading should query by `userId`. It should not require scanning the whole flashcards table.

## 13. Study Web on S3 Test

Before uploading to S3, confirm `backend/public/study/config.js` points to API Gateway:

```js
window.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com"
};
```

Upload these files to the S3 website bucket:

```text
backend/public/study/index.html
backend/public/study/styles.css
backend/public/study/app.js
backend/public/study/config.js
```

Open:

```text
http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com
```

Test:

1. Login with `aws-test-user`.
2. Confirm flashcards load from API Gateway.
3. Select category `AWS Test`.
4. Start a random study session.
5. Confirm the card can be flipped/reviewed.
6. Edit a flashcard.
7. Delete a flashcard only if you are done with the API tests.
8. Add and delete a category.

If login fails in the study page but API tests pass, check CORS `ALLOWED_ORIGINS`. It must include the exact S3 website origin.

## 14. Chrome Extension AWS Test

Update `extension-config.js`:

```js
globalThis.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com",
  STUDY_URL: "http://YOUR_STUDY_BUCKET.s3-website-ap-southeast-1.amazonaws.com"
};
```

Update `manifest.json` host permissions for AWS API Gateway:

```json
"host_permissions": [
  "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/*",
  "http://*/*",
  "https://*/*"
]
```

Reload the unpacked extension:

```text
chrome://extensions -> Flashcard Vocabulary -> Reload
```

Test popup:

1. Open the extension popup.
2. Login with `aws-test-user`.
3. Add a word manually.
4. Click Translate.
5. Save locally.
6. Click Sync to Cloud.
7. Open the study page from the extension.

Test context-menu flow:

1. Open any normal website.
2. Highlight a word.
3. Right-click.
4. Choose the flashcard context-menu option.
5. Confirm the inline editor appears near the selected word.
6. Click Translate.
7. Save the flashcard.
8. Open popup and confirm the card exists locally.
9. Sync to cloud.
10. Confirm the synced card appears in the S3 study web.

If Translate/Login fails from the extension but PowerShell API tests pass, check:

```text
ALLOWED_ORIGINS includes chrome-extension://YOUR_EXTENSION_ID
manifest.json host_permissions includes the API Gateway URL
extension-config.js has the API Gateway URL
the extension was reloaded after editing files
the webpage tab was reloaded so the latest content script is active
```

## 15. Category Delete Behavior Test

Create a card in category `AWS Test`, then delete the category:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "$ApiBaseUrl/api/categories/AWS%20Test" `
  -Headers $AuthHeaders
```

Expected:

```text
ok = true
deletedCategory = AWS Test
updatedCards >= 1
categories no longer includes AWS Test
```

List flashcards again:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "$ApiBaseUrl/api/flashcards" `
  -Headers $AuthHeaders
```

Expected:

```text
cards that used AWS Test now have category = Uncategorized
```

## 16. Cleanup Test Data

Delete test card:

```powershell
Invoke-RestMethod `
  -Method Delete `
  -Uri "$ApiBaseUrl/api/flashcards/$CardId" `
  -Headers $AuthHeaders
```

Delete downloaded export file:

```powershell
Remove-Item ".\aws-export-test.json" -ErrorAction SilentlyContinue
```

Optional AWS cleanup:

```text
Delete test user item from Users table
Delete test user's flashcard items from Flashcards table
Delete test user's category items from Categories table
Delete test export objects from private export bucket
```

## 17. Pass Criteria

The AWS test passes when:

```text
Health endpoint returns ok
Register/login returns JWT
Protected routes reject missing JWT and accept valid JWT
Categories create/list/delete correctly
Amazon Translate returns provider = amazon-translate
Flashcards create/list/update/delete correctly
Study random endpoint returns user-owned cards
Export creates private S3 object and pre-signed URL downloads JSON
S3 study web can login and study cards
Chrome extension can login, translate, save locally, sync to cloud, and open study web
DynamoDB contains user-scoped records with expected keys
```

## 18. Common Failure Points

`Backend not reachable`:

```text
Wrong API_BASE_URL
API Gateway route missing ANY /{proxy+}
Lambda crashed on import
CORS origin missing
```

`Unauthorized`:

```text
Missing Authorization header
Expired JWT
JWT_SECRET changed after login
User record was deleted from DynamoDB
```

`Translate returns local-mock-translate`:

```text
DATA_STORE is not dynamodb
USE_AMAZON_TRANSLATE is not true
Lambda env vars were changed but function was not redeployed/restarted
```

`DynamoDB AccessDenied`:

```text
Lambda execution role is missing table permissions
Table ARN region/account/name does not match the deployed table
```

`Export fails`:

```text
EXPORT_BUCKET missing
Lambda role missing s3:PutObject or s3:GetObject
Bucket policy blocks Lambda access
```

`Study page login fails but API test passes`:

```text
backend/public/study/config.js still points to localhost or empty API URL
S3 uploaded old config.js
ALLOWED_ORIGINS missing S3 website origin
browser cached old config.js
```

`Extension login fails but API test passes`:

```text
extension-config.js still points to localhost
manifest host_permissions missing API Gateway URL
extension was not reloaded
content script tab was not reloaded
ALLOWED_ORIGINS missing chrome-extension://EXTENSION_ID
```
