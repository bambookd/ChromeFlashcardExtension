# ChromeFlashcardExtension — Tài liệu tổng hợp toàn dự án

> **Mục đích:** gom toàn bộ ngữ cảnh dự án vào một file duy nhất, để người viết
> báo cáo (có hoặc không dùng AI hỗ trợ) nắm đủ mà không phải đọc rải rác 21 file
> trong `docs/`.
>
> **Cập nhật:** 2026-07-23. Mọi thông tin đã đối chiếu trực tiếp với mã nguồn và
> hạ tầng AWS thật tại thời điểm này.
>
> **Định danh hạ tầng:** repo là public nên file này dùng placeholder
> (`YOUR_API_ID`, `YOUR_SITE_BUCKET`…). Giá trị thật nằm trong
> `infra/env.local.md` trên máy chủ dự án, không commit.

---

# PHẦN I — TỔNG QUAN

## 1. Sản phẩm

Hệ thống học từ vựng gồm ba mặt tiếp xúc người dùng:

| Thành phần | Chạy ở đâu | Vai trò |
|---|---|---|
| Chrome Extension (MV3) | Trình duyệt | Bôi đen từ trên trang web bất kỳ → chuột phải → lưu thành flashcard |
| Study Web | Trình duyệt, file từ S3 | Quản lý thư viện, học/kiểm tra, import/export CSV |
| Game Web | Trình duyệt, file từ S3 | Đoán từ theo nghĩa, tính điểm |

Dữ liệu lưu trên AWS (DynamoDB), đồng bộ giữa extension và web qua REST API.

### Luồng người dùng chính

```text
Đọc trang web tiếng Anh → gặp từ lạ, bôi đen
  → chuột phải → "Add to flashcards"
  → editor hiện ngay trong trang, tự nhập nghĩa
  → lưu vào chrome.storage.local        (chạy được cả khi offline)
  → mở popup → đăng nhập → Sync         → card lên DynamoDB
  → mở Study Web  → học/kiểm tra, hoặc quản lý thư viện
  → mở Game Web   → chơi đoán từ
  → cần sao lưu   → Export CSV (tải thẳng) hoặc Export JSON (qua S3)
```

## 2. Bối cảnh và ràng buộc

Bài thực tập AWS (FCJ — First Cloud Journey). Yêu cầu tối thiểu là dùng
**API Gateway + Lambda + DynamoDB**; dự án dùng thêm **S3** và **CloudWatch**.

Ràng buộc quyết định mọi lựa chọn kiến trúc: tài khoản chỉ có **$100 credit**,
nên tránh triệt để dịch vụ tính tiền theo giờ.

---

# PHẦN II — KIẾN TRÚC

## 3. Sơ đồ kiến trúc

```text
                    ┌─ Chrome Extension ──── chrome.storage.local (offline-first)
Users ──────────────┤
                    └─ Trình duyệt ─┐
                                    │ GET tĩnh (HTTPS)
        ╔═══════════════════════════▼══════════════════════╗
        ║  S3 site bucket  (public read: chỉ s3:GetObject) ║ ← nét đứt:
        ║  study/  +  game/                                ║   NGOÀI stack
        ╚═══════════════════════════╤══════════════════════╝   (tạo tay)
┌─── AWS ap-southeast-1 ────────────┼──────────────────────────────────────┐
│                                   │ HTTPS + JWT                          │
│                      ┌────────────▼────────────┐                         │
│                      │  API Gateway HTTP API   │  CORS allowlist         │
│                      │  (ApiGatewayV2)         │  throttle 2/s burst 5   │
│                      └────────────┬────────────┘                         │
│                                   │ proxy  ANY /{proxy+}                 │
│                      ┌────────────▼────────────┐                         │
│                      │  Lambda                 │──── logs ──► CloudWatch │
│                      │  Express +              │              Logs       │
│                      │  serverless-http        │              (7 ngày)   │
│                      │  nodejs24.x 256MB/15s   │                         │
│                      └───┬──────────────────┬──┘                         │
│              ┌───────────▼──────┐   ┌───────▼──────────┐                 │
│              │    DynamoDB      │   │  S3 export bucket│                 │
│              │ Users/Flashcards │   │    (PRIVATE)     │                 │
│              │   /Categories    │   │  hết hạn 7 ngày  │                 │
│              │  1 RCU / 1 WCU   │   └───────┬──────────┘                 │
│              └──────────────────┘           │                            │
│                                             │ pre-signed GET, 15 phút    │
└─────────────────────────────────────────────┼────────────────────────────┘
                                              ▼
                                      về trình duyệt Users
```

### Năm điểm hay bị vẽ sai (đều đã gặp thật)

1. **Mũi tên pre-signed GET phải quay về Users**, không đi vào CloudWatch.
   Pre-signed URL là để người dùng tải file export.
2. **Phải có hai bucket S3 riêng.** Site bucket **public**, export bucket
   **private** — đây là chi tiết bảo mật, không được gộp.
3. **Site bucket nằm ngoài CloudFormation stack** (tạo tay). Stack chỉ gồm:
   API Gateway v2 + Stage, 3 bảng DynamoDB, IAM Role, Lambda + Permission, và
   export bucket. Vẽ nét đứt kèm ghi chú "ngoài stack" là chính xác nhất.
4. **Ghi HTTPS, không phải HTTP.** Dự án đã cố ý chuyển từ S3 website endpoint
   (HTTP) sang REST endpoint (HTTPS) vì JWT nằm trong `localStorage`.
5. **Không vẽ CloudWatch Alarms** — chưa cấu hình alarm nào
   (`describe-alarms` trả về 0). Chỉ có Logs + metric mặc định. Nếu muốn thể
   hiện ý "cảnh báo" thì thứ cần vẽ là **AWS Budgets**, một dịch vụ khác.

## 4. Dịch vụ AWS đang dùng

