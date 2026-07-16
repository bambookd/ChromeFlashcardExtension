# 03. Current State Audit và Gap Analysis

> Audit read-only ngày 2026-07-14. Không có code nào được sửa để xử lý các vấn đề dưới đây.

## 1. Phương pháp và bằng chứng

Đã kiểm tra:

- Repository tree và Git status.
- Express routes, Lambda entry, local/DynamoDB repositories.
- Auth, validation, Translate, export, scoring và realtime code.
- Extension config/permissions/API calls.
- Study/Game static configuration.
- SAM template và deployment guides hiện có.
- `npm run check`: pass.
- `npm audit --omit=dev`: 0 vulnerability tại thời điểm chạy.
- `sam validate --lint`: chưa chạy được vì máy hiện tại không cài SAM CLI.

Lưu ý: `npm run check` chỉ chạy `node --check` cho `app.js`, `server.js`, `lambda.js`; nó không phải unit/integration test và không check toàn bộ `src/` hoặc browser JS.

## 2. Capability inventory AS-IS

### Backend

- Express app export riêng trong `backend/app.js`.
- Local startup riêng trong `backend/server.js`.
- Lambda handler dùng `serverless-http` trong `backend/lambda.js`.
- `DATA_STORE=local|dynamodb` chọn repository.
- JWT 7 ngày; bcryptjs cost 10; role mặc định `user`.
- CRUD flashcards/categories, sync, translate, export.
- Local bootstrap seed `student` và `teacher` với `password123`.

### Frontend/extension

- Manifest V3, context menu, content script, popup.
- Offline-first qua `chrome.storage.local`.
- Static Study và Game Web.
- JWT lưu trong `chrome.storage.local` ở extension và `localStorage` ở Study/Game.
- API base URL có config file nhưng đang mặc định localhost/same-origin.

### AWS integration

- AWS SDK v3.
- 3 DynamoDB tables.
- Amazon Translate `TranslateText`.
- Private S3 export với pre-signed GET URL 900 giây.
- SAM starter cho API Gateway HTTP API, Lambda, 3 tables và export bucket.

## 3. Blockers P0

### AUD-P0-01 - Lambda runtime đã deprecated

`infra/template.yaml` và `AWS_DEPLOYMENT.md` dùng Node.js 20. Đối chiếu [AWS Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) ngày 2026-07-14:

| Runtime | Trạng thái | Deprecation | Block function create |
|---|---|---|---|
| `nodejs20.x` | Deprecated | 2026-04-30 | 2027-02-01 |
| `nodejs22.x` | Supported | 2027-04-30 | 2027-06-01 |
| `nodejs24.x` | Supported | 2028-04-30 | 2028-06-01 |

Impact:

- `nodejs20.x` đã qua deprecation date. Function **vẫn tạo được** cho tới 2027-02-01, nên đây không phải hard failure; nhưng runtime không còn nhận security patch và không được support.
- Không nên dùng runtime đã deprecated cho bài demo/báo cáo mới.

Required action: đổi target sang **`nodejs24.x`**, không phải `nodejs22.x`.

Lý do chọn 24 thay vì 22:

- `nodejs22.x` chỉ còn hỗ trợ tới 2027-04-30, tức lặp lại đúng vấn đề này sau chưa đầy một năm.
- Máy phát triển hiện tại chạy Node **v24.11.1** (đã xác minh bằng `node --version`), nên `nodejs24.x` cho parity giữa local và Lambda; chọn 22 lại tạo mismatch mới.
- `backend/package.json` khai `engines.node: ">=18"`; cần nâng lên `">=22"` (hoặc `">=24"`) để phản ánh target.

### AUD-P0-02 - Translate `auto` thiếu IAM permission

Frontend gửi `{ word }`; service mặc định `SourceLanguageCode="auto"`. Amazon Translate gọi Amazon Comprehend để detect language khi dùng `auto`. AWS official docs nêu rõ hành vi này; policy hiện chỉ có `translate:TranslateText`, thiếu `comprehend:DetectDominantLanguage`.

Impact: Translate trên Lambda có khả năng trả AccessDenied dù các phần API khác hoạt động.

Required action:

- Cách ít thay đổi UX nhất: thêm `comprehend:DetectDominantLanguage` với resource `*` vào Lambda role.
- Hoặc gửi source language explicit (ví dụ `en`) và bỏ `auto`; đây là thay đổi behavior/product cần quyết định.

