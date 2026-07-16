# 08. Security, Operations và Cost Controls

## 1. Security posture summary

MVP là internship demo, không phải production-ready SaaS. Security baseline vẫn phải bảo vệ credentials, user isolation và private exports. Các trade-off demo phải được nói rõ, không được che bằng claim “serverless tự động an toàn”.

## 2. Threat model

### Assets

- Password hashes và JWT secret.
- JWT access tokens.
- Flashcard content và browsing context (`sourceUrl`, `sourceTitle`).
- Private export objects/pre-signed URLs.
- AWS account budget/quota.

### Threat actors/failures

- Anonymous caller brute-force login/register.
- Authenticated user thử truy cập data user khác.
- Malicious webpage tương tác với extension/content script.
- XSS hoặc HTTP man-in-the-middle trên S3 website demo.
- Leaked JWT/pre-signed URL/log screenshot.
- Cost abuse qua Translate/sync.
- Misconfigured bucket/CORS/IAM.

## 3. Controls hiện có

- bcrypt hash, không lưu plaintext password backend.
- JWT protected routes.
- Owner derived from JWT `sub`.
- DynamoDB partition by `userId`.
- Translate auth required trong Dynamo mode.
- Translate input max 120.
- Export bucket target private, pre-signed URL 15 phút.
- Express CORS allowlist.
- `.env`, data, exports, node_modules ignored.

## 4. Required hardening trước demo public

### Secrets

- `JWT_SECRET` tối thiểu high-entropy random; không reuse password.
- Không dùng fallback local secret trên Lambda.
- Không log env dump.
- Nếu secret bị lộ: rotate immediately; chấp nhận existing JWT bị invalidated.
- Production path: managed secret/parameter and deployment role access control.

### Auth

- Bỏ prefilled `student/password123` khỏi popup production build.
- Tăng password requirement; current min 6 chỉ chấp nhận local demo.
- Dùng unique cloud demo accounts.
- Thêm rate limit/lockout/captcha sau MVP nếu endpoint public lâu dài.
- JWT 7 ngày và không revoke là limitation; logout chỉ xóa token client.

### Authorization/user isolation

Required negative tests:

- User A token không update/delete card ID của user B.
- User A không list categories/cards của B.
- Card request không được phép override `userId`.
- Export luôn prefix theo authenticated user.

### S3

- Public site bucket và private export bucket là hai resources khác nhau.
- Export: Block Public Access ON, không website hosting, no wildcard public policy.
- Site: chỉ assets public; không upload `.env`, zip, logs, source data.
- Lifecycle export 7 ngày cho demo để hạn chế retention/cost.
- Pre-signed URL không đưa vào logs/chat/report.

### CORS

- Exact origins, no `*` final demo.
- CORS không phải authorization; Postman/curl vẫn gọi được API, nên JWT vẫn bắt buộc.
- API Gateway và Express allowlists phải đồng bộ.
- Extension ID unpacked/published có thể khác.

### HTTP static site limitation

S3 website endpoints không hỗ trợ HTTPS. Vì site lưu JWT trong localStorage, chỉ dùng fake data/demo account. Production target:

```text
Browser -> HTTPS CloudFront/Amplify -> S3 static assets
```

Nếu dùng CloudFront, ưu tiên private S3 origin + Origin Access Control; website endpoint/public-bucket pattern không phải end state.

## 5. IAM least privilege

Lambda role chỉ cần:

```text
dynamodb:GetItem/PutItem/UpdateItem/DeleteItem/Query
  on three exact table ARNs

s3:PutObject/GetObject
  on export bucket objects only

translate:TranslateText
comprehend:DetectDominantLanguage (only because source=auto)

CloudWatch Logs permissions via Lambda basic execution role
```

Không cần:

- DynamoDB Scan.
- Public S3 access.
- IAM permissions.
- `s3:*`, `dynamodb:*`, `translate:*`.
- Long-lived AWS keys in Lambda/extension.

## 6. Input/data protection gaps

Backlog validation:

- Max lengths cho `word`, `meaning`, `wordform`, `sourceUrl`, `sourceTitle`.
- Max cards per sync và max export cards.
- Reject unexpected types/oversized identifiers.
- Sanitize display via text APIs; review frontend for unsafe `innerHTML` before production.
- Avoid returning raw internal error messages for 500.

Privacy:

- `sourceUrl`/`sourceTitle` optional and potentially sensitive.
- Provide delete/export behavior documentation.
- Use fake sites/data in screenshots.

## 7. Logging standard target