| Dịch vụ | Vai trò | Vì sao chọn |
|---|---|---|
| **API Gateway** HTTP API | Cửa vào duy nhất của REST API | HTTP API rẻ hơn REST API ~70%, đủ cho proxy đơn giản |
| **AWS Lambda** | Chạy Express app | Không quản OS; chỉ tính tiền khi có request |
| **DynamoDB** | Users, Flashcards, Categories | Serverless; partition theo `userId` nên không cần index phức tạp |
| **S3** (2 bucket) | Host web tĩnh + lưu file export | Rẻ nhất cho static; pre-signed URL chia sẻ có thời hạn mà không cấp credential |
| **CloudWatch Logs** | Log Lambda | Tự động có sẵn, không phải cấu hình |
| **AWS Budgets** | Cảnh báo chi phí $1 và $5 | Bảo hiểm cho $100 credit |

**Ba dịch vụ cốt lõi** thỏa yêu cầu tối thiểu: API Gateway, Lambda, DynamoDB.

### Trạng thái quan sát thật (không phải suy đoán)

```text
CÓ THẬT                                    KHÔNG CÓ
─────────────────────────────────────────  ──────────────────────────────
CloudWatch Logs — 1 log group của Lambda   CloudWatch Alarms
Metric mặc định của Lambda / API GW        API Gateway access logs
AWS Budgets: cảnh báo $1 và $5             Detailed metrics (đang false)
```

## 5. Dịch vụ đã cân nhắc rồi loại

| Dịch vụ | Lý do loại |
|---|---|
| **Amazon Translate** | Tài khoản trả `OptInRequired` — không được cấp. Đã gỡ sạch ngày 2026-07-21 |
| **Amazon Comprehend** | Chỉ là dependency gián tiếp của Translate. Gỡ cùng lúc |
| **EC2** | Tính tiền theo giờ kể cả khi idle; phải tự quản OS, HTTPS, security group |
| **AWS WAF** | ~$5–10/tháng cố định dù không request nào. Quá đắt cho demo |
| **CloudFront** | **Muốn dùng nhưng bị chặn** — tài khoản cần AWS review nội bộ. Đã mở case Support, đang chờ |
| **Route 53** | $0.50/tháng mỗi hosted zone; chỉ cần khi có domain riêng |
| **API Gateway WebSocket** | Cần cho realtime multiplayer, không thuộc MVP |

## 6. Quyết định kiến trúc (ADR)

### ADR-01 — Giữ Express, không viết lại Lambda-native

`serverless-http` bọc Express. Cùng một `app.js` chạy cả local (`node server.js`)
lẫn Lambda (`lambda.js`).

*Đánh đổi:* cold start chậm hơn chút. *Đổi lại:* phát triển và test local rất
nhanh, không cần deploy để thử.

### ADR-02 — DynamoDB partition theo `userId`

Mọi truy vấn card là `Query` theo `userId`, **không bao giờ `Scan`**. Đảm bảo cả
hiệu năng lẫn cách ly dữ liệu.

### ADR-03 — JWT tự quản, không dùng Cognito

Nhu cầu chỉ là login đơn giản; `jsonwebtoken` + `bcryptjs` đủ.

*Đánh đổi:* tự lo secret rotation, không MFA, không social login. Production thật
nên chuyển Cognito.

### ADR-04 — Export qua pre-signed URL

Lambda ghi JSON vào S3 private rồi trả URL có chữ ký, hạn 15 phút. Tránh giới hạn
payload 6MB của Lambda và không cần mở public bucket.

### ADR-07 — Static site trên S3, HTTPS qua REST endpoint

`https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/study/index.html`

*Đánh đổi:* REST endpoint không định tuyến index theo thư mục nên URL phải kèm
`index.html`. Website endpoint có, nhưng chỉ HTTP.

Chọn REST + HTTPS vì Study lưu JWT trong `localStorage` — trên HTTP thì token đi
không mã hóa.

*Đường nâng cấp:* CloudFront (đang chờ duyệt) giải quyết cả ba: HTTPS thật, URL
sạch, và khóa được bucket về private bằng OAC.

### ADR-08 — Translate: gỡ bỏ thay vì sửa

Nút Translate trong content script bị CORS chặn trên AWS (content script gửi
request mang origin trang web, không phải origin extension). Hai phương án ban
đầu: định tuyến qua background service worker, hoặc chỉ demo từ popup.

**Chọn phương án thứ ba:** gỡ hẳn, vì tài khoản không được cấp Translate.

### ADR-09 — CSV parse ở client, không đụng backend

Import/export CSV xử lý hoàn toàn trong trình duyệt, ghi qua `POST /api/sync`
sẵn có. Không sửa một dòng backend, không redeploy CloudFormation, không đụng
IAM. Deploy chỉ cần `aws s3 sync`.

---

# PHẦN III — CÔNG NGHỆ VÀ MÃ NGUỒN

## 7. Tech stack

```text
Runtime      Node.js 24  (nodejs24.x trên Lambda)
Backend      Express 4 + serverless-http 4
Auth         jsonwebtoken 9 + bcryptjs 3
AWS SDK      v3 (client-dynamodb, lib-dynamodb, client-s3, s3-request-presigner)
Frontend     JavaScript thuần — không framework, không bundler
Extension    Chrome Manifest V3
IaC          AWS SAM (CloudFormation)
CI/CD        GitHub Actions + OIDC
Test         node:test (built-in)
```

Không dùng framework frontend là chủ ý: dự án nhỏ, cần load nhanh từ S3, tránh
bước build. Toàn bộ HTML/CSS/JS phục vụ nguyên văn.

## 8. Cấu trúc thư mục

