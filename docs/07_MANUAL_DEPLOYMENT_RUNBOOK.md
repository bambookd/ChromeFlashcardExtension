# 07. Manual AWS Console Deployment Runbook

> Primary path cho internship/demo. Không chạy runbook này trước khi đóng P0 trong `03_CURRENT_STATE_AUDIT.md`. Các tên dưới đây là ví dụ; ghi lại tên thật vào deployment record và `LOG.md`.

## 1. Variables worksheet

Điền trước khi bắt đầu:

```text
DEPLOY_DATE=
GIT_COMMIT=
AWS_ACCOUNT_ALIAS=
AWS_REGION=ap-southeast-1
RESOURCE_PREFIX=flashcard-demo

USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
EXPORT_BUCKET=<globally-unique-private-name>
SITE_BUCKET=<globally-unique-public-demo-name>
LAMBDA_FUNCTION=flashcard-api
HTTP_API=flashcard-http-api
API_BASE_URL=<fill after API creation>
SITE_ORIGIN=http://<site-bucket>.s3-website-<region>.amazonaws.com
EXTENSION_ID=<chrome extension id>
JWT_SECRET=<store securely; never paste into docs/log/screenshots>
```

Use cùng region cho Lambda, DynamoDB, S3 export và Translate để đơn giản hóa. S3 bucket names phải globally unique.

## 2. Preflight local

From repo root:

```powershell
git status --short
git rev-parse --short HEAD
Set-Location backend
npm ci
npm run check
npm audit --omit=dev
```

Additional required after P0 implementation:

```powershell
node --check src/auth.js
node --check src/config.js
node --check src/dynamoRepositories.js
node --check src/exportService.js
node --check src/translateService.js
node --check src/validation.js
```

Install SAM CLI then run from repo root if using/validating template:

```powershell
sam validate --lint --template-file infra/template.yaml
```

Stop if:

- Runtime vẫn `nodejs20.x`.
- IAM/template vẫn thiếu `comprehend:DetectDominantLanguage` trong khi source default `auto`.
- SAM/Lambda configuration vẫn cố set reserved key `AWS_REGION`.
- Any high/critical dependency vulnerability chưa được review.
- Config chứa real secret trong tracked file.
- **Chưa quyết định xử lý AUD-P0-07** (translate trong content script bị CORS chặn - xem mục 12).
- **Chưa tắt realtime UI trong Game** (AUD-P0-08; đặt `REALTIME_URL=""` là chưa đủ - xem mục 11).

## 3. Create DynamoDB tables

AWS Console -> DynamoDB -> Tables -> Create table.

### 3.1 Users

```text
Table name: <USERS_TABLE>
Partition key: username (String)
Capacity mode: Provisioned
Read capacity: 1
Write capacity: 1
```

Không tạo sort key/GSI cho MVP.

### 3.2 Flashcards

```text
Table name: <FLASHCARDS_TABLE>
Partition key: userId (String)
Sort key: cardId (String)
Capacity mode: Provisioned
Read capacity: 1
Write capacity: 1
```

### 3.3 Categories

```text
Table name: <CATEGORIES_TABLE>
Partition key: userId (String)
Sort key: categoryName (String)
Capacity mode: Provisioned
Read capacity: 1
Write capacity: 1
```

Checklist:

- Status `Active`.
- Key names/case exact.
- Same region.
- No sample data/manual password inserted.
- Optional for safer demo: enable point-in-time recovery if budget permits; otherwise document limitation.

## 4. Create private export bucket

AWS Console -> S3 -> Create bucket.

Settings:

```text
Bucket: <EXPORT_BUCKET>
Region: <AWS_REGION>
Block all public access: ON
Object ownership: Bucket owner enforced
Default encryption: SSE-S3 is sufficient for demo
Versioning: optional
```

Add lifecycle rule recommended:

```text
Prefix: all objects or user export prefix
Expire current objects after: 7 days (demo recommendation)
Delete expired delete markers/noncurrent versions as appropriate
```

Do not enable static website hosting on this bucket. Do not add public bucket policy.

## 5. Create Lambda execution role

AWS Console -> IAM -> Roles -> Create role -> AWS service -> Lambda.

