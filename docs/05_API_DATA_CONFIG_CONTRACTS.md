# 05. API, Data và Configuration Contracts

## 1. API conventions AS-IS

- Base URL local: `http://localhost:3000`.
- Base URL AWS: `https://<api-id>.execute-api.<region>.amazonaws.com`.
- JSON request/response.
- Protected route header: `Authorization: Bearer <JWT>`.
- Success thường có `ok: true`.
- Error shape: `{ "ok": false, "error": "message" }`.
- Express JSON body limit: 1 MB.
- JWT claims: `sub=userId`, `username`, `role`; expiry 7 ngày.

Client không được gửi AWS credentials. `userId` trong payload không quyết định ownership.

## 2. REST route inventory

| Method/path | Auth | Request chính | Response chính | Consumer |
|---|---|---|---|---|
| `GET /api/health` | No | - | `{ok, service}` | Smoke/monitor |
| `POST /api/auth/register` | No | `{username,password}` | `{ok,token,user}` 201 | Popup/Study |
| `POST /api/auth/login` | No | `{username,password}` | `{ok,token,user}` | Popup/Study/Game |
| `GET /api/me` | Yes | - | `{ok,user}` | Study/Game |
| `GET /api/flashcards` | Yes | - | `{ok,count,flashcards}` | Study/Game |
| `POST /api/flashcards` | Yes | flashcard | `{ok,flashcard}` 201 | Study |
| `PUT /api/flashcards/:id` | Yes | flashcard fields | `{ok,flashcard}` | Study |
| `DELETE /api/flashcards/:id` | Yes | - | `{ok,deletedId}` | Study |
| `GET /api/categories` | Yes | - | `{ok,categories}` | Popup/Study/Game |
| `POST /api/categories` | Yes | `{category}` | `{ok,category,categories}` 201 | Popup/Study |
| `DELETE /api/categories/:category` | Yes | - | deleted category/count/list | Popup/Study |
| `GET /api/study/random?category=` | Yes | query optional | `{ok,flashcard,count}` | Available API |
| `POST /api/sync` | Yes | `{flashcards:[...]}` | count/created/updated/syncedAt | Popup |
| `POST /api/translate` | AWS: Yes | `{word}` hoặc `{text,...}` | translated response | Popup/Content |
| `POST /api/export` | Yes | `{flashcards?}` | `{ok,fileName,downloadUrl}` | Popup |

Unknown route trả 404 với message chứa method/path.

## 3. Auth examples

Register/login request:

```json
{
  "username": "demo_user",
  "password": "replace-with-strong-demo-password"
}
```

Auth response:

```json
{
  "ok": true,
  "token": "<jwt>",
  "user": {
    "id": "<uuid>",
    "userId": "<uuid>",
    "username": "demo_user",
    "role": "user"
  }
}
```

Validation AS-IS:

- Username lowercase, 3-32 ký tự, regex `[a-z0-9_.-]`.
- Password tối thiểu 6 ký tự; backlog yêu cầu mạnh hơn trước production.
- Duplicate username -> 409.

## 4. Flashcard contract

Canonical logical shape:

```json
{
  "id": "<same-as-cardId-for-client-compatibility>",
  "cardId": "<uuid-or-existing-id>",
  "word": "resilient",
  "meaning": "kiên cường",
  "wordform": "adjective",
  "category": "IELTS",
  "sourceUrl": "https://example.test/article",
  "sourceTitle": "Demo article",
  "createdAt": "2026-07-14T00:00:00.000Z",
  "updatedAt": "2026-07-14T00:00:00.000Z",
  "syncedAt": "2026-07-14T00:00:00.000Z"
}
```

Server-controlled/normalized behavior:

- `cardId`: client ID nếu có, nếu không server tạo UUID.
- `category`: default `Uncategorized`.
- `createdAt`: giữ giá trị đầu khi update.
- `updatedAt`: server cập nhật.
- `userId`: lấy từ JWT; được lưu trong DynamoDB.
- Meaning bắt buộc cho create/update/sync hiện tại.

Gap cần lưu ý:

