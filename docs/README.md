# Bộ tài liệu AWS - ChromeFlashCardExtension

> Snapshot tài liệu: 2026-07-14, nhánh `test-aws`.

Thư mục này là nguồn context chính cho việc đưa project lên AWS. Tài liệu phản ánh mã nguồn ở thư mục gốc của repository tại ngày snapshot; thư mục `ChromeFlashCardExtension-test-aws-clean/` là bản sao thử nghiệm, không được coi là source of truth.

## Mục tiêu triển khai

Triển khai bản demo thực tập dùng ít nhất 3 dịch vụ AWS, giữ nguyên luồng chính của extension và tránh mở rộng phạm vi không cần thiết.

Kiến trúc MVP chọn 6 dịch vụ có thể trình bày trong báo cáo:

1. Amazon API Gateway HTTP API - public HTTPS endpoint.
2. AWS Lambda - chạy Express backend.
3. Amazon DynamoDB - lưu users, flashcards và categories.
4. Amazon S3 - host Study/Game web và lưu export riêng tư.
5. Amazon Translate - dịch từ/cụm từ.
6. Amazon CloudWatch - log, metric và alarm cơ bản.

Ba dịch vụ cốt lõi đủ thỏa yêu cầu tối thiểu là API Gateway, Lambda và DynamoDB. S3 và Translate tạo giá trị nghiệp vụ rõ hơn cho phần demo. CloudWatch là lớp vận hành, không nên dùng làm dịch vụ chính duy nhất khi thuyết trình.

## Trạng thái ngắn gọn

| Khu vực | Trạng thái | Ghi chú |
|---|---|---|
| Express chạy local | Có | `backend/server.js`, JSON file repository |
| Lambda handler | Có | `backend/lambda.js`, `serverless-http` |
| DynamoDB repository | Có | 3 bảng, query theo `userId` |
| Amazon Translate | Có code | Đang dùng source `auto`; IAM hiện thiếu quyền Comprehend cần thiết |
| Translate trong editor (content script) | **Sẽ hỏng trên AWS** | Bị CORS chặn; phải định tuyến qua service worker. AUD-P0-07 |
| Export S3 riêng tư | Có code | Pre-signed URL 15 phút |
| API Gateway/SAM | Có starter | Runtime `nodejs20.x` đã deprecated; template còn cố set reserved `AWS_REGION` |
| S3 Study/Game web | Có static assets | Hạ tầng bucket website chưa nằm trong SAM template |
| Realtime multiplayer local | Prototype | WebSocket in-memory, không tương thích Lambda HTTP API hiện tại |
| Tắt realtime cho AWS | **Chưa xong** | `REALTIME_URL=""` không tắt được; code fallback sang `ws://<origin>/realtime`. AUD-P0-08 |
| Test tự động | Chưa đủ | Chỉ có syntax check cho 3 entry files; không bắt được lỗi CORS/runtime |
| AWS deploy đã xác nhận | Chưa có bằng chứng trong repo | Cần chạy runbook và lưu evidence |

Không deploy trước khi xử lý các mục P0 trong [10_IMPROVEMENT_BACKLOG.md](10_IMPROVEMENT_BACKLOG.md).

Trong 8 blocker P0, **6 mục chỉ cần đổi config hoặc chốt phạm vi**, nhưng **AWS-007 và AWS-008 bắt buộc sửa code**. Hai mục này được phát hiện khi review lại docs ngày 2026-07-14 và trước đó bị bỏ sót; chúng không thể xử lý trong runbook.

## Thứ tự đọc khuyến nghị

1. [01_PROJECT_CONTEXT.md](01_PROJECT_CONTEXT.md) - sản phẩm, luồng người dùng, phạm vi và cấu trúc repo.
2. [02_REQUIREMENTS.md](02_REQUIREMENTS.md) - yêu cầu chức năng, phi chức năng và tiêu chí chấp nhận.
3. [03_CURRENT_STATE_AUDIT.md](03_CURRENT_STATE_AUDIT.md) - những gì đang có, bằng chứng và khoảng trống.
4. [04_AWS_ARCHITECTURE.md](04_AWS_ARCHITECTURE.md) - kiến trúc target, quyết định và ranh giới MVP.
5. [05_API_DATA_CONFIG_CONTRACTS.md](05_API_DATA_CONFIG_CONTRACTS.md) - API, DynamoDB, storage và environment variables.
6. [06_MIGRATION_PLAN.md](06_MIGRATION_PLAN.md) - thứ tự thay đổi an toàn và các gate.
7. [07_MANUAL_DEPLOYMENT_RUNBOOK.md](07_MANUAL_DEPLOYMENT_RUNBOOK.md) - triển khai bằng AWS Console.
8. [08_SECURITY_OPERATIONS_COST.md](08_SECURITY_OPERATIONS_COST.md) - bảo mật, log, alarm, backup, chi phí.
9. [09_TEST_AND_ACCEPTANCE.md](09_TEST_AND_ACCEPTANCE.md) - test matrix và evidence cần lưu.
10. [10_IMPROVEMENT_BACKLOG.md](10_IMPROVEMENT_BACKLOG.md) - backlog ưu tiên, owner gợi ý, definition of done.
11. [11_AGENT_HANDOFF.md](11_AGENT_HANDOFF.md) - quy tắc dành cho agent tiếp theo.

## Quy ước trạng thái

- `AS-IS`: đã quan sát thấy trong mã nguồn hiện tại.
- `TARGET`: kiến trúc/behavior phải đạt cho lần deploy AWS.
- `BLOCKER`: có khả năng làm deploy hoặc demo thất bại; phải xử lý trước deploy.
- `RISK`: chưa chắc gây lỗi ngay nhưng cần quyết định, test hoặc giám sát.
- `FUTURE`: không thuộc MVP hiện tại.

## Nguồn tài liệu AWS chính thức

Các quyết định nhạy với thời gian đã được đối chiếu ngày 2026-07-14:

- [AWS Lambda runtimes](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
- [Lambda environment variables và reserved keys](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html)
- [API Gateway HTTP API và CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html)
- [DynamoDB provisioned capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html)
- [S3 website endpoints](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteEndpoints.html)
- [S3 pre-signed URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html)
- [Amazon Translate automatic language detection](https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html)

## Quan hệ với tài liệu ở root

- `AWS_DEPLOYMENT.md` và `AWS_E2E_TEST_GUIDE.md` là tài liệu cũ hữu ích nhưng có chi tiết đã lệch với code/thời điểm hiện tại, đặc biệt Node.js 20 và IAM cho Translate `auto`.
- `multiplayerplan.md` là product plan dài hạn. Realtime multiplayer không thuộc AWS MVP trong bộ docs này.
- `LOG.md` là lịch sử thay đổi theo yêu cầu của project; mọi agent triển khai phải tiếp tục cập nhật file đó.
