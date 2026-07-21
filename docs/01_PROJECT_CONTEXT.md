# 01. Project Context và Scope

## 1. Bài toán

`ChromeFlashCardExtension` giúp người học lưu từ vựng khi đọc web, đồng bộ lên backend, ôn tập trên web và xuất dữ liệu. Mục tiêu hiện tại là chuyển backend/local storage sang kiến trúc AWS serverless đủ rõ để demo và đáp ứng yêu cầu thực tập dùng ít nhất 3 dịch vụ AWS.

## 2. Người dùng và use case chính

### Người học

- Đăng ký/đăng nhập.
- Bôi đen từ/cụm từ trên trang web và mở editor bằng context menu.
- Dịch sang tiếng Việt, sửa meaning/wordform/category rồi lưu local.
- Quản lý category.
- Đồng bộ flashcards local lên cloud.
- Mở Study Web để học, làm test và chỉnh card.
- Mở Game Web để chơi solo; realtime hiện chỉ là local prototype.
- Export JSON từ cloud bằng URL tải tạm thời.

### Người chấm/mentor

- Xem kiến trúc dùng nhiều AWS services có trách nhiệm rõ ràng.
- Kiểm tra dữ liệu bền vững trên DynamoDB.
- Kiểm tra Lambda/API Gateway hoạt động độc lập với máy local.
- Quan sát log và lỗi qua CloudWatch.
- Đánh giá security/cost trade-off phù hợp project sinh viên.

## 3. Luồng sản phẩm AS-IS

```text
Web page selection
  -> Chrome context menu
  -> injected editor (contentScript.js)
  -> optional POST /api/translate   [origin = trang web, KHÔNG phải extension -> CORS chặn trên AWS]
  -> chrome.storage.local
  -> popup login
  -> POST /api/sync                 [origin = chrome-extension://<id> -> OK]
  -> backend repository

Study Web
  -> login/register
  -> flashcard/category APIs
  -> study/test UI

Game Web
  -> REST API for auth/cards/categories
  -> local WebSocket /realtime for 1v1 prototype
```

## 4. Luồng sản phẩm TARGET cho AWS MVP

```text
Chrome Extension ─┐
                  ├─HTTPS─> API Gateway HTTP API -> Lambda -> DynamoDB
Study/Game Web ───┘                           ├──> Amazon Translate
                                             └──> private S3 export bucket

Browser -> public S3 website bucket -> static Study/Game assets
AWS services -> CloudWatch logs/metrics
```

MVP giữ lại:

- Extension offline-first.
- Auth JWT hiện tại.
- Flashcard/category CRUD và sync.
- Study/test UI.
- Amazon Translate. Từ popup: chạy được ngay. Từ editor (content script): **chỉ chạy sau khi định tuyến qua background service worker** - fetch trực tiếp sẽ bị CORS chặn trên AWS (AUD-P0-07).
- Private export bucket + pre-signed URL.
- Game solo chạy hoàn toàn ở frontend trên dữ liệu đã tải, nếu behavior hiện tại pass test. Tab Realtime phải được tắt trong code trước khi upload (AUD-P0-08).

MVP không cam kết:

- Realtime multiplayer trên AWS.
- Global leaderboard, matchmaking, async challenge.
- Cognito, custom domain, CI/CD đầy đủ.
- CloudFront bắt buộc. CloudFront là hardening sau demo; S3 website HTTP chỉ được chấp nhận cho demo không chứa dữ liệu thật.

## 5. Cấu trúc repository và ownership

