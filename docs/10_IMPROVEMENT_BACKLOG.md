# 10. Improvement Backlog và Priorities

> Đây là backlog đề xuất từ audit. Task hiện tại chỉ ghi tài liệu, không implement. Agent sau phải xác nhận scope, bảo toàn worktree và cập nhật `LOG.md` khi thực hiện.

## 1. Priority definitions

- `P0`: deploy/demo blocker.
- `P1`: rủi ro cao; xử lý trước public demo hoặc ngay sau core deploy.
- `P2`: chất lượng/scalability/maintainability.
- `P3`: future/product expansion.

## 2. P0 - Must close before deploy

### AWS-001 - Upgrade Lambda runtime

Problem: SAM/docs dùng deprecated `nodejs20.x` (deprecation 2026-04-30).

Scope:

- `infra/template.yaml` -> **`nodejs24.x`** (hỗ trợ tới 2028-04-30). Không chọn `nodejs22.x`: hết hỗ trợ 2027-04-30, sẽ phải nâng cấp lại sau chưa đầy một năm.
- `backend/package.json`: `engines.node` hiện là `">=18"`, nâng lên `">=22"` hoặc `">=24"`.
- Reinstall/test dependencies under target runtime. Máy dev đang chạy Node v24.11.1, nên `nodejs24.x` cho parity local/Lambda.

Definition of done:

- AWS runtime page confirms supported on deployment date.
- `npm ci`, syntax/unit checks pass on same major Node version.
- `sam validate --lint` pass.
- Lambda smoke pass.

### AWS-002 - Fix Translate auto-detection IAM

Problem: code defaults source `auto`, role/template lacks Comprehend permission.

Options:

1. Add `comprehend:DetectDominantLanguage` (recommended to preserve UX).
2. Force/send source `en` and document limitation.

Definition of done:

- UI-compatible `{word}` request returns `amazon-translate` on AWS.
- Least-privilege policy recorded.
- No AccessDenied in CloudWatch.

### AWS-003 - Remove reserved `AWS_REGION` configuration

Problem: SAM cố set `AWS_REGION`, là reserved key do Lambda runtime tự cung cấp.

Scope:

- Xóa configured `AWS_REGION` khỏi SAM/Console instructions.
- Giữ code đọc runtime-provided region.
- Test SAM deploy không còn reserved-key error.

Definition of done:

- `sam validate --lint` pass.
- Stack/function configuration không chứa user-defined `AWS_REGION`.
- Lambda SDK calls dùng đúng deployment region.

### AWS-004 - Production/demo config materialization

Problem: extension localhost, static pages same-origin, origins unknown.

Scope:

- Decide build/deploy config strategy.
- Populate API/site URLs without committing secrets.
- Sync API Gateway CORS and Express allowed origins.
- Handle actual extension ID.

Definition of done:

- Search deployment bundle finds no unintended localhost.
- Browser Network calls correct API.
- Allowed and denied CORS tests pass.

### AWS-005 - Explicitly exclude realtime from AWS MVP UI/claims

Problem: local `ws` prototype cannot run via current Lambda HTTP API.

Scope:

- Hide/disable realtime feature in AWS build or clearly label unavailable.
- Keep solo game if tests pass.
- Do not delete local prototype unless separately requested.

Definition of done:

- AWS demo has no broken WebSocket connection/claim.
- Architecture/report lists realtime as future.

### AWS-006 - Separate clean deploy artifact

Problem: zip exists under `backend`; SAM/manual packaging can include stale/nested artifact.

Scope:

- Ignore build artifacts.
- Build into clean staging.
- Exclude local data/public/server/realtime when not needed.

Definition of done:

- Zip root has handler/package/src/node_modules only as intended.
- Reproducible command documented.
- No zip tracked or nested.

### AWS-007 - Định tuyến translate qua background service worker

Problem: `contentScript.js:156` fetch `/api/translate` trực tiếp từ trang web. Content script gửi request với origin của trang web đó, không phải `chrome-extension://<id>`, và từ Chrome 85 host permissions không miễn trừ CORS. Trên AWS với exact allowlist, request bị 403. Local che lỗi vì `allowAllOrigins` mặc định bật ở `DATA_STORE=local`.

Đây là P0 **bắt buộc sửa code** - không đóng được bằng cấu hình. Xem AUD-P0-07 và ADR-08.

Scope:

- `contentScript.js`: thay `fetch()` bằng `chrome.runtime.sendMessage({ type: "translate", word })`.
- `background.js`: thêm `chrome.runtime.onMessage` listener gọi `/api/translate` rồi trả kết quả. Service worker chạy ở origin extension nên khớp allowlist.
- Giới hạn message handler chỉ cho phép đúng endpoint translate (Chrome khuyến nghị, tránh trang web độc hại lợi dụng extension làm proxy).
- Giữ nguyên UX editor.

Alternative nếu owner không muốn sửa code: hạ FR-04b xuống `OUT`, chỉ demo translate từ popup, ghi rõ limitation.

Definition of done:

- Translate trong editor hoạt động trên AWS với `ALLOWED_ORIGINS` exact, không có `*`.
- Không có 403 CORS trong CloudWatch/console khi bấm Translate trên trang web thật.
- Message handler không cho phép fetch URL tùy ý.

### AWS-008 - Tắt realtime UI thật sự trong bản AWS

Problem: `game/app.js:3` dùng `REALTIME_URL || createRealtimeUrl()`. Chuỗi rỗng là falsy nên fallback dựng `ws://<origin>/realtime`; trên S3 sẽ fail và ném lỗi console. Hướng dẫn `REALTIME_URL=""` trong runbook cũ **không đạt mục đích**.