- DynamoDB response hiện có thể chứa `userId`, local response loại field này.
- Chưa có per-field max length trừ category route và tổng body limit.
- Sync upsert theo `cardId`, không delete cloud cards.

## 5. Sync semantics

Request:

```json
{
  "flashcards": [
    {
      "id": "client-generated-id",
      "word": "resilient",
      "meaning": "kiên cường",
      "wordform": "adjective",
      "category": "IELTS"
    }
  ]
}
```

Response:

```json
{
  "ok": true,
  "count": 1,
  "created": 1,
  "updated": 0,
  "syncedAt": "2026-07-14T00:00:00.000Z"
}
```

Important contract:

- Đây là bulk upsert một chiều local -> cloud.
- Không phải full replace và không propagate local deletion.
- Không atomic; lỗi giữa chừng có thể partial success.
- Retry với cùng `cardId` thường update item cũ, nhưng timestamps/count có thể đổi.

## 6. Translate contract

Accepted request cũ:

```json
{ "word": "resilient" }
```

Target-compatible request:

```json
{
  "text": "resilient",
  "sourceLanguageCode": "en",
  "targetLanguageCode": "vi"
}
```

Cloud response:

```json
{
  "ok": true,
  "word": "resilient",
  "meaning": "kiên cường",
  "wordform": "unknown",
  "provider": "amazon-translate"
}
```

AS-IS defaults:

- Source: `auto`.
- Target: `vi`.
- Max length: 120.
- AWS/Dynamo mode requires JWT.
- Local mode uses mock unless env overrides.

If keeping `auto`, execution role needs both:

```text
translate:TranslateText
comprehend:DetectDominantLanguage
```

## 7. Export contract

Request can omit flashcards to export cloud repository, nhưng popup hiện gửi local `flashcards` array. Server validates provided cards and exports them under authenticated user identity.

Cloud response:

```json
{
  "ok": true,
  "fileName": "flashcards-demo_user-2026-07-14T00-00-00-000Z.json",
  "downloadUrl": "https://<signed-s3-url>"
}
```

Rules:

- AWS URL là absolute; client phải mở trực tiếp.
- Local URL là relative `/exports/...`; popup helper prefix API base.
- Cloud object prefix: `<userId>/`.
- Current expiration: 900 seconds.
- Export bucket không public.

## 8. DynamoDB physical model

### Users table

```text
PK: username (String)
```

| Attribute | Type | Notes |
|---|---|---|
| `username` | S | normalized lowercase, login key |
| `userId` | S | UUID, JWT `sub` |
| `passwordHash` | S | bcrypt hash only |
| `role` | S | currently `user` |
| `createdAt` | S | ISO-8601 |
| `updatedAt` | S | ISO-8601 |

No GSI. Token authentication reloads user by username then verifies `userId === sub`.

### Flashcards table

```text
PK: userId (String)
SK: cardId (String)
```

Attributes: canonical flashcard fields plus owner `userId`.

Access patterns:

- Query all cards for current user.
- Get/update/delete a card by `(userId, cardId)`.
- Category filtering currently happens in Lambda after Query.

### Categories table

```text
PK: userId (String)
SK: categoryName (String)
```

Attributes: `createdAt`, `updatedAt`.

Access patterns:

- Query categories for current user.
- Put/delete category by composite key.

## 9. Browser/extension storage

### Chrome extension

| Key | Content |
|---|---|
| `flashcards` | Local offline cards |
| `flashcardCategories` | Category list |
| `flashcardAuth` | Token + public user info |

### Study/Game browser

| Key | Content |
|---|---|
| `flashcardStudyAuth` | Token + user, shared if same origin |
| `flashcardStudyTheme` | Theme preference (Study only) |

S3 Study và Game ở cùng bucket/origin có thể dùng chung `flashcardStudyAuth`; nếu dùng hai buckets/origins thì localStorage tách biệt và user phải login lại.

## 10. Environment variable matrix