```text
ChromeFlashCardExtension/
├── manifest.json           Chrome MV3
├── background.js           Service worker: context menu, inject content script
├── contentScript.js        Editor overlay trong trang web (Shadow DOM)
├── popup.html/.js/.css     Login, xem card local, sync, export
├── extension-config.js     API_BASE_URL + STUDY_URL   (cờ skip-worktree)
│
├── backend/
│   ├── app.js              Express app — dùng chung local và Lambda
│   ├── server.js           Khởi động local (HTTP + WebSocket). KHÔNG lên Lambda
│   ├── lambda.js           Handler cho Lambda
│   ├── src/
│   │   ├── auth.js                 JWT sign/verify, bcrypt
│   │   ├── config.js               Đọc env, quyết định local vs cloud
│   │   ├── repositories.js         Chọn local hay dynamo theo DATA_STORE
│   │   ├── localRepositories.js    JSON file — chỉ development
│   │   ├── dynamoRepositories.js   DynamoDB — cloud
│   │   ├── exportService.js        Ghi S3 + pre-signed URL
│   │   ├── scoring.js              Chấm điểm game (dùng chung client/server)
│   │   ├── validation.js           Chuẩn hóa và kiểm tra dữ liệu vào
│   │   ├── errors.js               HTTP error helper
│   │   ├── sampleData.js           Dữ liệu mẫu local
│   │   └── realtimeServer.js       WebSocket in-memory — chỉ local
│   ├── public/
│   │   ├── study/  index.html, app.js, csv.js, styles.css, config.js
│   │   └── game/   index.html, app.js, styles.css, config.js
│   ├── tests/csv.test.mjs          21 test
│   └── scripts/
│       ├── package.mjs             Đóng gói ZIP cho Lambda
│       └── prepare-static-site.mjs Dựng bundle static theo môi trường
│
├── infra/
│   ├── template.yaml       SAM template
│   └── env.local.md        Giá trị thật — KHÔNG commit
│
├── docs/                   21 tài liệu gồm LOG.md
└── .github/workflows/      ci.yml, deploy-aws.yml
```

## 9. Ba file cùng tên `app.js` — bẫy đã gặp thật

| Đường dẫn | Chạy ở đâu | Lên Lambda? |
|---|---|---|
| `backend/app.js` | Lambda (server) | ✅ Có |
| `backend/public/study/app.js` | Trình duyệt | ❌ Phục vụ từ S3 |
| `backend/public/game/app.js` | Trình duyệt | ❌ Phục vụ từ S3 |

**Sửa file frontend rồi deploy Lambda sẽ không thấy gì thay đổi.** Frontend nằm
trên S3, cập nhật bằng `aws s3 sync`.

Vì sao file frontend vẫn xuất hiện trong Lambda: SAM khai `CodeUri: ../backend/`
nên copy cả thư mục kể cả `public/`. Nhưng `SERVE_STUDY_STATIC=false` khiến
Express bỏ qua hoàn toàn khối phục vụ static — code đó nằm đó không ai đọc.

(Script `npm run package` thì lọc kỹ hơn, chỉ đóng gói `lambda.js`, `app.js`,
`package.json`, `package-lock.json`, `src`, `node_modules`.)

---

# PHẦN IV — API VÀ DỮ LIỆU

## 10. Danh sách endpoint

Base: `https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/health` | ❌ | `{ok:true, service:"flashcard-backend"}` |
| POST | `/api/auth/register` | ❌ | Tạo tài khoản. Trùng username → **409** |
| POST | `/api/auth/login` | ❌ | Trả JWT + user |
| GET | `/api/me` | ✅ | Thông tin user từ token |
| GET | `/api/flashcards` | ✅ | Danh sách card của user hiện tại |
| POST | `/api/flashcards` | ✅ | Tạo một card |
| PUT | `/api/flashcards/:id` | ✅ | Sửa một card |
| DELETE | `/api/flashcards/:id` | ✅ | Xóa một card |
| GET | `/api/categories` | ✅ | Danh sách category |
| POST | `/api/categories` | ✅ | Tạo category |
| DELETE | `/api/categories/:category` | ✅ | Xóa — card chuyển về `Uncategorized` |
| GET | `/api/study/random` | ✅ | Card ngẫu nhiên để học |
| POST | `/api/sync` | ✅ | **Ghi hàng loạt** — extension và CSV import |
| POST | `/api/export` | ✅ | Ghi JSON lên S3, trả pre-signed URL |

Route không tồn tại → **404** kèm `No route for <METHOD> <path>`.
Auth qua header `Authorization: Bearer <token>`.

## 11. `POST /api/sync` — endpoint quan trọng nhất

Chỗ **duy nhất ghi được nhiều card trong một request**. Cả extension sync lẫn CSV
import đều dùng.

```json
// Request
{ "flashcards": [ {cardId, word, meaning, wordform, category}, ... ] }

// Response
{ "ok": true, "count": 10, "created": 7, "updated": 3, "syncedAt": "..." }
```

**Upsert theo `cardId`:** gửi lại cùng `cardId` sẽ cập nhật bản ghi cũ chứ không
tạo bản sao. Đây là điều kiện để retry an toàn.

**Ràng buộc:** `meaning` không được rỗng — một dòng thiếu nghĩa làm hỏng **cả
batch** với lỗi 400.

*Ghi chú về tên gọi:* import từ Study web ghi thẳng vào DynamoDB, không có bước
đồng bộ nào. Tên `sync` là di sản của luồng extension (nơi card sống ở
`chrome.storage.local` trước). Không dùng `POST /api/flashcards` vì endpoint đó
ghi một card mỗi request — 60 từ sẽ mất ~30 giây và gần chắc chắn dính 429.

## 12. Mô hình dữ liệu DynamoDB

Ba bảng, đều **provisioned 1 RCU / 1 WCU**.

```text
Users
  Partition key   username (String)
  Thuộc tính      userId, username, passwordHash, role, createdAt, updatedAt

Flashcards
  Partition key   userId (String)
  Sort key        cardId (String)
  Thuộc tính      word, meaning, wordform, category, createdAt, updatedAt,
                  syncedAt, sourceUrl, sourceTitle

Categories
  Partition key   userId (String)
  Sort key        categoryName (String)
```

Mật khẩu lưu **bcrypt hash**, không bao giờ plaintext.

Partition theo `userId` nghĩa là user A **không thể** đọc card của user B ở tầng
truy vấn, không phải chỉ ở tầng ứng dụng.

`sourceUrl`/`sourceTitle` lưu trang web nơi từ được bắt gặp — nghĩa là file export
chứa một phần lịch sử duyệt web, cần lưu ý khi chụp màn hình báo cáo.

---

# PHẦN V — TÍNH NĂNG

## 13. Chrome Extension

- **Context menu:** bôi đen từ trên trang bất kỳ → chuột phải → thêm flashcard
- **Editor trong trang:** overlay ngay tại chỗ, dùng **Shadow DOM** để CSS trang
  web không phá giao diện
- **Offline-first:** lưu `chrome.storage.local` trước, hoạt động cả khi backend
  chết
- **Popup:** đăng nhập, xem card local, Sync, Export
- Sync đẩy toàn bộ card local lên DynamoDB qua `/api/sync`

### Vấn đề CORS của content script

Content script gửi request mang **origin của trang web nó được inject vào**, chứ
không phải `chrome-extension://<id>`. Từ Chrome 85, host permission **không**
miễn trừ CORS cho content script.

Không thể đưa "mọi website" vào allowlist. Đây từng là lỗi chặn deploy với nút
Translate. Sau khi gỡ Translate, content script không còn gọi API nào.

**Popup không bị ảnh hưởng** — nó chạy trong ngữ cảnh extension, origin nằm trong
allowlist.

## 14. Study Web

Hai tab: **Study** (học/kiểm tra) và **Library** (quản lý thư viện).

CRUD flashcard, quản lý category, lọc theo category, chuyển sang Game, dark/light
theme lưu trong `localStorage`, và import/export CSV.

## 15. CSV Import/Export — tính năng mới nhất (2026-07-23)

### Vấn đề

Mọi flashcard phải gõ tay từng cái. Không có cách nạp một bộ từ vựng có sẵn.

### Thiết kế

| Câu hỏi | Quyết định | Lý do |
|---|---|---|
| Đặt ở đâu | Tab Library của Study | Tránh giới hạn `chrome.storage.local` |
| Parse ở đâu | **Trình duyệt** | Backend không đổi một dòng |
| Ghi bằng gì | `POST /api/sync` | Endpoint bulk write duy nhất |
| Từ trùng | Bỏ qua, giữ card cũ | Người dùng đã sửa nghĩa/category rồi |
| Export | Blob tải thẳng | Card đã có trong RAM, **không tốn Lambda/S3** |

> **Lưu ý cho báo cáo:** Export **CSV** chạy thuần trong trình duyệt, không qua
> S3. Chỉ Export **JSON** mới đi qua S3 + pre-signed URL. Không ghi rõ thì người
> đọc sẽ tưởng mọi export đều qua S3.

### Định dạng

```csv
word,meaning,wordform,category
resilient,kiên cường,adjective,IELTS
"give up","to quit, to stop trying",phrasal verb,IELTS
```

**Đọc:**
- Tự nhận dấu phân tách `,` `;` Tab (Excel bản Việt hay xuất `;`)
- UTF-8 có/không BOM; UTF-16 "Unicode Text" của Excel cũng đọc được nhờ BOM
- Có header thì đọc theo tên cột, **thứ tự nào cũng được**, cột lạ bỏ qua
- Không header thì theo thứ tự `word, meaning, wordform, category`
- Trường bọc `"` giữ nguyên dấu phẩy, xuống dòng, `""` thoát
- Dòng trống bỏ qua nhưng **số dòng báo lỗi vẫn khớp file gốc**
- Trần **1000 dòng** mỗi lần

**Ghi:**
- Luôn có BOM + CRLF → Excel mở tiếng Việt không vỡ font
- Bọc `"` khi trường chứa dấu phân tách/`"`/xuống dòng/khoảng trắng đầu cuối
- **Export rồi import lại cho ra đúng bộ card ban đầu** (có test bảo vệ)

### Chia lô để tránh throttle — phần kỹ thuật đáng nói nhất

```text
DynamoDB     1 WCU mỗi bảng
API Gateway  2 req/s, burst 5
Lambda       timeout 15s
```

Import N từ mới tạo ~`2N` lượt ghi bảng Flashcards (mỗi card thử `update` rồi
`create`) cộng `N+1` lượt ghi bảng Categories — vòng lặp category ghi một lần cho
**mỗi card** chứ không gộp. **60 từ ≈ 180 lượt ghi**, sống được nhờ burst credit
(tối đa 300), không phải nhờ capacity thường trực.

Giải pháp phía client:

- Gửi theo lô **25 dòng**, tuần tự
- Mỗi lô retry tối đa 2 lần khi gặp lỗi mạng/429/5xx, giãn 1.5s rồi 3s
- **`cardId` sinh một lần cho mỗi file**, không sinh lại khi retry → `/api/sync`
  upsert đúng bản ghi cũ thay vì tạo bản sao
- Hỏng giữa chừng thì đếm số đã lưu, cho bấm tiếp chạy nốt

Đã kiểm chứng: gửi cùng batch hai lần cho `created: 2` rồi `created: 0,
updated: 2`.

### Giới hạn đã biết

- Chống trùng dựa trên bản chụp RAM của tab hiện tại — hai tab import song song
  có thể lọt từ trùng
- Chống trùng chỉ so `word` → cùng một từ ở hai category bị coi là trùng
- Import chỉ thêm, không xóa và không sửa card sẵn có
- Không chống CSV injection khi export (`=` `+` `-` `@` ghi nguyên văn). Chủ ý —
  để khứ hồi không làm biến dạng từ như `-ology`

## 16. Game Web

| Chế độ | Luật |
|---|---|
| `solo-10-card` | 10 card, hết là xong |
| `solo-30s` | 30 giây, trả lời được bao nhiêu tính bấy nhiêu |

### Cách tính điểm

`backend/src/scoring.js`, dùng chung client và server:

```text
Trùng khớp hoàn toàn (sau chuẩn hóa)           → 100 điểm   exact
Chuỗi con chung dài nhất ≥ 50% độ dài từ đúng  →  50 điểm   partial
Còn lại                                        →   0 điểm   wrong
```

Chuẩn hóa: chữ thường, cắt khoảng trắng, bỏ ký tự không phải chữ/số ở đầu cuối,
gộp khoảng trắng liên tiếp.

Dùng **Longest Common Substring** (quy hoạch động) cho điểm bán phần — người học
nhớ mang máng vẫn được điểm.

### Tính năng Skip (mới)

```text
Đang chờ trả lời  → nút hiện "Skip (wrong)", bấm được
                  → bỏ qua card, tính SAI, sang card tiếp
Đã trả lời rồi    → nút hiện "Next prompt"
```

Cờ `hasAnsweredCurrent` đảm bảo không đếm hai lần nếu đã trả lời rồi mới bấm.

Lý do: không nhớ từ thì không phải gõ bừa để qua card.

### Realtime multiplayer — chỉ local

Prototype WebSocket in-memory trong `backend/src/realtimeServer.js`, chạy qua
`node server.js`. **Không deploy lên AWS** vì Lambda HTTP API không giữ được kết
nối WebSocket.

Trên bản AWS, tab Realtime bị **disable** với nhãn "Realtime (local only)". Code
kiểm tra `REALTIME_URL === undefined` (không phải falsy) nên chuỗi rỗng được tôn
trọng, không rơi vào fallback `ws://<origin>/realtime`.

Muốn làm thật cần: API Gateway **WebSocket API** + Lambda handlers + DynamoDB
bảng Rooms/Connections.

---

# PHẦN VI — BẢO MẬT

## 17. Các lớp bảo vệ

| Lớp | Cơ chế |
|---|---|
| Mật khẩu | bcrypt hash |
| Phiên | JWT, mọi endpoint dữ liệu đều yêu cầu |
| Quyền sở hữu | `userId` lấy từ JWT đã verify — **không tin client gửi lên** |
| Cách ly dữ liệu | DynamoDB partition theo `userId` |
| CORS | Allowlist chính xác từng origin, **không dùng `*`** |
| Throttle | API Gateway 2 req/s, burst 5 |
| Export bucket | Block Public Access đủ 4 cờ; chỉ qua pre-signed URL |
| Static bucket | Public nhưng **chỉ `s3:GetObject`**, không `ListBucket` |
| IAM Lambda | Chỉ 3 bảng DynamoDB + export bucket prefix |
| Secret | Không access key nào trong code; Lambda dùng execution role |

### CORS allowlist

```text
http://localhost:3000
chrome-extension://YOUR_EXTENSION_ID
http://YOUR_SITE_BUCKET.s3-website-ap-southeast-1.amazonaws.com
https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com
```

**Cảnh báo:** tham số `AllowedOrigins` có `Default: http://localhost:3000`. Quên
truyền lại chuỗi đầy đủ khi redeploy sẽ thu hẹp CORS về localhost và làm hỏng cả
extension lẫn Study.

### Vì sao static bucket không cấp `s3:ListBucket`

Người ngoài không liệt kê được nội dung bucket. Hệ quả phụ: object không tồn tại
trả **403** thay vì 404 — S3 cố tình không tiết lộ file nào có. Đây là hành vi
đúng, không phải lỗi.

## 18. Bằng chứng bảo mật đã kiểm chứng

```text
Đăng ký trùng username          → 409 Conflict, không tạo bản sao
Gọi API không token             → 401 Authentication required
Route không tồn tại             → 404 No route for POST /api/xxx
Export object qua pre-signed    → 200, tải được JSON
Export object qua URL trần      → 403 Forbidden        ← bằng chứng SR-04
Export bucket Block Public      → 4/4 cờ true
Preflight OPTIONS từ Study      → 204, allow-origin đúng
```

Bộ ba dòng về export là bằng chứng mạnh nhất: **object có thật, truy cập đúng
cách được, truy cập sai cách bị chặn**. (Thử 403 trên key không tồn tại thì không
chứng minh được gì — phải dùng object thật.)

## 19. Điểm yếu đã biết — nên nêu trong phần Hạn chế

- **JWT secret đọc được** bởi ai có quyền `lambda:GetFunctionConfiguration` (nó
  nằm trong biến môi trường Lambda). Production nên dùng Secrets Manager hoặc SSM
  `SecureString`.
- Không có refresh token, không có cơ chế thu hồi token trước hạn.
- Không có rate limit riêng cho login/register — chỉ throttle chung.
- Static bucket vẫn public — CloudFront + OAC sẽ khắc phục.
- Không MFA; chính sách mật khẩu yếu (tối thiểu 6 ký tự).
- Sample credential `student/password123` tồn tại trong dữ liệu mẫu local —
  tuyệt đối không seed lên AWS công khai.
- Chưa có CloudWatch Alarms.

---

# PHẦN VII — TRIỂN KHAI

## 20. Hạ tầng dạng mã (SAM)

`infra/template.yaml`:

```yaml
Parameters:
  JwtSecret        # NoEcho: true
  AllowedOrigins   # Default: http://localhost:3000

Resources:
  ApiFunction      AWS::Serverless::Function   nodejs24.x, 256MB, 15s
  HttpApi          AWS::Serverless::HttpApi    throttle 2/s burst 5
  UsersTable       AWS::DynamoDB::Table        1 RCU / 1 WCU
  FlashcardsTable  AWS::DynamoDB::Table        1 RCU / 1 WCU
  CategoriesTable  AWS::DynamoDB::Table        1 RCU / 1 WCU
  ExportBucket     AWS::S3::Bucket             private, hết hạn 7 ngày

Outputs:
  ApiUrl, ExportBucketName
```

**SAM không tạo site bucket** — phải tạo tay. Đây là khoảng trống đã biết, và là
lý do site bucket nằm ngoài stack.

### IAM policy của Lambda

```text
DynamoDBCrudPolicy  × 3 bảng
S3CrudPolicy        × export bucket
(+ CloudWatch Logs tự động)
```

Sau khi gỡ Translate, role còn đúng **4 inline policy**. Trước đó có 5 — policy
thứ 5 là `translate:TranslateText` + `comprehend:DetectDominantLanguage`, bị
CloudFormation xóa khi redeploy ngày 2026-07-21.

*Ghi chú:* `S3CrudPolicy` của SAM rộng hơn mức tối thiểu (kèm `s3:PutObjectAcl`,
`s3:DeleteObject`, `s3:PutLifecycleConfiguration`). Đây là canned policy của SAM,
không phải ai nới quyền.

## 21. Biến môi trường Lambda

```text
DATA_STORE=dynamodb
USERS_TABLE / FLASHCARDS_TABLE / CATEGORIES_TABLE
JWT_SECRET
EXPORT_BUCKET
ALLOWED_ORIGINS
SERVE_STUDY_STATIC=false
```

**Không tự đặt `AWS_REGION`** — reserved key do runtime tiêm, đặt tay làm Lambda
từ chối cấu hình. Code vẫn đọc `process.env.AWS_REGION` bình thường.

## 22. Quy trình deploy

### Redeploy backend (sửa code Lambda hoặc template)

```powershell
# 1. Lấy lại tham số đang chạy
$fn = aws cloudformation describe-stack-resources --stack-name <stack> --region ap-southeast-1 --query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" --output text --profile <profile>

$jwt = aws lambda get-function-configuration --function-name $fn --region ap-southeast-1 --profile <profile> --query "Environment.Variables.JWT_SECRET" --output text

$origins = aws cloudformation describe-stacks --stack-name <stack> --region ap-southeast-1 --query "Stacks[0].Parameters[?ParameterKey=='AllowedOrigins'].ParameterValue" --output text --profile <profile>

# 2. Kiểm tra và build
npm ci; npm run check; npm test
sam validate --lint; sam build

# 3. Deploy
sam deploy --stack-name <stack> --region ap-southeast-1 --resolve-s3 --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --confirm-changeset --profile <profile> --parameter-overrides JwtSecret="$jwt" AllowedOrigins="$origins"
```

### Cập nhật frontend (sửa Study/Game) — **không cần `sam deploy`**

```powershell
$env:API_BASE_URL="<api endpoint>"
$env:SITE_BASE_URL="<site bucket url>"
$env:STUDY_URL="$env:SITE_BASE_URL/study/index.html"
$env:GAME_URL="$env:SITE_BASE_URL/game/index.html"
npm run prepare:static
aws s3 sync dist/static-site s3://<site-bucket>/ --delete --cache-control "no-cache" --profile <profile>
```

## 23. Ba bài học vận hành

### 23.1 `JwtSecret` khai `NoEcho` nhưng vẫn lấy lại được

CloudFormation không trả lại giá trị tham số `NoEcho`. Nhưng template truyền nó
vào **biến môi trường Lambda**, mà biến môi trường thì đọc được:

```powershell
aws lambda get-function-configuration --function-name $fn --query "Environment.Variables.JWT_SECRET" --output text
```

Nhờ đó redeploy giữ nguyên secret, **không ai bị đăng xuất**. Sinh secret mới thì
mọi JWT đã phát bị vô hiệu ngay lập tức.

`sam deploy --parameter-overrides` **không hỗ trợ** `UsePreviousValue=true` như
`aws cloudformation update-stack`.

### 23.2 `--confirm-changeset` phải truyền tường minh

Mặc định SAM là **không hỏi** (`Confirm changeset : False`). Bỏ cờ
`--no-confirm-changeset` ra là **chưa đủ**.

Cũng phải truyền `--profile` nếu dùng named profile, nếu không SAM báo
`Unable to locate credentials` dù mọi lệnh `aws` khác đều chạy tốt.

### 23.3 S3 không gửi `Cache-Control` mặc định

Trình duyệt tự cache `.js`/`.css` theo phỏng đoán. Triệu chứng: **deploy xong
nhưng không thấy gì thay đổi** — đã gặp hai lần.

Xác minh dứt điểm bằng cách so MD5 local với ETag trên S3:

```powershell
aws s3api head-object --bucket <bucket> --key game/app.js --query "{Size:ContentLength,ETag:ETag}" --profile <profile>
```

Khớp nghĩa là file đã lên → vấn đề là cache trình duyệt → Ctrl+Shift+R hoặc tab
ẩn danh. Phòng ngừa bằng `--cache-control "no-cache"`.

## 24. CI/CD

```text
.github/workflows/ci.yml          tự chạy khi push/PR
.github/workflows/deploy-aws.yml  chạy tay qua workflow_dispatch
```

CI: syntax check, dependency audit, đóng gói Lambda, SAM validate, SAM build.

Deploy dùng **GitHub OIDC** với credential ngắn hạn — không lưu AWS access key
trong repo. `JWT_SECRET` lấy từ GitHub Secrets.

---

# PHẦN VIII — KIỂM THỬ

## 25. Test tự động

```powershell
cd backend
npm test        # 21/21 pass
npm run check   # syntax check toàn bộ file JS
```

Dùng `node:test` built-in, không cần cài framework.

### 21 test của module CSV

```text
parse  header thường / không header / header đảo thứ tự / cột lạ
parse  dấu phân tách , ; Tab
parse  giữ nguyên dấu phân tách và xuống dòng trong trường quoted
parse  bỏ BOM UTF-8
parse  báo lỗi thiếu word / thiếu meaning, giữ đúng số dòng gốc
parse  bỏ dòng trống không làm lệch số dòng
parse  category rỗng → Uncategorized, cắt 40 ký tự
parse  chuẩn hóa wordform đã biết, giữ nguyên giá trị lạ
parse  chặn khi quá 1000 dòng
parse  input rỗng không ném lỗi
plan   bỏ từ đã có trong thư viện
plan   trong cùng file, giữ bản đầu tiên
write  có BOM, CRLF, đúng thứ tự cột
write  bọc trường chứa ký tự đặc biệt
round  export → import cho ra đúng bộ card ban đầu
misc   buildFileName an toàn với hệ thống file
misc   file template mẫu parse lại thành 2 dòng hợp lệ
```

## 26. Kiểm thử thủ công

E2E trên AWS thật, 2026-07-21:

| Giai đoạn | Nội dung | Kết quả |
|---|---|---|
| A | Study web: login, register, CRUD, CORS | ✅ |
| B | Game: không có WebSocket, tab Realtime disabled | ✅ |
| C | Extension: reload, save local, sync, đọc lại trên Study | ✅ |
| D | Export: pre-signed tải được, URL trần 403 | ✅ |

Deploy CSV, 2026-07-23:

```text
6/6 object trả HTTP 200 qua HTTPS
MD5 local khớp ETag S3
index.html có đủ nút Import/Export/Template
OPTIONS /api/sync từ origin Study → 204     ← cặp origin/route MỚI
```

Điểm đáng chú ý: **Study web trước đây chưa từng gọi `/api/sync`** — route đó chỉ
extension dùng. Đây là cặp origin/route mới, và local không phát hiện được vì
local cho phép mọi origin.

## 27. Bẫy: "local chạy được" không chứng minh gì về CORS

Ở local, `allowAllOrigins` tự bật khi `DATA_STORE=local` và chưa set
`ALLOWED_ORIGINS`. **Lỗi CORS chỉ lộ ra khi lên AWS.**

---

# PHẦN IX — CHI PHÍ

## 28. Cấu trúc chi phí

| Dịch vụ | Cách tính | Ghi chú |
|---|---|---|
| Lambda | Request + GB-giây | Free tier 1 triệu req + 400.000 GB-s/tháng |
| API Gateway | Request | HTTP API rẻ hơn REST API ~70% |
| DynamoDB | **Theo giờ** (provisioned) | Tính tiền cả khi idle — chi phí thường trực chính |
| S3 | Lưu trữ + request | Vài trăm KB static, không đáng kể |
| CloudWatch | Log ingest + lưu trữ | Giữ 7 ngày |

**Không có dịch vụ nào tính tiền theo giờ ở mức cao** — không EC2, RDS, NAT
Gateway, WAF. Chi phí thường trực duy nhất là DynamoDB provisioned tối thiểu.

## 29. Biện pháp kiểm soát

```text
API Gateway throttle       2 req/s, burst 5
DynamoDB                   1 RCU / 1 WCU mỗi bảng
Export lifecycle           tự xóa sau 7 ngày
Multipart dở dang          dọn sau 1 ngày
CloudWatch log retention   7 ngày
AWS Budgets                cảnh báo $1 và $5
```

**Budgets chỉ cảnh báo, không phải trần chi tiêu cứng.** Dữ liệu cập nhật ít nhất
mỗi ngày một lần nên không chặn chi phí tức thời.

### Tối ưu chưa thực hiện

Chuyển ba bảng sang `BillingMode: PAY_PER_REQUEST`. Provisioned tính tiền theo
giờ dù không dùng; on-demand tính theo request thực tế, mà mức dùng của dự án gần
như bằng không. Cần sửa template và redeploy nên chưa làm.

---

# PHẦN X — LỊCH SỬ VÀ TRẠNG THÁI

## 30. Mốc phát triển

| Ngày | Việc |
|---|---|
| ~2026-06 | Prototype local: Express + JSON file + extension |
| 2026-07-14 | Audit toàn diện, viết bộ docs 01–11 |
| 2026-07-20 | Deploy AWS lần đầu; nâng runtime nodejs24.x; thêm CI/CD |
| 2026-07-21 | **Gỡ Amazon Translate**; viết lại hướng dẫn deploy; E2E đầy đủ |
| 2026-07-21 | Redeploy stack — xóa IAM policy Translate còn sót trên AWS |
| 2026-07-21 | Game: thêm nút Skip (tính sai) |
| 2026-07-23 | **CSV import/export** + 21 test; deploy static bundle |

## 31. Việc đã đóng

- ✅ Runtime Node.js 20 (deprecated) → 24
- ✅ Bỏ reserved key `AWS_REGION` khỏi cấu hình
- ✅ `SERVE_STUDY_STATIC=false`, static tách sang S3
- ✅ Gỡ Amazon Translate cả 4 lớp: source, template, code Lambda đang chạy, IAM role
- ✅ Tắt realtime UI đúng cách trên bản AWS
- ✅ CI/CD với OIDC, không lưu access key
- ✅ Throttle + lifecycle đưa về CloudFormation quản lý (hết drift)

## 32. Việc còn mở

| Việc | Trạng thái |
|---|---|
| CloudFront + HTTPS sạch | ⏳ Chờ AWS review tài khoản (đã mở case Support) |
| Custom domain | ❌ Chưa mua |
| Static bucket còn public | ⏳ Phụ thuộc CloudFront + OAC |
| CloudWatch Alarms | ❌ Chưa cấu hình |
| Realtime multiplayer trên AWS | ❌ Cần kiến trúc WebSocket riêng |
| Automated browser E2E | ❌ Chưa có |
| DynamoDB backup / pagination | ❌ Chưa có |
| Xử lý xung đột khi sync | ❌ Hiện upsert-only, không xử lý xóa |
| Publish extension lên Chrome Web Store | ❌ Chưa |
| `backend/public/game/app.js` (Skip) | ⚠️ Đã deploy S3 nhưng **chưa commit git** |

## 33. Ràng buộc phải nhớ khi bàn giao

1. **Frontend không lên Lambda.** Sửa Study/Game thì `aws s3 sync`, không phải
   `sam deploy`.
2. **`extension-config.js` đặt cờ `skip-worktree`** — sửa local không lọt vào
   commit, HEAD luôn giữ placeholder. Giá trị thật ở `infra/env.local.md`.
3. **Truyền lại `AllowedOrigins` đầy đủ mỗi lần deploy.**
4. **Lấy lại `JwtSecret` từ Lambda env**, đừng sinh mới.
5. **Không dùng CORS `*`** để chữa lỗi origin.
6. **Không mở public export bucket** để chữa lỗi download.
7. `ChromeFlashCardExtension-test-aws-clean/` là bản sao thử nghiệm, **không phải
   source of truth**, đã gitignore.

---

# PHẦN XI — HƯỚNG DẪN VIẾT BÁO CÁO

## 34. Cấu trúc đề xuất

```text
1. Giới thiệu            Bài toán, người dùng, phạm vi
2. Yêu cầu               Chức năng và phi chức năng
3. Kiến trúc             Sơ đồ + giải thích từng dịch vụ + lý do chọn
4. Thiết kế chi tiết     API contract, mô hình dữ liệu, thuật toán chấm điểm
5. Triển khai            IaC, CI/CD, quy trình deploy
6. Bảo mật               Các lớp bảo vệ + bằng chứng kiểm chứng
7. Kiểm thử              Test tự động + E2E thủ công + evidence
8. Chi phí               Cấu trúc + biện pháp kiểm soát
9. Khó khăn & bài học    Xem mục 35 — phần "hay" nhất
10. Hạn chế & hướng phát triển
```

## 35. Khó khăn thật đã gặp — phần có chiều sâu nhất

Đây là các vấn đề **thực sự xảy ra**, có nguyên nhân kỹ thuật rõ ràng. Kể chi
tiết sẽ làm báo cáo khác hẳn phần mô tả tính năng thuần túy.

### 35.1 CORS với Chrome extension

Content script gửi request mang origin của trang web bị inject, không phải origin
extension. Host permission **không** miễn trừ CORS từ Chrome 85. Không thể đưa
"mọi website" vào allowlist, và dùng `*` thì biến API thành endpoint mở.