| Path | Vai trò | Ghi chú |
|---|---|---|
| `manifest.json` | Chrome Manifest V3 | Host permissions hiện rất rộng |
| `background.js` | Context menu/service worker | Inject content script khi cần |
| `contentScript.js` | Editor trong trang web | Lưu local và gọi translate |
| `popup.*` | Auth, local cards, sync, export | Config qua `extension-config.js` |
| `extension-config.js` | API/Study URL của extension | Hiện đang trỏ localhost |
| `backend/app.js` | Express application/routes | Dùng cho local và Lambda |
| `backend/server.js` | Local HTTP + WebSocket startup | Không được import trong Lambda |
| `backend/lambda.js` | Lambda handler | Dùng `serverless-http` |
| `backend/src/localRepositories.js` | JSON local data | Chỉ development |
| `backend/src/dynamoRepositories.js` | DynamoDB persistence | Cloud mode |
| `backend/src/translateService.js` | Mock/Amazon Translate | Cloud mặc định dùng Translate |
| `backend/src/exportService.js` | Local/S3 export | S3 URL hết hạn sau 900 giây |
| `backend/src/realtimeServer.js` | WebSocket local | In-memory, local-only ở hiện trạng |
| `backend/public/study/` | Static Study Web | Có config API/Game URL |
| `backend/public/game/` | Static Game Web | Có config API/Study/Realtime URL |
| `infra/template.yaml` | SAM starter | Chưa đại diện full stack, có blocker runtime/IAM |
| `AWS_DEPLOYMENT.md` | Deployment guide cũ | Cần đối chiếu bộ docs này |
| `AWS_E2E_TEST_GUIDE.md` | E2E guide cũ | Hữu ích nhưng chưa cover gap mới |
| `ChromeFlashCardExtension-test-aws-clean/` | Bản sao thử nghiệm | Không sửa song song nếu chưa có quyết định rõ |

## 6. Source of truth

Quy tắc cho agent:

1. Code ở root và `backend/` là source of truth.
2. Không tự động đồng bộ thay đổi vào `ChromeFlashCardExtension-test-aws-clean/`.
3. Không coi `multiplayerplan.md` là implementation status.
4. `infra/template.yaml` là starter, không phải bằng chứng môi trường AWS đã deploy.
5. Bằng chứng deploy phải gồm endpoint thật, region, resource names đã che account ID khi chia sẻ, thời gian test và kết quả.

## 7. Assumptions cho MVP

- Region mặc định: `ap-southeast-1`, nhưng phải xác nhận các service cần dùng trong account.
- Số người demo nhỏ; DynamoDB 1 RCU/1 WCU là điểm bắt đầu, không phải SLA production.
- Dữ liệu demo không nhạy cảm.
- Tạo user cloud mới thay vì migrate sample password/user từ JSON.
- Không dùng AWS access key trong code hoặc extension.
- Lambda nhận quyền qua execution role.
- Mọi API protected xác định owner từ JWT `sub`, không nhận `userId` từ client.

## 8. Ranh giới dữ liệu và privacy

Flashcard có thể chứa:

- Từ, nghĩa, loại từ, category.
- `sourceUrl` và `sourceTitle` của trang người dùng đang đọc.
- Username và user ID trong export.

`sourceUrl`/`sourceTitle` có thể tiết lộ lịch sử đọc web. Trước demo phải dùng dữ liệu giả, và trước production phải có privacy notice cùng chính sách retention/export/delete.


# Cập nhật 2026-07-21 - Gỡ Amazon Translate

Amazon Translate đã được gỡ khỏi sản phẩm vì account AWS đang dùng trả về
`OptInRequired` cho dịch vụ này. Quyết định là **bỏ tính năng**, không phải chờ
account được cấp quyền.

Ảnh hưởng tới tài liệu này:

- Luồng ở mục 2 không còn bước `POST /api/translate`. Editor trong trang web
  lưu thẳng vào `chrome.storage.local`; người dùng tự nhập nghĩa.
- Sơ đồ target ở mục 3 không còn nhánh `Lambda -> Amazon Translate`.
- MVP không còn cam kết Translate ở popup lẫn editor.
- `backend/src/translateService.js` đã bị xóa; bảng file ở cuối tài liệu không
  còn dòng đó, và `contentScript.js` không còn gọi translate.

Vì luồng translate biến mất, vấn đề CORS content-script (AUD-P0-07) không còn
tồn tại trong sản phẩm. Xem `LOG.md` và `docs/10_IMPROVEMENT_BACKLOG.md`.
