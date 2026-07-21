# CI/CD và tự động hóa deploy AWS

Snapshot: 2026-07-20.

## 1. CI/CD là gì?

`CI` (Continuous Integration) là quá trình tự động kiểm tra mỗi thay đổi code.
Trong project này, CI trả lời các câu hỏi:

- JavaScript có lỗi cú pháp không?
- Dependencies production có lỗ hổng mức high/critical không?
- Gói ZIP Lambda có tạo được không?
- `infra/template.yaml` có hợp lệ và build được bằng AWS SAM không?

`CD` thường có hai nghĩa:

- Continuous Delivery: sau khi CI pass, bản build luôn ở trạng thái có thể deploy,
  nhưng con người vẫn bấm nút phê duyệt.
- Continuous Deployment: sau khi CI pass, hệ thống tự deploy thẳng lên production.

Project này dùng Continuous Delivery trước: CI tự chạy, còn AWS deploy được kích
hoạt thủ công và có thể bảo vệ bằng GitHub Environment approval. Đây là mức an
toàn phù hợp cho project sinh viên và tài khoản AWS có tính phí.

## 2. Pipeline hiện có

### `.github/workflows/ci.yml`

Trigger:

```text
push lên main hoặc test-aws
mọi pull request
```

Các bước:

```text
npm ci
npm run check
npm audit --omit=dev --audit-level=high
npm run package
sam validate --lint
sam build
```

Pipeline này không cần AWS credentials và không tạo tài nguyên.

### `.github/workflows/deploy-aws.yml`

Trigger:

```text
GitHub Actions -> Deploy AWS -> Run workflow
```

Các bước:

```text
GitHub OIDC -> assume IAM role tạm thời
install + syntax check
SAM validate/build/deploy
đọc ApiUrl từ CloudFormation output
tạo Study/Game static bundle theo URL thật
sync bundle lên S3 website bucket
ghi deployment summary
```

Chrome extension không tự publish. Sau mỗi lần API/site URL thay đổi, vẫn cần cập
nhật `extension-config.js`, reload unpacked extension hoặc thực hiện quy trình phát
hành Chrome Web Store riêng.

## 3. Vì sao dùng OIDC?

OIDC cho phép GitHub nhận AWS credentials tạm thời bằng cách assume một IAM role.
Không cần lưu `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` dài hạn trong GitHub.

Trust policy phải giới hạn đúng repository và environment/branch. Không dùng
wildcard cho mọi repository.

## 4. Cấu hình GitHub Environment

Trong repository GitHub:

```text
Settings -> Environments -> New environment -> production
```

Khuyến nghị bật required reviewer để mỗi lần deploy cần xác nhận.

Thêm secrets:

```text
AWS_ROLE_ARN = ARN của IAM role dành riêng cho GitHub Actions
JWT_SECRET = chuỗi ngẫu nhiên mạnh và ổn định
```

Thêm variables:

```text
AWS_REGION = ap-southeast-1
AWS_STACK_NAME = chrome-flashcard-demo
ALLOWED_ORIGINS = chrome-extension://EXTENSION_ID,http://SITE_BUCKET_WEBSITE_URL
STUDY_BUCKET = tên bucket public host Study/Game
SITE_BASE_URL = http://SITE_BUCKET.s3-website-ap-southeast-1.amazonaws.com
```

Không thêm dấu `/` cuối `SITE_BASE_URL` hoặc các origin trong `ALLOWED_ORIGINS`.

Nếu trình duyệt bắt buộc HTTPS và workflow deploy qua S3 REST object endpoint,
thêm:

```text
SITE_BASE_URL = https://SITE_BUCKET.s3.ap-southeast-1.amazonaws.com
STUDY_URL = https://SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/study/index.html
GAME_URL = https://SITE_BUCKET.s3.ap-southeast-1.amazonaws.com/game/index.html
```

Hai biến URL đầy đủ giúp Study/Game điều hướng đúng vì S3 REST endpoint không tự
resolve `/study/` hoặc `/game/` thành `index.html`.

## 5. IAM cho GitHub Actions

Tạo GitHub OIDC identity provider trong AWS IAM với:

```text
Provider URL: https://token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

Tạo role chỉ tin cậy repository này và GitHub environment `production`. Role triển
khai cần quyền cho CloudFormation/SAM quản lý Lambda, API Gateway, DynamoDB, IAM
role của Lambda và S3 artifact. Bucket website cần thêm quyền list/put/delete object.

Không gắn `AdministratorAccess` lâu dài. Sau lần deploy đầu, dùng CloudTrail hoặc
IAM Access Analyzer để thu hẹp policy theo các action thực tế.

## 6. Luồng làm việc đề xuất

```text
feature branch
  -> push
  -> CI pass
  -> pull request/review
  -> merge main
  -> CI pass trên main
  -> Run workflow Deploy AWS
  -> production approval
  -> SAM deploy + S3 sync
  -> E2E smoke test
```

Khi pipeline đã ổn định, có thể đổi trigger deploy từ `workflow_dispatch` sang
`push` trên `main`, nhưng vẫn nên giữ GitHub Environment approval.

## 7. Rollback và cleanup

Backend được quản lý bằng CloudFormation stack. Nếu deploy lỗi, SAM/CloudFormation
rollback stack về trạng thái trước đó. Nếu static S3 sync làm sai giao diện, cần
deploy lại commit trước; muốn rollback đáng tin cậy hơn nên bật S3 Versioning.

Trước khi xóa stack, làm rỗng export bucket. Bucket website nằm ngoài template nên
phải cleanup riêng.

## 8. Phạm vi chưa tự động hóa

- Tạo IAM OIDC provider và deployment role lần đầu.
- Tạo/configure public S3 website bucket lần đầu.
- Tạo Chrome extension ID và phát hành Chrome Web Store.
- AWS realtime multiplayer; prototype hiện tại dùng WebSocket in-memory local.
- E2E browser test đầy đủ; hiện pipeline mới kiểm syntax/build/infrastructure.

## 9. Tài liệu chính thức

- AWS SAM CI/CD:
  https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-deploying.html
- GitHub Actions với AWS SAM:
  https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/deploying-using-github.html
- AWS IAM role cho GitHub OIDC:
  https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-idp_oidc.html
- GitHub OIDC cho AWS:
  https://docs.github.com/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws
