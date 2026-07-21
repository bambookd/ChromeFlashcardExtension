# AWS Deploy Readiness

Snapshot: 2026-07-20. Source of truth: repository root
`ChromeFlashCardExtension`.

## Kết luận

REST backend và static Study/Game đã được deploy thủ công thành công lên AWS
`ap-southeast-1`. API health, HTTPS static objects và CORS preflight đều đã pass.
Chrome extension đã được cấu hình trong source nhưng người dùng vẫn phải reload
extension và chạy functional E2E trước khi coi bản demo đã nghiệm thu.

Realtime multiplayer không thuộc AWS MVP hiện tại. Solo Game, Study, extension,
REST APIs, DynamoDB và private S3 export nằm trong phạm vi deploy. Translate đã
được chủ động loại khỏi sản phẩm vì account hiện tại không có quyền dịch vụ này.

## Blocker đã xử lý

- Lambda runtime chuyển từ `nodejs20.x` sang `nodejs24.x`.
- Không còn cấu hình reserved Lambda variable `AWS_REGION`.
- Lambda đặt `SERVE_STUDY_STATIC=false`; Study/Game được host từ S3.
- Gói ZIP Lambda được tạo sạch bằng `npm run package`.
- Static Study/Game bundle được cấu hình theo môi trường bằng
  `npm run prepare:static`.
- `REALTIME_URL=""` thực sự tắt realtime trên AWS; không còn fallback ngầm về
  WebSocket cùng origin.
- CI kiểm tra JavaScript, dependency audit, packaging và SAM build.
- Workflow deploy dùng GitHub OIDC và manual production gate.

## Trạng thái deploy thật

- Stack: `chrome-flashcard-dev`, trạng thái `UPDATE_COMPLETE`.
- API:
  `https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com`.
- Study:
  `https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/study/index.html`.
- Game:
  `https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/game/index.html`.
- Chrome extension origin:
  `chrome-extension://YOUR_EXTENSION_ID`.
- Private export bucket:
  `YOUR_EXPORT_BUCKET`.
- CORS cho phép localhost, extension origin, HTTP website origin và HTTPS S3
  REST origin.
- API Gateway throttle: 2 requests/second, burst 5.
- Private export objects hết hạn sau 7 ngày; incomplete multipart upload được
  dọn sau 1 ngày.
- Lambda CloudWatch log retention: 7 ngày.
- AWS Budgets hiện có cảnh báo tháng ở mức 1 USD và 5 USD.

Không có access key, secret access key hoặc JWT secret nào được ghi vào repo.
Throttle/lifecycle đã được áp dụng trực tiếp lên live resources và source
`infra/template.yaml` đã được cập nhật tương ứng. Lần SAM deploy tiếp theo sẽ
đưa hai thiết lập này về quản lý đầy đủ bởi CloudFormation; trước thời điểm đó
drift detection có thể báo khác biệt với template đang lưu trong stack.

## Việc còn lại để nghiệm thu demo

1. Vào `chrome://extensions`, reload unpacked extension.
2. Mở Study HTTPS, tạo một account test mới bằng mật khẩu riêng cho demo.
   Không seed `student/password123` hoặc `teacher/password123` lên public AWS.
3. Chạy E2E theo từng bước: login, create category, save/sync một card,
   study, game và một export.
4. Xác nhận item count trong DynamoDB và export object bằng lệnh read-only.
5. Xóa dữ liệu test hoặc cả stack/site bucket khi kết thúc demo nếu không còn
   sử dụng.

## Phần còn thiếu nhưng không chặn demo thủ công

- SAM template chưa tạo public static website bucket.
- Chưa có CloudFront/custom domain; HTTPS hiện dùng direct S3 REST object URL
  và cần `index.html` trong URL.
- Chưa tự publish Chrome extension.
- Chưa có automated browser E2E test.
- Chưa có CloudWatch alarms.
- Chưa có DynamoDB pagination/backup và sync deletion conflict strategy.
- AWS realtime multiplayer cần kiến trúc riêng:
  API Gateway WebSocket API + Lambda handlers + DynamoDB Rooms/Connections.

## Tự động hóa

- `.github/workflows/ci.yml`: tự chạy khi push/PR.
- `.github/workflows/deploy-aws.yml`: deploy có kiểm soát qua nút Run workflow.
- `docs/12_CI_CD_GUIDE.md`: hướng dẫn GitHub Environment, OIDC, secrets và vars.

Chỉ chuyển deploy trigger sang tự động khi manual deploy và E2E đã pass ổn định.
