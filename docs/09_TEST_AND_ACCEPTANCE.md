# 09. Test Strategy, E2E và Acceptance Evidence

## 1. Test principles

- Test local first, AWS second.
- Positive + negative + isolation tests.
- Separate “HTTP 200” from “data persisted correctly”.
- Không lưu token/password/pre-signed URL trong evidence.
- Mọi failure ghi observed result, expected result, timestamp, region, commit và CloudWatch request ID nếu có.

## 2. Test layers

| Layer | Scope | Current state | Required |
|---|---|---|---|
| Syntax | Node entry/source files | Partial | All changed JS |
| Unit | validation, scoring, auth helpers | Missing | P1 |
| Repository integration | local/Dynamo behaviors | Missing | P1 |
| API integration | Express routes/auth/errors | Manual | MUST smoke + future automated |
| Browser extension | MV3/context menu/storage | Manual | MUST |
| Static Study/Game | assets/config/navigation | Manual | MUST |
| AWS E2E | API->Lambda->DDB/Translate/S3 | Not evidenced | MUST |
| Security negative | auth/CORS/isolation/private S3 | Not evidenced | MUST |
| Load boundary | sync/category delete | Missing | SHOULD |

## 3. Pre-deploy automated checks

```powershell
Set-Location backend
npm ci
npm run check
npm audit --omit=dev
```

Additional syntax checks until script is improved:

```powershell
Get-ChildItem src -Filter *.js | ForEach-Object { node --check $_.FullName }
node --check public/study/app.js
node --check public/game/app.js
Set-Location ..
node --check popup.js
node --check contentScript.js
node --check background.js
```

IaC:

```powershell
sam validate --lint --template-file infra/template.yaml
```

Snapshot audit result 2026-07-14 (chạy lại và xác nhận khi review docs):

- `npm run check`: PASS.
- `npm audit --omit=dev`: PASS, 0 reported vulnerabilities.
- `node --version`: **v24.11.1** - căn cứ để chọn runtime `nodejs24.x`.
- SAM validate: NOT RUN, SAM CLI unavailable.

Lưu ý: `npm run check` chỉ `node --check` cho `app.js`, `server.js`, `lambda.js`. Nó không chạy code, nên **không** phát hiện được các lỗi runtime/CORS như AUD-P0-07 và AUD-P0-08. Đừng dùng nó làm bằng chứng "sẵn sàng deploy".

## 4. Local regression matrix

| ID | Test | Expected |
|---|---|---|
| L-01 | Start backend with default local mode | Server at :3000, data store local |
| L-02 | `GET /api/health` | 200 expected JSON |
| L-03 | Register unique user | 201 token/user |
| L-04 | Duplicate register | 409 |
| L-05 | Bad login | 401 |
| L-06 | Protected route no token | 401 |
| L-07 | Add/list/update/delete card | Correct data/ownership |
| L-08 | Add/delete category | Cards move to Uncategorized |
| L-09 | Translate local | `local-mock-translate` unless override |
| L-10 | Export local | Relative `/exports/...`, file downloads |
| L-11 | Extension offline save with backend off | Local card persists |
| L-12 | Extension sync after backend on | Created/updated counts reasonable |
| L-13 | Study CRUD/session | No console error |
| L-14 | Game solo scoring | Exact=100, partial=50, wrong=0 |
| L-15 | Local realtime two tabs/users | Optional regression only |

## 5. AWS core smoke sequence

Run in this order to isolate failures:

1. Health.
2. Register.
3. `/api/me`.
4. Categories list.
5. Create/list/update/delete one card.
6. Sync small set.
7. Translate explicit `en` then UI payload with `auto`.
8. Export signed URL/private raw URL.
9. Static site.
10. Extension full flow.

Do not start with extension; browser storage/CORS/config add too many variables.

## 6. AWS API acceptance cases