→ *Bài học:* **ngữ cảnh thực thi** quyết định origin, không phải chỗ code nằm.

### 35.2 Amazon Translate không dùng được

Tài khoản trả `OptInRequired: The AWS Access Key Id needs a subscription for the
service`. Đây **không** phải lỗi thiếu access key — Lambda đã dùng execution
role. Đó là hạn chế cấp tài khoản.

→ *Quyết định:* gỡ tính năng thay vì chờ, vì không kiểm soát được thời điểm được
cấp quyền.

→ *Bài học quan trọng:* khi rà lại, phát hiện IAM role trên AWS **vẫn còn** quyền
Translate dù template đã sạch. **Template sạch không có nghĩa hạ tầng đang chạy
đã sạch** — phải deploy mới thực sự áp dụng. Phải kiểm tra ở 4 lớp: source,
template, code Lambda đang chạy, IAM role đang chạy.

### 35.3 Deploy xong không thấy thay đổi

Hai lần, nguyên nhân khác nhau:

- Lần 1: sửa file frontend rồi deploy Lambda — nhưng frontend nằm trên S3
- Lần 2: đã sync lên S3 đúng, nhưng trình duyệt cache file `.js`

→ *Bài học:* xác minh bằng dữ kiện (so MD5 với ETag) thay vì đoán.

### 35.4 Throttle khi import hàng loạt

60 từ tạo ~180 lượt ghi DynamoDB, vượt xa 1 WCU. Phải chia lô 25, retry có giãn
cách, và giữ nguyên `cardId` khi retry để tránh tạo bản sao.

→ *Bài học:* thiết kế client phải biết giới hạn của hạ tầng phía sau.

### 35.5 CloudFront bị chặn bởi account verification

Tài khoản mới cần AWS review nội bộ trước khi tạo được distribution, dù đã xác
minh số điện thoại và tài khoản đang active.

→ *Bài học:* có những phụ thuộc **không kiểm soát được bằng kỹ thuật**, phải có
kế hoạch dự phòng (ở đây là dùng tạm S3 REST endpoint HTTPS).

## 36. Số liệu dùng cho báo cáo

```text
Endpoint API                14
Bảng DynamoDB                3
Bucket S3                    2   (1 public static ngoài stack, 1 private export)
Test tự động                21   (21/21 pass)
Tài liệu trong docs/        21 file
Lambda                     256 MB, timeout 15s, nodejs24.x
API throttle                 2 req/s, burst 5
DynamoDB capacity            1 RCU / 1 WCU mỗi bảng
Pre-signed URL              15 phút
Export lifecycle             7 ngày
Log retention                7 ngày
Chấm điểm                  100 / 50 / 0
Chế độ game                  2   (10 card, 30 giây)
CSV batch                   25 dòng/lô, trần 1000 dòng
Budgets                      2 mức: $1 và $5
```

## 37. Thuật ngữ

| Thuật ngữ | Nghĩa trong dự án này |
|---|---|
| **Cold start** | Lần gọi đầu Lambda phải khởi tạo runtime, chậm hơn |
| **Pre-signed URL** | URL có chữ ký, cho phép tải object private trong thời hạn |
| **OAC** (Origin Access Control) | Cách CloudFront truy cập S3 private; thay thế OAI cũ |
| **Upsert** | Ghi: có thì cập nhật, chưa có thì tạo mới |
| **Partition key** | Khóa phân mảnh DynamoDB, quyết định dữ liệu nằm ở đâu |
| **Throttle** | Giới hạn số request mỗi giây |
| **Burst credit** | Lượng request vượt mức tích lũy được, dùng cho đợt cao điểm |
| **Preflight** | Request `OPTIONS` trình duyệt tự gửi trước request thật để hỏi CORS |
| **Drift** | Chênh lệch giữa template IaC và hạ tầng thật đang chạy |
| **skip-worktree** | Cờ git bảo "bỏ qua thay đổi local của file này" |
| **MV3** | Chrome Manifest V3, chuẩn extension hiện tại |
| **LCS** | Longest Common Substring — thuật toán chấm điểm bán phần |
| **Shadow DOM** | Cây DOM cách ly, để CSS trang web không phá giao diện editor |

---

# PHỤ LỤC — Bản đồ tài liệu gốc

Cần chi tiết hơn file này thì đọc trong `docs/`:

```text
README.md                        Chỉ mục và quy ước trạng thái
01_PROJECT_CONTEXT.md            Sản phẩm, luồng người dùng, cấu trúc repo
02_REQUIREMENTS.md               Yêu cầu chức năng/phi chức năng, acceptance
03_CURRENT_STATE_AUDIT.md        Audit hiện trạng kèm bằng chứng
04_AWS_ARCHITECTURE.md           Kiến trúc target, ADR, failure modes
05_API_DATA_CONFIG_CONTRACTS.md  API, DynamoDB, biến môi trường
06_MIGRATION_PLAN.md             Thứ tự thay đổi an toàn và các gate
07_MANUAL_DEPLOYMENT_RUNBOOK.md  Triển khai bằng AWS Console từng màn hình
08_SECURITY_OPERATIONS_COST.md   Bảo mật, log, alarm, backup, chi phí
09_TEST_AND_ACCEPTANCE.md        Test matrix và evidence cần lưu
10_IMPROVEMENT_BACKLOG.md        Backlog ưu tiên, definition of done
11_AGENT_HANDOFF.md              Quy tắc cho người/agent tiếp theo
12_CI_CD_GUIDE.md                GitHub Environment, OIDC, secrets
13_CSV_IMPORT_EXPORT.md          Chi tiết tính năng CSV
AWS_DEPLOYMENT.md                Hướng dẫn deploy từng bước (Phần A/B/C)
AWS_USAGE_CHECKLIST.md           Dịch vụ nào đã thật sự được gọi + link console
DEPLOY_READINESS.md              Trạng thái deploy thật và việc còn lại
LOG.md                           Nhật ký thay đổi đầy đủ theo ngày
```

**Lưu ý:** docs 01–11 là snapshot ngày 2026-07-14, có mục "Cập nhật 2026-07-21" ở
cuối file ghi những gì đã thay đổi. Đọc cả thân bài lẫn mục cập nhật để tránh
hiểu nhầm trạng thái.
