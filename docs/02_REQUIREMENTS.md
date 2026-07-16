# 02. Requirements và Acceptance Criteria

## 1. Mức ưu tiên

- `MUST`: bắt buộc cho demo/deploy MVP.
- `SHOULD`: nên có để giảm sự cố và tăng chất lượng báo cáo.
- `COULD`: tùy thời gian.
- `OUT`: ngoài phạm vi lần deploy này.

## 2. Functional requirements

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| FR-01 | MUST | Register bằng username/password | User mới được tạo trong Users table, password chỉ có `passwordHash` |
| FR-02 | MUST | Login và JWT auth | Login trả JWT; `/api/me` pass với token và trả 401 khi thiếu/sai token |
| FR-03 | MUST | Extension lưu flashcard offline | Lưu được vào `chrome.storage.local` khi backend không chạy |
| FR-04 | MUST | Translate từ popup | Cloud trả `provider=amazon-translate`, input bị giới hạn, route yêu cầu JWT |
| FR-04b | MUST (quyết định) | Translate từ editor (content script) | Chỉ đạt nếu định tuyến qua background service worker. Fetch trực tiếp từ content script sẽ bị CORS chặn trên AWS (AUD-P0-07). Nếu owner chọn không sửa code, hạ FR-04b xuống `OUT` và ghi rõ editor-translate là local-only |
| FR-05 | MUST | Sync local cards lên cloud | Cards được upsert theo current JWT user; user khác không đọc được |
| FR-06 | MUST | Flashcard CRUD trên Study Web | List/create/update/delete hoạt động qua API Gateway |
| FR-07 | MUST | Category CRUD | Tạo/list/delete; xóa category chuyển cards về `Uncategorized` |
| FR-08 | MUST | Study/test web từ S3 | Tải được static assets, login và gọi API Gateway thành công |
| FR-09 | MUST | Export JSON | Lambda ghi object theo prefix user vào private bucket và trả pre-signed URL |
| FR-10 | MUST | Health check | `GET /api/health` trả 200 và JSON expected |
| FR-11 | SHOULD | Game solo | Game Web tải cards và scoring behavior hiện tại chạy ổn trên static hosting |
| FR-12 | OUT | Realtime AWS multiplayer | Không dùng local in-memory WebSocket như bằng chứng AWS MVP |

## 3. Cloud architecture requirements

| ID | Requirement |
|---|---|
| AR-01 | Dùng tối thiểu API Gateway, Lambda và DynamoDB; demo target thêm S3, Translate, CloudWatch. |
| AR-02 | Express app phải chạy local và trên Lambda, không gọi `app.listen()` khi import handler. |
| AR-03 | Lambda runtime phải còn được AWS hỗ trợ tại ngày deploy. Target: `nodejs24.x` (hỗ trợ tới 2028-04-30), sau compatibility test. Không dùng `nodejs22.x` (hết hỗ trợ 2027-04-30) và không dùng `nodejs20.x` (đã deprecated 2026-04-30). |
| AR-04 | Không lưu state bền vững trên Lambda filesystem hoặc process memory. |
| AR-05 | Flashcard/category được partition theo user; normal list dùng DynamoDB Query, không Scan. |
| AR-06 | Export bucket private; static website bucket tách biệt và chỉ chứa public frontend assets. |
| AR-07 | CORS ở API Gateway và Express phải cùng allowlist. |
| AR-08 | Table/bucket names, secret và allowed origins phải cấu hình ngoài code. Trên Lambda, code đọc `AWS_REGION` do runtime tự cung cấp; template/Console không được tự set reserved key này. |

## 4. Security requirements