Scope (chọn một):

- Ẩn/xóa nút và panel Realtime trong `game/index.html` cho bản deploy AWS, hoặc
- Guard trong `game/app.js`: không mở WebSocket khi config rỗng; hiện thông báo "Realtime chỉ khả dụng khi chạy local".

Definition of done:

- Mở `/game/` trên S3: không có WebSocket request, không có uncaught error trong console.
- Realtime không được trình bày như tính năng AWS trong báo cáo.
- Prototype local vẫn chạy được (không xóa `realtimeServer.js`).

## 3. P1 - High value/risk reduction

### BE-001 - DynamoDB pagination

Add `LastEvaluatedKey` loops for flashcards/categories Query. Test multi-page behavior with mocked Dynamo or integration table.

### BE-002 - Bound and redesign sync

- Max cards per request.
- Field length limits.
- Chunk/batch strategy.
- Per-item result or atomicity expectation.
- Idempotent retry behavior.
- Clarify/delete sync semantics.

### BE-003 - Category delete scalability

Avoid unbounded sequential updates in one 15s Lambda. Options: limit demo, batch workflow, async job; preserve move-to-Uncategorized behavior.

### SEC-001 - Remove sample production credentials and strengthen passwords

- Remove prefilled popup credentials in deploy build.
- Password length/quality policy.
- Keep local seed behavior only when explicitly local.

### SEC-002 - Abuse protection

At minimum monitor/alarm; for longer public exposure add rate limiting for login/register/translate/sync. Avoid introducing expensive services solely for rubric without need.

### SEC-003 - Safe error/logging

- Generic 500 response.
- Structured request logs with correlation ID/status/duration.
- Redact auth/content/signed URL.
- Set retention.

### TEST-001 - Automated test foundation

Use Node test runner or minimal framework consistent with project. Cover scoring, validation, auth, repositories, route smoke. Add CI only after reliable local suite.

### INFRA-001 - Complete/validate IaC

- Runtime/IAM fix.
- `SERVE_STUDY_STATIC=false`.
- Log retention/alarms if simple.
- Optional static site bucket only if public-demo trade-off is explicit.
- Validate and deploy in sandbox.

### OPS-001 - S3 lifecycle and rollback

- Export lifecycle.
- Static asset versioning or versioned bundle manifest.
- Record artifact checksum/commit.

## 4. P2 - Maintainability and correctness

| ID | Improvement | Done signal |
|---|---|---|
| BE-004 | Conditional create to avoid silent card overwrite | Duplicate ID behavior tested |
| BE-005 | Preserve category `createdAt` | Re-add does not reset creation unless intended |
| BE-006 | Local/Dynamo response parity | Contract tests same public fields |
| BE-007 | Efficient random/category query | No full user-card load at scale or limitation stated |
| BE-008 | API versioning/schema docs | OpenAPI or maintained contract source |
| FE-001 | Generated per-environment config | No manual source edit/stale upload |
| FE-002 | Safer auth token handling | XSS review; HTTPS host; expiry UX |
| EXT-001 | Review Manifest permissions/store readiness | Justification and least permissions |
| DOC-001 | Align root README/AWS guides | No Node20/old layout contradictions |
| REPO-001 | Resolve duplicate project folder | One source of truth, archive decision logged |
| REPO-002 | Remove binary artifacts from working tree | Build outputs ignored |
| PRIV-001 | Privacy/retention/delete policy | User-facing statement and test |

## 5. P3 - Future product/platform

- CloudFront/Amplify HTTPS and custom domain.
- Cognito or improved auth/revocation.
- Async challenges and match history.
- API Gateway WebSocket realtime architecture.
- DynamoDB Rooms/Connections with TTL.
- Leaderboard with explicit access pattern/GSI.
- CI/CD via SAM/CloudFormation pipeline.
- Observability dashboard/tracing.

## 6. Recommended execution order

```text
AWS-001 -> AWS-002 -> AWS-003 -> AWS-006 -> AWS-004 -> AWS-005
-> AWS-007 (code) -> AWS-008 (code)
-> TEST-001 baseline -> INFRA-001 -> manual deploy/E2E
-> SEC-001/SEC-003/OPS-001 -> BE pagination/sync improvements
```

AWS-001..006 là config/scope. AWS-007 và AWS-008 là hai P0 **sửa code**, phải xong trước khi chạy runbook - nếu không, demo sẽ có nút Translate hỏng và console lỗi WebSocket.

If demo date is near, do not start P3. Limit dataset and clearly disclose P1/P2 limitations instead of risky last-minute rewrite.

## 7. Issue template for agents

```text
ID/title:
Why now:
Observed evidence/path:
Expected behavior:
In scope:
Out of scope:
Dependencies:
Security/cost impact:
Implementation approach:
Tests:
Docs to update:
Rollback:
LOG.md entry:
```

## 8. Decisions still requiring owner input

These should not be silently assumed in a future implementation:

- **Translate trong editor: sửa code định tuyến qua service worker (AWS-007), hay bỏ khỏi demo AWS và chỉ translate từ popup?** Đây là quyết định chặn deploy.
- S3 website HTTP accepted only for internship demo, or CloudFront required now?
- Keep source language auto (adds Comprehend permission/cost) or fixed English?
- Desired max cards per sync/export?
- Is cloud sync intended as upsert-only or true two-way synchronization?
- Should sample local accounts remain in development UI?
- Archive/delete/ignore duplicate `ChromeFlashCardExtension-test-aws-clean/`?
- Is solo Game part of AWS demo, or only Study?