| Variable | Local default | AWS required/recommended | Purpose |
|---|---|---|---|
| `PORT` | `3000` | No | Local server port |
| `DATA_STORE` | `local` | `dynamodb` | Repository mode. Cũng bật ngầm `useAmazonTranslate`, `requireTranslateAuth` và tắt `allowAllOrigins` |
| `AWS_REGION` | shell/profile hoặc fallback | Runtime-provided; không tự set | Lambda reserved key, SDK region |
| `USERS_TABLE` | `FlashcardUsers` | Yes | Users table name |
| `FLASHCARDS_TABLE` | `FlashcardCards` | Yes | Cards table name |
| `CATEGORIES_TABLE` | `FlashcardCategories` | Yes | Categories table name |
| `JWT_SECRET` | insecure local fallback | MUST strong value | JWT sign/verify |
| `EXPORT_BUCKET` | empty | MUST | Private bucket name |
| `ALLOWED_ORIGINS` | localhost list | MUST exact comma list | Express CORS |
| `CORS_ALLOW_ALL` | local conditional | MUST absent/false | Never true on AWS |
| `API_BASE_URL` | localhost | Recommended explicit | Backend config/future URLs |
| `SERVE_STUDY_STATIC` | true | `false` | S3 serves frontend in target |
| `USE_AMAZON_TRANSLATE` | false unless Dynamo | `true` | Provider selection |
| `REQUIRE_TRANSLATE_AUTH` | false unless Dynamo | `true` | Protect translate cost |
| `TRANSLATE_MAX_LENGTH` | `120` | `120` | Cost/input guard |

Config values are not secrets except `JWT_SECRET`, nhưng endpoint/origin values vẫn phải environment-specific.

Lambda tự inject `AWS_REGION`/`AWS_DEFAULT_REGION`. SAM template hiện tại tự set `AWS_REGION`, đây là blocker cần xóa khỏi template; không đổi tên code-side vì `process.env.AWS_REGION` là cách đọc hợp lệ.

## 11. CORS contract

Example AWS allowlist:

```text
http://localhost:3000,
chrome-extension://<unpacked-or-published-extension-id>,
http://<site-bucket>.s3-website-<region>.amazonaws.com
```

Rules:

- Không có trailing slash trong origin.
- Scheme/host/port phải exact.
- Nếu extension ID thay đổi, update API Gateway CORS và Lambda `ALLOWED_ORIGINS`.
- API Gateway allowed headers: `Content-Type`, `Authorization`.
- Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`.
- Browser request phải có Origin để CORS header được áp dụng.

### Origin thực tế của từng caller

Allowlist trên **không** phủ được content script, và đây là nguồn gốc AUD-P0-07:

| Caller | Origin gửi lên API | Khớp allowlist? |
|---|---|---|
| Study/Game Web trên S3 | `http://<site-bucket>.s3-website-<region>.amazonaws.com` | Có |
| `popup.js` | `chrome-extension://<id>` | Có |
| `background.js` service worker | `chrome-extension://<id>` | Có |
| `contentScript.js` | Origin của **trang web đang đọc** (vd `https://en.wikipedia.org`) | **Không** |
| curl/Postman | Không có Origin header | Đi qua (CORS không phải authorization; JWT mới là lớp chặn) |

Content script khởi tạo request thay mặt web origin nó được inject vào, nên chịu same-origin policy của trang đó - host permissions không miễn trừ kể từ Chrome 85. Muốn giữ translate trong editor thì phải chuyển lời gọi sang background service worker; không có giá trị `ALLOWED_ORIGINS` nào giải quyết được việc này (trừ `*`, vốn bị SR-05 cấm).

Lưu ý `backend/src/config.js:19`: `allowAllOrigins` bật tự động khi `DATA_STORE=local` và chưa set `ALLOWED_ORIGINS`. Đây là lý do local không bao giờ lộ lỗi CORS - đừng coi "local chạy được" là bằng chứng CORS đúng.

## 12. Realtime local protocol (reference only)

Endpoint local: `ws://localhost:3000/realtime`.

Client actions: `createRoom`, `joinRoom`, `ready`, `submitAnswer`, `leaveRoom`.

Server events: `roomCreated`, `roomState`, `countdown`, `prompt`, `answerResult`, `matchEnded`, `error`.

Room size 2, code length 6, countdown 3s, round 30s, scoring exact/partial/wrong = 100/50/0. Đây là AS-IS local protocol, không phải AWS API contract.