| ID | Priority | Requirement |
|---|---|---|
| SR-01 | MUST | Không commit AWS credentials, JWT production secret hoặc `.env`. |
| SR-02 | MUST | Lambda role theo least privilege cho 3 tables, export object prefix, Translate và Comprehend detect language nếu dùng `auto`. |
| SR-03 | MUST | Không dùng fallback `local-dev-secret-change-before-production` trên AWS. |
| SR-04 | MUST | Export bucket bật Block Public Access; raw object URL phải bị 403. |
| SR-05 | MUST | CORS không dùng `*` trong môi trường demo final. Ràng buộc này **không được nới** để làm content-script translate chạy; giải pháp đúng là định tuyến qua service worker (AUD-P0-07). |
| SR-06 | MUST | Không dùng sample credential `student/password123` làm tài khoản AWS demo thật. |
| SR-07 | SHOULD | Password policy mạnh hơn 6 ký tự và loại bỏ password mẫu khỏi popup trước phát hành. |
| SR-08 | SHOULD | Static site dùng HTTPS qua CloudFront trước khi chứa dữ liệu thật/JWT thật. |
| SR-09 | SHOULD | Rate limit/abuse protection cho login, register, translate và sync. |
| SR-10 | SHOULD | Log không chứa JWT, password, full pre-signed URL hoặc card content nhạy cảm. |

## 5. Reliability and performance requirements

- Lambda timeout target 15 giây chỉ phù hợp demo; sync phải được thử với 1, 10, 50 và 100 cards.
- API request body không vượt Express limit 1 MB.
- DynamoDB pagination phải được bổ sung trước khi dữ liệu một user có thể vượt 1 MB Query result.
- Retry của client không được tạo duplicate logical cards; card ID là idempotency key hiện tại.
- Lỗi một card trong `/api/sync` có thể để lại partial writes ở code hiện tại; UI/runbook phải thừa nhận và test retry.
- Category deletion nhiều cards có thể bị timeout/throttle vì update tuần tự; cần benchmark hoặc giới hạn demo dataset.
- Health endpoint không được phụ thuộc DynamoDB; smoke test persistence phải dùng auth/card riêng.

## 6. Operability requirements

| ID | Requirement |
|---|---|
| OR-01 | CloudWatch log group có retention hữu hạn, khuyến nghị 14 ngày cho demo. |
| OR-02 | Có alarm tối thiểu cho Lambda Errors và API Gateway 5xx; thêm Throttles nếu có thời gian. |
| OR-03 | Mọi deployment ghi region, stack/resource names, Git commit và test result vào `LOG.md`. |
| OR-04 | Có rollback procedure cho Lambda code/config và static assets. |
| OR-05 | Có cost budget nhỏ và billing alert ở account; không ghi con số giá cố định vào tài liệu lâu dài. |
| OR-06 | Có test checklist sau deploy và evidence không chứa secret. |

## 7. Internship/demo acceptance

Demo được coi là đạt khi tất cả điều sau có bằng chứng:

1. Sơ đồ kiến trúc chỉ rõ trách nhiệm của ít nhất 3 AWS services.
2. API health chạy qua public API Gateway HTTPS URL.
3. Register/login tạo và đọc user ở DynamoDB.
4. Một card được lưu offline trong extension, sync lên DynamoDB và thấy trên Study Web.
5. Translate trả dữ liệu từ Amazon Translate, không phải local mock.
6. Export tạo object trong private S3 bucket; pre-signed URL tải được, raw URL không tải được.
7. Study Web tải từ S3 website endpoint; CORS chỉ cho exact origins được chọn.
8. CloudWatch có log invocation tương ứng và không lộ secret/token.
9. Test negative: token sai -> 401, origin sai -> bị chặn, user B không thấy card user A.
10. Tất cả blocker P0 được đóng hoặc có quyết định chính thức loại feature khỏi demo.

## 8. Definition of done cho thay đổi tiếp theo

Mỗi task implementation sau tài liệu này phải:

- Chỉ sửa đúng source of truth.
- Có test/syntax/lint phù hợp.
- Cập nhật docs nếu contract hoặc architecture đổi.
- Append `LOG.md` với request, files, quyết định, lệnh test và kết quả.
- Không đánh dấu deploy thành công nếu chưa chạy E2E trên AWS thật.