Recommended structured fields:

```json
{
  "level": "info",
  "event": "request_complete",
  "requestId": "api-gateway-or-lambda-id",
  "method": "POST",
  "route": "/api/sync",
  "status": 200,
  "durationMs": 143,
  "userIdHash": "non-reversible-or-omitted",
  "itemCount": 10
}
```

Never log:

- Password/passwordHash.
- Authorization/JWT.
- Full flashcard meanings/source URLs unless explicit debug on fake data.
- JWT secret/AWS env.
- Full pre-signed URL query.

Current code does not yet provide this structured logging; it is a P1 improvement.

## 8. Metrics và alarms

Minimum dashboard/checklist:

| Signal | Why | Initial action |
|---|---|---|
| Lambda Invocations | Traffic/evidence | Compare demo actions |
| Lambda Errors | App/AWS failure | Alarm >=1 during demo window |
| Lambda Duration/p95 | Sync latency | Investigate near 15s timeout |
| Lambda Throttles | Concurrency issue | Alarm >=1 |
| API Gateway 4xx | Auth/client/CORS symptoms | Review rate and routes |
| API Gateway 5xx | Integration failure | Alarm |
| DynamoDB throttled requests | 1 RCU/WCU insufficient | Pause load/increase capacity |
| Translate usage | Cost/abuse | Budget and app limit |
| S3 export object count/bytes | Retention/cost | Lifecycle cleanup |

## 9. Backup và recovery

### DynamoDB

- Demo baseline: preserve data, manual export/test account recreation.
- Better: enable PITR if budget/scope allows.
- Never assume local extension is complete backup because sync is upsert-only and local clear exists.

### S3 export

- Export objects are derived data, short retention; no backup required for demo.
- Versioning optional and may increase cost/cleanup complexity.

### Static assets

- Source in Git is primary backup.
- S3 versioning improves rollback but not mandatory.

### Lambda

- Git commit + reproducible build is primary recovery.
- Keep deployment manifest/checksum rather than committing zip.

## 10. Cost model và controls

Potential cost drivers:

- DynamoDB provisioned capacity billed even idle.
- Translate characters; `auto` detection may also use Comprehend.
- Lambda invocations/duration.
- API Gateway requests.
- S3 storage/requests/data transfer.
- CloudWatch log ingestion/retention.

Controls:

- Budget + billing alert before deploy.
- 1 RCU/1 WCU per table for low-volume demo; monitor throttling.
- Translate auth + 120-char cap; don't translate during game loops.
- Export lifecycle.
- CloudWatch retention 14 days.
- Avoid high-frequency polling and do not deploy unused WebSocket resources.
- Delete sandbox resources after demo when approved.

Do not hard-code price estimates because region/free-tier/account pricing changes. Use [AWS Pricing pages/calculator](https://calculator.aws/) at planning time and record date/region/assumptions.

## 11. Incident playbooks

### AccessDenied on Translate

1. Check Lambda role has `translate:TranslateText`.
2. If source `auto`, check `comprehend:DetectDominantLanguage`.
3. Confirm same supported region.
4. Test explicit source `en` to isolate auto-detect dependency.

### CORS failure

1. Capture browser `Origin` exactly.
2. Compare API Gateway CORS and Lambda `ALLOWED_ORIGINS`.
3. Check scheme, port, no trailing slash.
4. Confirm extension ID.
5. Never use wildcard as final fix.

### Lambda import failure

1. Inspect CloudWatch INIT error.
2. Confirm handler `lambda.handler` and zip root layout.
3. Confirm production dependencies included.
4. Confirm runtime supported and ESM `type=module` package present.

### Export download failure

1. Confirm signed URL not prefixed with API base.
2. Check expiry.
3. Check Lambda role Get/Put on object ARN.
4. Check bucket/region/env name.
5. Keep bucket private.

### DynamoDB timeout/throttle

1. Check exact table env names and keys.
2. Inspect consumed/throttled metrics.
3. Retry small batch.
4. Avoid repeated large sync/category deletion.
5. Increase capacity temporarily only with budget awareness; implement batching before scale.

## 12. Production hardening roadmap

- HTTPS CloudFront/Amplify hosting.
- Managed auth (Cognito) or short-lived access + refresh/revocation model.
- AWS WAF/rate limiting as justified.
- Secrets Manager/SSM and deployment automation.
- Structured logs/tracing, alarms, dashboards.
- DynamoDB pagination/batching/conditional writes/PITR.
- Data retention/privacy policy.
- CI security/test gates.