| ID | Request/scenario | Expected | Evidence |
|---|---|---|---|
| A-01 | Health via execute-api URL | 200/service | Redacted response + timestamp |
| A-02 | Register unique username | 201/token not shown | Dynamo Users item screenshot sans hash detail |
| A-03 | Login correct | 200 | Redacted |
| A-04 | Login wrong | 401 | Status/error |
| A-05 | `/api/me` no token | 401 | Status |
| A-06 | Create card | 201 | cardId and DDB composite key |
| A-07 | List cards | only current user | Count/sample fake data |
| A-08 | Update card | persisted updatedAt/category | Before/after |
| A-09 | Delete card | deleted, second delete 404 | Statuses |
| A-10 | Category delete | affected cards -> Uncategorized | API + DDB |
| A-11 | Sync 10 cards | count=10, no duplicate IDs | Response + query count |
| A-12 | Translate `{text,source=en,target=vi}` | provider Amazon | Response |
| A-13 | Translate `{word}` | works with auto detect | Response + no AccessDenied |
| A-14 | Translate no token | 401 | Status |
| A-15 | Translate >120 chars | 400 | Status/error |
| A-16 | Export | absolute signed URL | Redact query |
| A-17 | Unknown route | 404 | Status |
| A-18 | Translate từ content script trên trang web thật (AUD-P0-07) | Sau khi sửa AWS-007: 200, không 403 CORS. Nếu chưa sửa: **fail có chủ đích**, phải ghi nhận thay vì bỏ qua | Network tab: Origin header gửi lên + status |
| A-19 | Mở `/game/` trên S3, xem Network + Console (AUD-P0-08) | Không có WebSocket request tới `/realtime`, không có uncaught error | Console/Network screenshot |

## 7. Cross-user isolation test

Create users A and B.

1. A creates card A1.
2. B lists cards: A1 absent.
3. B calls PUT `/api/flashcards/<A1 id>`: expect 404.
4. B calls DELETE same ID: expect 404.
5. B export: A1 absent.
6. Inspect DynamoDB: same `cardId` under different `userId` would be distinct item.

Acceptance: no response gives B content of A1. Raw `userId` exposure for own items is tracked separately, not cross-user breach.

## 8. CORS tests

### Allowed site origin

From Study Web, login/list succeeds; response contains expected allow-origin behavior.

### Allowed extension origin

Popup login/sync succeeds with actual extension ID.

### Disallowed origin

Send preflight/request with fake origin:

```powershell
$headers = @{
  Origin = "https://not-allowed.example"
  "Access-Control-Request-Method" = "POST"
  "Access-Control-Request-Headers" = "authorization,content-type"
}
Invoke-WebRequest -Method Options -Uri "$ApiBaseUrl/api/sync" -Headers $headers
```

Acceptance: no permissive allow-origin for fake origin. Do not rely only on curl response to prove browser behavior; also test browser console/network.

## 9. S3 export tests

| Test | Expected |
|---|---|
| Signed URL within 15 min | 200 JSON download |
| Signed URL after expiry | denied |
| Raw object URL | 403/denied |
| Export bucket website endpoint | not enabled |
| Bucket public access analyzer | no public access |
| Object key | starts with authenticated userId |
| Lifecycle | rule visible/configured |

## 10. Static site tests

- `/study/` and `/game/` assets 200.
- Cache does not serve stale `config.js` after deployment; hard reload/version as needed.
- API URL is execute-api HTTPS, not localhost/same-origin S3.
- Study -> Game and Game -> Study links resolve.
- Register/login/card CRUD on Study.
- Game reads same auth only if same site origin and path layout.
- Realtime control is disabled/documented; empty `REALTIME_URL` must not be presented as AWS feature.
- Browser console contains no uncaught errors.

## 11. Extension E2E

1. Reload unpacked extension after config change.
2. Register/login cloud demo user.
3. Open a normal HTTPS webpage.
4. Highlight a word -> context menu -> editor opens.
5. Translate. **Đây là bước sẽ lộ AUD-P0-07**: nếu AWS-007 chưa làm, request bị 403 CORS vì content script gửi origin của trang web. Mở DevTools Network, kiểm tra `Origin` header thực tế trước khi kết luận nguyên nhân. Sau khi sửa, verify Amazon provider qua API/CloudWatch.
6. Edit/save local.
7. Confirm popup card exists offline.
8. Sync.
9. Open Study; same card visible.
10. Edit cloud card and reload.
11. Export; signed URL opens directly.
12. Clear local only after backup/evidence if testing clear.

Test restricted pages (`chrome://`, Chrome Web Store) are expected not to allow content script; do not classify as app bug.

## 12. Boundary/performance tests

Run with fake data and monitor Lambda duration/Dynamo throttles:

| Dataset | Test |
|---:|---|
| 1 card | baseline sync |
| 10 cards | normal demo |
| 50 cards | moderate |
| 100 cards | agreed upper demo probe |
| close to 1 MB body | reject/behavior observation, not routine |

Stop if throttling/cost rises. Current sequential sync and 1 WCU mean this is characterization, not load benchmark. Record partial writes after forced timeout if tested in isolated environment.

## 13. Unit tests to add

### Scoring

- Exact/case/whitespace/punctuation.
- 50% longest common substring boundary.
- Empty answer/expected.
- Unicode letters.

### Validation

- Username valid/invalid/boundaries.
- Password boundary.
- Required strings and category normalization.
- Flashcard ID aliases.
- Oversized fields once limits added.

### Auth

- Register duplicate race mapping.
- JWT claims/expiry/invalid signature/user changed.
- Password hash not returned.

### Repositories

- Local and Dynamo contract parity.
- Pagination.
- Conditional create/upsert.
- Category move behavior.

## 14. Evidence package template

```text
Deployment date/time:
Region:
Git commit:
Lambda runtime:
API ID/name (account ID redacted):
Table names:
Site/export bucket names if safe to share:
Extension ID if safe:

Checks:
  preflight:
  API:
  isolation:
  translate:
  export:
  static web:
  extension:
  CloudWatch:
  cost/budget:

Known failures/limitations:
Rollback artifact/reference:
Tester:
```

## 15. Final go/no-go

No-go if any:

- Runtime deprecated/P0 not closed.
- Translate auto AccessDenied.
- Export bucket public.
- User isolation failure.
- JWT secret fallback/known sample credential.
- Extension/Study still calls localhost.
- CORS wildcard used to mask issue - **kể cả khi lý do là "để nút Translate trong editor chạy được"** (AUD-P0-07). Nới allowlist để chữa lỗi này là no-go, không phải workaround.
- Realtime claimed as AWS-deployed without WebSocket architecture.
- Game vẫn mở WebSocket tới site origin vì `REALTIME_URL=""` được coi là đã tắt realtime (AUD-P0-08).
- Editor-translate hỏng trên AWS mà **không** có quyết định chính thức hạ FR-04b xuống `OUT`.

Go for demo when all MUST requirements pass, evidence is redacted, alarms/budget exist and limitations are stated clearly.


# Cập nhật 2026-07-21 - Gỡ Amazon Translate

## Test case bị bỏ

Các case sau không còn đối tượng để test:

- `L-09` Translate local (`local-mock-translate`).
- `A-12` Translate `{text,source=en,target=vi}`.
- `A-13` Translate `{word}` với auto detect.
- `A-14` Translate no token -> 401.
- `A-15` Translate >120 chars -> 400.
- `A-18` Translate từ content script trên trang web thật (AUD-P0-07).

`A-18` đáng chú ý: nó từng được thiết kế để **fail có chủ đích** nếu AWS-007
chưa sửa. Giờ nó bị bỏ vì tính năng không tồn tại, không phải vì được cho qua.

## Test case thay thế

Thêm một case thủ công cho luồng mới:

| ID | Test | Expected | Evidence |
|---|---|---|---|
| A-12b | Editor trong trang web: highlight từ, nhập nghĩa tay, save | Card lưu vào `chrome.storage.local`, không có network request nào tới `/api/translate` | Network tab trống với path đó |

## Coverage và checklist

- Bảng mục 1: "AWS E2E | API->Lambda->DDB/Translate/S3" -> "API->Lambda->DDB/S3".
- Quy trình mục 4 bước 7 ("Translate explicit `en` then UI payload với `auto`"):
  bỏ.
- Extension flow mục cuối bước 5: không còn bước Translate; thay bằng nhập nghĩa
  tay rồi save. Ghi chú AUD-P0-07 ở bước đó không còn áp dụng.
- Evidence template: bỏ dòng `translate:`.

## No-go list

Bỏ ba mục liên quan Translate: "Translate auto AccessDenied", phần "kể cả khi lý
do là để nút Translate trong editor chạy được" trong mục CORS wildcard (bản thân
mục CORS wildcard vẫn là no-go), và "Editor-translate hỏng trên AWS mà không có
quyết định chính thức hạ FR-04b xuống `OUT`" - FR-04b đã chính thức là `OUT`,
xem `docs/02_REQUIREMENTS.md`.