Attach basic execution logging (`AWSLambdaBasicExecutionRole`) and add an inline least-privilege policy. Replace placeholders:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FlashcardTables",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/<USERS_TABLE>",
        "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/<FLASHCARDS_TABLE>",
        "arn:aws:dynamodb:<REGION>:<ACCOUNT_ID>:table/<CATEGORIES_TABLE>"
      ]
    },
    {
      "Sid": "TranslateTextWithAutoDetection",
      "Effect": "Allow",
      "Action": [
        "translate:TranslateText",
        "comprehend:DetectDominantLanguage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PrivateExports",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::<EXPORT_BUCKET>/*"
    }
  ]
}
```

Why `Resource: *` for Translate/Comprehend: các actions này không hỗ trợ resource-level restriction phù hợp cho call này. Không thêm `translate:*`, `s3:*`, `dynamodb:*`.

## 6. Build clean Lambda zip

Đừng zip trực tiếp một folder chứa zip cũ. Tạo staging ngoài `backend/` hoặc xóa artifact khỏi staging. Example PowerShell logic sau khi P0 code changes hoàn tất:

```powershell
Set-Location <repo-root>
$stage = Join-Path $env:TEMP "flashcard-lambda-stage"
$zip = Join-Path $env:TEMP "flashcard-backend.zip"
Remove-Item -Recurse -Force -LiteralPath $stage -ErrorAction SilentlyContinue
Remove-Item -Force -LiteralPath $zip -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item backend/app.js,backend/lambda.js,backend/package.json,backend/package-lock.json -Destination $stage
Copy-Item backend/src -Destination $stage -Recurse
Push-Location $stage
npm ci --omit=dev
Compress-Archive -Path * -DestinationPath $zip -Force
Pop-Location
Get-Item $zip | Select-Object FullName,Length,LastWriteTime
```

Notes:

- `server.js`, local `data/`, `exports/`, `public/`, existing zip và dev files không cần trong Lambda target nếu `SERVE_STUDY_STATIC=false`.
- `lambda.js` phải ở root của zip để handler `lambda.handler` resolve.
- Không ghi secret vào zip.
- Validate unzip tree locally nếu Lambda báo import error.

## 7. Create Lambda function

AWS Console -> Lambda -> Create function -> Author from scratch.

```text
Name: <LAMBDA_FUNCTION>
Runtime: Node.js 24.x (after compatibility approval)
Architecture: x86_64 for lowest compatibility uncertainty
Execution role: existing role from section 5
```

Chọn `nodejs24.x` (hỗ trợ tới 2028-04-30), không phải `nodejs22.x` (hết hỗ trợ 2027-04-30). Máy dev đang chạy Node v24.11.1, nên 24.x cũng cho parity local/Lambda.

Upload zip. Set:

```text
Handler: lambda.handler
Memory: 256 MB
Timeout: 15 seconds
```

Environment variables:

```text
DATA_STORE=dynamodb
USERS_TABLE=<USERS_TABLE>
FLASHCARDS_TABLE=<FLASHCARDS_TABLE>
CATEGORIES_TABLE=<CATEGORIES_TABLE>
JWT_SECRET=<strong secret>
EXPORT_BUCKET=<EXPORT_BUCKET>
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://<EXTENSION_ID>,<SITE_ORIGIN>
API_BASE_URL=<fill after API creation; update later>
SERVE_STUDY_STATIC=false
USE_AMAZON_TRANSLATE=true
REQUIRE_TRANSLATE_AUTH=true
TRANSLATE_MAX_LENGTH=120
```

Do not set `CORS_ALLOW_ALL=true`.

Không thêm `AWS_REGION` bằng Lambda Console/SAM environment configuration. Lambda runtime tự inject reserved `AWS_REGION`; `backend/src/config.js` sẽ đọc giá trị này. Chỉ set region trong local shell/profile khi chạy ngoài Lambda.

JWT secret guidance:

- Generate a high-entropy value outside source control.
- Do not show it in screen recording.
- For production, use a managed secret/parameter approach; plain Lambda env is accepted only as documented demo trade-off with encryption/console access controls.

## 8. Create API Gateway HTTP API

AWS Console -> API Gateway -> Create API -> HTTP API -> Build.

1. Integration: Lambda `<LAMBDA_FUNCTION>`.
2. API name: `<HTTP_API>`.
3. Route: `ANY /{proxy+}`.
4. Stage: `$default`, auto-deploy ON for simple demo.
5. CORS:

```text
Allow origins:
  http://localhost:3000
  chrome-extension://<EXTENSION_ID>
  <SITE_ORIGIN>

Allow headers:
  Content-Type
  Authorization

Allow methods:
  GET
  POST
  PUT
  DELETE
  OPTIONS
```

Save invoke URL as `API_BASE_URL` without trailing slash. Update Lambda `API_BASE_URL` and verify Lambda `ALLOWED_ORIGINS` exactly matches CORS origins.

Smoke:

```powershell
$ApiBaseUrl = "https://<api-id>.execute-api.<region>.amazonaws.com"
Invoke-RestMethod "$ApiBaseUrl/api/health"
```

Expected:

```json
{ "ok": true, "service": "flashcard-backend" }
```

If 500/import error: inspect CloudWatch; do not alter CORS or bucket permissions because they are unrelated.

## 9. Backend functional smoke

Use a new demo user. Do not paste real token into docs/log.

```powershell
$username = "demo_$(Get-Random)"
$password = "Use-A-Strong-Demo-Password-2026"
$auth = Invoke-RestMethod -Method Post `
  -Uri "$ApiBaseUrl/api/auth/register" `
  -ContentType "application/json" `
  -Body (@{ username=$username; password=$password } | ConvertTo-Json)
$headers = @{ Authorization = "Bearer $($auth.token)" }
Invoke-RestMethod -Uri "$ApiBaseUrl/api/me" -Headers $headers
```

Translate with explicit source during diagnosis:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "$ApiBaseUrl/api/translate" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body (@{ text="resilient"; sourceLanguageCode="en"; targetLanguageCode="vi" } | ConvertTo-Json)
```

Then test actual UI-compatible `{word:"resilient"}` to verify `auto` + Comprehend permission.

## 10. Create S3 static website bucket

Create separate bucket `<SITE_BUCKET>`.

For demo website endpoint:

1. Enable Static website hosting.
2. Index document: `index.html` (subfolder requests `/study/` resolve `study/index.html`).
3. Disable Block Public Access only for this site bucket, acknowledging warning.
4. Add public-read policy restricted to objects in this bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadStaticAssetsDemoOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<SITE_BUCKET>/*"
    }
  ]
}
```

Do not reuse export bucket.

## 11. Prepare and upload static assets

Before upload, deployment copies of config must contain:

Study `config.js`:

```js
window.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://<api-id>.execute-api.<region>.amazonaws.com",
  GAME_URL: "/game/"
};
```

Game `config.js`:

```js
window.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://<api-id>.execute-api.<region>.amazonaws.com",
  STUDY_URL: "/study/",
  REALTIME_URL: ""
};
```

> **Cảnh báo (AUD-P0-08): đặt `REALTIME_URL: ""` KHÔNG tắt được realtime.**
> `game/app.js:3` dùng `window.FLASHCARD_CONFIG?.REALTIME_URL || createRealtimeUrl()`. Chuỗi rỗng là falsy nên rơi vào fallback, và fallback dựng `ws://<site-bucket>.s3-website-...amazonaws.com/realtime` từ chính origin đang mở. S3 không phục vụ WebSocket, nên tab Realtime sẽ báo "Realtime connection failed." và ném lỗi ra console - làm fail tiêu chí "no uncaught errors" ở `09_TEST_AND_ACCEPTANCE.md` mục 10.
>
> Phải tắt realtime thật sự **trước khi upload** (một trong hai):
>
> - Ẩn/xóa nút và panel Realtime trong `game/index.html` ở bản deploy AWS, hoặc
> - Guard trong `game/app.js`: chỉ mở WebSocket khi `REALTIME_URL` thực sự có giá trị.
>
> Cả hai là code change, thuộc AWS-005 - làm xong rồi mới chạy mục này.

Upload preserving prefixes:

```text
backend/public/study/* -> s3://<SITE_BUCKET>/study/
backend/public/game/*  -> s3://<SITE_BUCKET>/game/
```

Open:

```text
<SITE_ORIGIN>/study/
<SITE_ORIGIN>/game/
```

Use browser Network tab:

- Assets 200.
- API requests go to API Gateway, not site origin/localhost.
- No mixed-content block (HTTP site calling HTTPS API is allowed, but page itself remains insecure; demo-only).
- Realtime is not claimed/deployed.

## 12. Configure extension

Deployment value:

```js
globalThis.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://<api-id>.execute-api.<region>.amazonaws.com",
  STUDY_URL: "http://<site-bucket>.s3-website-<region>.amazonaws.com/study/"
};
```

Manifest API permission can be tightened to actual execute-api host, while broad web match permissions may remain necessary for selection/content-script behavior. Never remove permissions without retesting context menu on arbitrary HTTP/HTTPS pages.

> **Cảnh báo (AUD-P0-07): nút Translate trong editor sẽ bị CORS chặn.**
> `contentScript.js:156` gọi `/api/translate` bằng `fetch()` ngay trong trang web. Content script gửi request với `Origin` của **trang web đó** (ví dụ `https://en.wikipedia.org`), không phải `chrome-extension://<id>` - host permissions không miễn trừ CORS cho content script kể từ Chrome 85.
>
> Origin đó không nằm trong `ALLOWED_ORIGINS`, nên Express trả `403 Origin is not allowed by CORS`. Ở local không thấy lỗi vì `DATA_STORE=local` bật `allowAllOrigins`.
>
> Không có cách sửa nào trong runbook này. Thêm origin của mọi trang web vào allowlist là bất khả thi, và đặt `CORS_ALLOW_ALL=true` vi phạm SR-05 (biến `/api/translate` thành endpoint mở cho mọi website).
>
> Trước khi demo, chọn một trong hai:
>
> - **Sửa code (khuyến nghị):** chuyển lời gọi translate sang `background.js` service worker qua `chrome.runtime.sendMessage`; service worker gọi API với origin `chrome-extension://<id>`, khớp allowlist.
> - **Thu hẹp phạm vi:** chỉ demo translate từ popup (popup đã chạy đúng origin extension), và ghi rõ trong báo cáo rằng translate trong editor là local-only.
>
> Popup login/sync/export **không** bị ảnh hưởng - chúng chạy trong ngữ cảnh extension.

Chrome steps:

1. `chrome://extensions` -> Developer mode.
2. Load/reload unpacked root folder.
3. Copy actual extension ID.
4. If ID differs from worksheet, update both API Gateway CORS and Lambda `ALLOWED_ORIGINS`, then retry.

## 13. Export validation

Call export through UI/API. Validate:

- Response `downloadUrl` starts with `https://` S3 signed URL.
- Signed URL downloads JSON within 15 minutes.
- Object key begins with authenticated `userId/`.
- Opening raw object URL without query signature returns 403.
- Export bucket Block Public Access remains ON.

Never paste full signed URL into `LOG.md` or screenshot because it is temporary bearer access.

## 14. CloudWatch setup

1. Lambda log group `/aws/lambda/<LAMBDA_FUNCTION>` -> retention 14 days.
2. Create alarm: Lambda Errors >= 1 over suitable demo window.
3. Create alarm: Lambda Throttles >= 1.
4. Optional API Gateway 5xx alarm.
5. Confirm log lines do not include Authorization header/password/pre-signed URL.

## 15. Rollback

### Lambda

- Keep previous zip and configuration record outside repo.
- Upload previous known-good zip or use published version/alias if configured.
- Restore prior env values except never restore compromised secret.

### Static site

- If versioning enabled, restore previous object versions.
- Otherwise re-upload known-good asset bundle.

### Extension

- Restore previous `extension-config.js` deployment config and reload.

### Data

- Do not delete tables to rollback code.
- If test data must be removed, delete only known demo-user partition/items after evidence and approval.

## 16. Cleanup after demo

- Disable/delete API/Lambda if project not continuing.
- Empty then delete S3 buckets when approved.
- Delete DynamoDB tables only after export/approval.
- Remove alarms/log groups or set retention.
- Remove IAM role/policies no longer used.
- Verify budget dashboard and no WebSocket/extra resources were accidentally created.