Source: [Amazon Translate automatic language detection](https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html), [AWS managed policy reference](https://docs.aws.amazon.com/translate/latest/dg/security-iam-awsmanpol.html).

### AUD-P0-03 - SAM cố cấu hình reserved environment variable `AWS_REGION`

`infra/template.yaml` đặt `AWS_REGION: !Ref AWS::Region` trong `Globals.Function.Environment.Variables`. AWS Lambda tự cung cấp `AWS_REGION` và liệt kê key này là reserved, không cho function configuration override.

Impact: CloudFormation/SAM deployment có thể fail với `InvalidParameterValueException` về reserved keys trước khi function chạy.

Required action sau này:

- Xóa `AWS_REGION` khỏi Lambda environment variables trong SAM/Console.
- Giữ code đọc `process.env.AWS_REGION`; runtime Lambda tự cung cấp giá trị.
- Local development có thể set `AWS_REGION`/`AWS_DEFAULT_REGION` trong shell hoặc AWS profile.

Source: [Working with Lambda environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html), [Lambda deployment troubleshooting](https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-deployment.html).

### AUD-P0-04 - AWS endpoint/config chưa được materialize

- `extension-config.js` vẫn trỏ `http://localhost:3000`.
- Study/Game `API_BASE_URL` vẫn empty (same-origin).
- S3 bucket và API URL thật chưa xuất hiện trong repo/evidence.
- `ALLOWED_ORIGINS` default trong SAM chỉ có localhost.

Impact: upload nguyên trạng sẽ gọi sai endpoint/CORS fail.

Required action: tạo deployment-specific config và xác nhận exact extension ID/S3 origin trước package/upload.

### AUD-P0-05 - Realtime WebSocket không chạy trên Lambda HTTP API

`attachRealtimeServer()` chỉ được gọi bởi `server.js`, không bởi `lambda.js`. Rooms/timers/connections nằm trong process memory (`Map`, `setInterval`) và phụ thuộc persistent HTTP server.

Impact:

- Game Web với `REALTIME_URL` AWS chưa có sẽ không chơi realtime.
- Scale-to-zero/cold start/multiple Lambda instances làm mất hoặc chia cắt room state.
- API Gateway HTTP API không tự chuyển local `ws` server thành WebSocket API.

Decision: loại realtime khỏi AWS MVP. Nếu bắt buộc, cần workstream riêng: API Gateway WebSocket API, connect/disconnect/action Lambdas, DynamoDB Rooms/Connections, TTL và `execute-api:ManageConnections`.

### AUD-P0-06 - Static website security phải được giới hạn demo

S3 website endpoint chỉ hỗ trợ HTTP, không HTTPS. Study/Game lưu JWT trong browser localStorage. Một trang HTTP có thể bị sửa trên đường truyền và đánh cắp token/dữ liệu.

Impact: không được dùng user/data thật trên cấu hình demo S3 website public.

Decision:

- Internship demo: cho phép S3 website HTTP với tài khoản/dữ liệu giả và nêu limitation.
- Môi trường dùng thật: CloudFront/Amplify HTTPS trước S3, bucket private qua OAC nếu dùng CloudFront.

Source: [S3 website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html).

### AUD-P0-07 - Translate trong content script sẽ bị CORS chặn trên AWS

Đây là blocker nghiêm trọng nhất và trước đây chưa được ghi nhận.

`contentScript.js:156` gọi thẳng API bằng `fetch()` từ trong trang web người dùng đang đọc:

```js
const result = await fetchJson(`${FLASHCARD_API_BASE_URL}/api/translate`, { ... });
```

Content script chạy trong ngữ cảnh của trang web, không phải ngữ cảnh extension. Theo Chrome documentation, "content scripts initiate requests on behalf of the web origin that the content script has been injected into and therefore content scripts are also subject to the same origin policy" (từ Chrome 85; host permissions **không** miễn trừ CORS cho content script). Nghĩa là request mang `Origin: https://<trang-user-đang-đọc>`, ví dụ `https://en.wikipedia.org`, chứ không phải `chrome-extension://<id>`.

Vì sao local đang chạy được: `backend/src/config.js:19` đặt `allowAllOrigins = CORS_ALLOW_ALL === "true" || (dataStore === "local" && !ALLOWED_ORIGINS)`. Ở local mặc định, cờ này là `true` nên **mọi** origin đều được chấp nhận. Lỗi bị che hoàn toàn.

Vì sao AWS sẽ hỏng: cloud mode đặt `DATA_STORE=dynamodb` và `ALLOWED_ORIGINS` là danh sách exact (localhost, `chrome-extension://<id>`, site bucket). Origin của trang web bất kỳ không nằm trong danh sách, nên Express trả `403 Origin is not allowed by CORS` và API Gateway CORS cũng không trả allow-origin header. Nút Translate trong editor - luồng chính của sản phẩm - sẽ fail.

Impact: FR-04 (`MUST`) và SR-05 (`MUST`, cấm CORS `*`) hiện **mâu thuẫn trực tiếp với nhau**. Không thể thỏa mãn cả hai nếu không đổi code. Đây là quyết định kiến trúc, không phải lỗi cấu hình, nên không "chữa" được trong runbook.

Options:

1. **Khuyến nghị:** chuyển lời gọi translate từ content script sang background service worker (`background.js`), dùng `chrome.runtime.sendMessage` và trả kết quả về content script. Service worker gọi API với origin `chrome-extension://<id>`, khớp allowlist. Đây là pattern Chrome khuyến nghị chính thức. Cần code change (ngoài phạm vi task docs này).
2. Chấp nhận thu hẹp phạm vi demo: chỉ translate từ popup (popup đã có origin `chrome-extension://<id>`, hoạt động bình thường), và ghi rõ editor-translate là local-only.
3. Không chấp nhận: mở `CORS_ALLOW_ALL=true` hoặc allowlist `*` trên AWS. Vi phạm SR-05 và làm API translate thành endpoint mở cho mọi trang web.

Source: [Chrome - Cross-origin requests from content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests).

### AUD-P0-08 - `REALTIME_URL=""` không hề tắt realtime

`backend/public/game/app.js:3`:

```js
const REALTIME_URL = window.FLASHCARD_CONFIG?.REALTIME_URL || createRealtimeUrl();
```

`""` là falsy, nên gán chuỗi rỗng sẽ **rơi vào fallback** `createRealtimeUrl()`, hàm này (dòng 757-760) dựng URL từ chính origin đang mở:

```js
return `${protocol}//${window.location.host}/realtime`;
```

Trên S3 website, kết quả là `ws://<site-bucket>.s3-website-<region>.amazonaws.com/realtime`. S3 không phục vụ WebSocket, nên tab Realtime sẽ hiện "Realtime connection failed." và đẩy lỗi ra browser console.

Impact: hướng dẫn `REALTIME_URL: ""` trong runbook (mục 11) và kiến trúc (mục 5) **là sai** - làm đúng theo docs vẫn ra một demo có WebSocket lỗi. Điều này cũng trực tiếp làm fail tiêu chí "Browser console contains no uncaught errors" trong `09_TEST_AND_ACCEPTANCE.md` mục 10.

Required action: tắt realtime thật sự, không chỉ để chuỗi rỗng. Ẩn/disable tab Realtime trong `game/index.html` ở bản deploy AWS, hoặc guard trong `app.js` để không mở WebSocket khi config rỗng. Đây là code change, thuộc AWS-005.

## 4. High-priority risks P1

| ID | Finding | Impact | Recommendation |
|---|---|---|---|
| P1-01 | DynamoDB Query không paginate `LastEvaluatedKey` | Mất cards/categories khi result >1 MB | Thêm pagination loop và test |
| P1-02 | `/api/sync` thực hiện get/put tuần tự mỗi card | Chậm, tốn request, dễ timeout/throttle với 1 WCU | Batch/limit/chunk và progress; trước mắt giới hạn demo dataset |
| P1-03 | Sync là upsert-only, không xóa remote card thiếu ở local | “Sync” không phải mirror hai chiều | Ghi rõ semantic hoặc thêm tombstone/delete contract |
| P1-04 | Sync/category delete không transactional | Partial writes khi Lambda timeout/error | Idempotency + retry/report per-item; test failure |
| P1-05 | Password tối thiểu 6 ký tự, popup prefill sample password | Credential yếu và dễ bị dùng nhầm | Nâng policy, bỏ default value trước release |
| P1-06 | Không rate limit login/register/translate/sync | Brute force và cost abuse | Usage controls/rate limit; ít nhất alarm/budget cho demo |
| P1-07 | Express trả raw `error.message` cho lỗi 500 | Có thể lộ implementation/AWS detail | Public generic 500, structured server log |
| P1-08 | Không có structured logging/request correlation | Khó debug demo | Log request ID, route, status, latency; redact data |
| P1-09 | SAM chưa tạo S3 static website bucket | Template không deploy full architecture | Document manual step hoặc mở rộng template sau khi ổn định |
| P1-10 | SAM không set `SERVE_STUDY_STATIC=false` | Lambda vẫn phục vụ static assets ngoài target S3 | Set env ở cloud và giảm deployment artifact |
| P1-11 | `flashcard-backend.zip` nằm trong `backend/` | SAM CodeUri có thể đóng gói nested zip/bloat | Đưa artifact ra ignored build dir, không commit zip |
| P1-12 | Duplicate project directory | Agent dễ sửa/deploy nhầm | Chọn source of truth, archive/remove theo quyết định user |
| P1-13 | Static web config deploy thủ công bằng sửa source | Dễ commit endpoint môi trường hoặc upload config cũ | Build-time generated config hoặc config per environment |
| P1-14 | Không có automated API/repository tests | Regression chỉ phát hiện lúc demo | Unit + integration + E2E smoke |

## 5. Medium risks P2

- DynamoDB `flashcards.create` không có condition; cùng `cardId` sẽ overwrite.
- Category add ghi lại `createdAt` mỗi lần thay vì preserve.
- DynamoDB `publicCard()` trả `userId`, local repository lại loại `userId`; contract không hoàn toàn đồng nhất.
- Validation không giới hạn word/meaning/source URL/category trong card payload; chỉ tổng body 1 MB.
- `/api/study/random` tải toàn bộ card của user rồi chọn random trong Lambda.
- Delete category query toàn bộ cards rồi update tuần tự.
- JWT không revoke/rotate; secret rotation sẽ invalidate toàn bộ session.
- `API_BASE_URL` backend config có nhưng use case hiện chưa rõ; dễ tạo expectation sai.
- API Gateway CORS và Express CORS là hai cấu hình phải đồng bộ thủ công.
- CloudWatch log retention/alarm/budget chưa nằm trong template.
- Export object chưa có lifecycle expiration; bucket sẽ tích lũy file.
- Export response/filename chứa username và JSON chứa user metadata; cần privacy/retention policy.
- `manifest.json` host permissions `http://*/*` và `https://*/*` rất rộng. Một phần cần cho content script trên mọi web page, nhưng API host permission nên được giải thích/tối thiểu hóa nếu publish.
- README description vẫn mô tả local backend, có thể gây hiểu nhầm sau deploy.

## 6. Hạ tầng template coverage

| Resource | SAM hiện có | Target |
|---|---:|---:|
| Lambda backend | Có | Có, runtime supported |
| HTTP API | Có | Có |
| Users table | Có | Có |
| Flashcards table | Có | Có |
| Categories table | Có | Có |
| Private export bucket | Có | Có + lifecycle |
| Static website bucket | Không | Manual MVP hoặc thêm IaC |
| CloudWatch retention/alarm | Không | Nên có |
| Secret manager/parameter | Không | Manual env cho demo; managed secret production |
| WebSocket API/tables | Không | Không thuộc MVP |

## 7. Git/worktree context

Tại thời điểm audit, worktree đã có nhiều thay đổi và untracked files không do task tài liệu này tạo. Không được reset/overwrite. Đặc biệt:

- Modified: backend/app/package/study/server/config và popup.
- Untracked: duplicate project, LOG, zip artifact, game/realtime/scoring, multiplayer plan.

Agent sau phải chạy `git status --short` trước khi sửa và coi các thay đổi đó là work-in-progress của user.

## 8. Kết luận readiness

Codebase có nền tảng migration tốt và không cần rewrite. Tuy nhiên trạng thái là **conditionally ready**, chưa phải deploy-ready.

Phân loại lại 8 blocker theo chi phí xử lý:

| Blocker | Loại | Sửa ở đâu |
|---|---|---|
| AUD-P0-01 runtime | Config | `infra/template.yaml`, `package.json`, docs |
| AUD-P0-02 Translate IAM | Config | IAM policy/template |
| AUD-P0-03 reserved `AWS_REGION` | Config | `infra/template.yaml` |
| AUD-P0-04 endpoint/config | Config | config files khi deploy |
| AUD-P0-05 realtime không chạy Lambda | Scope | quyết định loại khỏi MVP |
| AUD-P0-06 S3 website HTTP | Scope | chấp nhận + ghi limitation |
| **AUD-P0-07 CORS content script** | **Code** | `contentScript.js` + `background.js` |
| **AUD-P0-08 realtime URL fallback** | **Code** | `game/app.js` hoặc `game/index.html` |

Sáu blocker đầu chỉ cần đổi cấu hình hoặc chốt phạm vi. Hai blocker cuối (P0-07, P0-08) **bắt buộc sửa code** - đây là khác biệt quan trọng vì bản audit trước cho rằng mọi P0 đều đóng được bằng config/scope.

Thứ tự: đóng 4 blocker config → quyết định 2 blocker scope → sửa 2 blocker code → chạy integration/E2E theo docs trước khi tuyên bố thành công.
