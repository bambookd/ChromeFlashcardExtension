# Hướng dẫn deploy AWS

Tài liệu này hướng dẫn deploy backend ChromeFlashcardExtension lên AWS Lambda +
API Gateway + DynamoDB, host trang Study/Game từ S3, và giữ file export riêng tư
trong một bucket S3 tách biệt.

## Chọn phần nào để đọc

Stack `chrome-flashcard-dev` **đã được deploy** ở `ap-southeast-1`. Vì vậy:

| Tình huống | Đọc phần |
|---|---|
| Cập nhật code/config lên stack đang chạy | **Phần A - Redeploy** |
| Dựng lại toàn bộ từ đầu, hoặc tạo môi trường mới | **Phần B - Deploy lần đầu** |
| Deploy hỏng, cần tra lỗi | **Phần C - Xử lý sự cố** |

Đa số lần dùng về sau là Phần A. Phần B chỉ cần khi stack bị xóa hoặc bạn dựng
môi trường thứ hai.

## Nếu bạn nhận repo này từ người khác

Đọc mục này trước. Bạn cần **Phần B**, không phải Phần A.

Phần A viết cho stack đã tồn tại và hardcode giá trị của môi trường gốc
(`chrome-flashcard-dev`, `YOUR_API_ID`, profile `flashcard-dev`). Chạy Phần A
trên máy bạn sẽ không có tác dụng gì, hoặc tệ hơn là trỏ vào AWS của người khác.

Ba thứ **bắt buộc** phải đổi sang của bạn, nếu không extension sẽ gọi vào stack
của người gửi:

```text
extension-config.js       API_BASE_URL và STUDY_URL   (B-SAM bước 7)
AllowedOrigins            Extension ID của máy bạn    (B-SAM bước 6)
Tên bucket static site    duy nhất toàn cầu           (B-SAM bước 5)
```

Mọi giá trị trong mục ngay dưới đây là của môi trường gốc, chép vào để tham
khảo định dạng - **không phải** giá trị bạn dùng.

## Thông tin môi trường gốc (tham khảo định dạng)

```text
Region:          ap-southeast-1
Stack:           chrome-flashcard-dev
API:             https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com
Static site:     YOUR_SITE_BUCKET
Export bucket:   YOUR_EXPORT_BUCKET
Extension ID:    YOUR_EXTENSION_ID
```

Các giá trị này không phải bí mật (không có access key, account ID hay JWT
secret). Xem thêm `DEPLOY_READINESS.md` và `AWS_USAGE_CHECKLIST.md`.

## Chuẩn bị chung

Cần có trước khi bắt đầu bất kỳ phần nào:

```text
Node.js 24
AWS CLI đã đăng nhập (aws sts get-caller-identity chạy được)
AWS SAM CLI (chỉ cần cho deploy bằng SAM)
```

Kiểm tra nhanh danh tính và stack trước khi làm gì:

```powershell
aws sts get-caller-identity
aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text
```

Kết quả mong đợi ở lệnh thứ hai là `CREATE_COMPLETE` hoặc `UPDATE_COMPLETE`.
Nếu ra `UPDATE_ROLLBACK_COMPLETE` hay `*_IN_PROGRESS`, dừng lại và xem Phần C.

---

# Phần A - Redeploy stack đang chạy

Dùng khi bạn đã sửa code backend hoặc `infra/template.yaml` và muốn đưa lên
stack `chrome-flashcard-dev` hiện có.

## Bước A1 - Kiểm tra local trước

Luôn chạy bước này trước. Nó bắt lỗi cú pháp rẻ hơn nhiều so với để deploy fail.

```powershell
cd backend
npm ci
npm run check
```

`npm run check` chạy `node --check` trên toàn bộ file backend, extension và
static app. Phải pass sạch mới đi tiếp.

Muốn thử tay trước khi deploy:

```powershell
npm run dev
```

Rồi mở `http://localhost:3000/api/health` và `http://localhost:3000/study`.
Local mặc định dùng `DATA_STORE=local`, lưu dữ liệu giả ở `backend/data/`, nên
không đụng gì tới AWS.

> **Lưu ý:** local chạy được **không** chứng minh CORS đúng. Ở chế độ local,
> `allowAllOrigins` tự bật, nên lỗi origin chỉ lộ ra khi lên AWS.

## Bước A2 - Dọn artifact cũ

Nếu còn `backend/dist/` từ lần build trước, xóa đi để nó không bị copy nhầm vào
gói SAM:

```powershell
Remove-Item -Recurse -Force backend\dist -ErrorAction SilentlyContinue
```

## Bước A3 - Build

```powershell
cd infra
sam validate --lint
sam build
```

`sam validate --lint` bắt lỗi template trước khi đụng tới AWS. Nếu bước này fail
thì không có gì được gửi lên cloud.

## Bước A4 - Deploy

Đây là bước duy nhất thực sự thay đổi AWS. Đọc kỹ mục cảnh báo JWT bên dưới
trước khi chạy.

Viết mỗi lệnh trên **một dòng**. Dấu backtick nối dòng của PowerShell rất hay
đứt khi copy-paste, và triệu chứng thường là lỗi khó hiểu ở lệnh kế tiếp
(`URL rejected`, `Port number was not a decimal number`...).

Trước hết lấy lại hai tham số đang chạy - xem mục `JwtSecret` bên dưới:

```powershell
$fn = aws cloudformation describe-stack-resources --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" --output text --profile flashcard-dev
```

```powershell
$jwt = aws lambda get-function-configuration --function-name $fn --region ap-southeast-1 --profile flashcard-dev --query "Environment.Variables.JWT_SECRET" --output text; $jwt.Length
```

```powershell
$origins = aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "Stacks[0].Parameters[?ParameterKey=='AllowedOrigins'].ParameterValue" --output text --profile flashcard-dev; $origins
```

`$jwt.Length` phải ra số dương. Ra `0` thì dừng, đừng deploy.

Rồi deploy:

```powershell
sam deploy --stack-name chrome-flashcard-dev --region ap-southeast-1 --resolve-s3 --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset --confirm-changeset --profile flashcard-dev --parameter-overrides JwtSecret="$jwt" AllowedOrigins="$origins"
```

> ### `--confirm-changeset` là bắt buộc nếu muốn xem trước
>
> Mặc định của SAM là **không hỏi** (`Confirm changeset : False`). Bỏ cờ
> `--no-confirm-changeset` ra là **chưa đủ** - phải truyền `--confirm-changeset`
> một cách tường minh thì SAM mới dừng lại cho bạn đọc changeset rồi gõ `y`.
>
> Đã kiểm chứng ngày 2026-07-21 với SAM CLI 1.163.0.

> ### `--profile` cũng bắt buộc nếu dùng named profile
>
> Thiếu nó, SAM đi tìm credential mặc định và fail với `Unable to locate
> credentials` - kể cả khi mọi lệnh `aws` khác của bạn đều đang chạy tốt nhờ
> `--profile`. Lỗi xảy ra trước khi có bất kỳ thay đổi nào trên AWS.

Khi changeset hiện ra, đối chiếu:

| Thấy gì | Làm gì |
|---|---|
| `Modify`, `Replacement: False` trên Lambda/Role/API | gõ `y` |
| `Delete` hoặc `Replace` trên bảng DynamoDB hay `ExportBucket` | gõ `N`, điều tra trước |

> ### Cảnh báo về `JwtSecret`
>
> **Không sinh secret mới** trừ khi bạn cố ý muốn vậy. Đổi secret sẽ làm mọi JWT
> đã phát vô hiệu, tức là toàn bộ người dùng bị đăng xuất ngay lập tức.
>
> `JwtSecret` khai báo `NoEcho: true` nên **CloudFormation không trả lại giá
> trị**. Nhưng template truyền tham số này vào biến môi trường `JWT_SECRET` của
> Lambda, và biến môi trường Lambda thì đọc lại được - đó là lý do lệnh
> `aws lambda get-function-configuration` ở trên lấy được secret đang chạy mà
> không cần ai nhớ nó.
>
> Đã dùng thành công ngày 2026-07-21: redeploy giữ nguyên secret, không có
> phiên đăng nhập nào bị mất.
>
> Hệ quả bảo mật cần biết: bất kỳ ai có quyền `lambda:GetFunctionConfiguration`
> đều đọc được JWT secret. Với demo thì chấp nhận được; nếu siết thật thì phải
> chuyển secret sang Secrets Manager hoặc SSM Parameter Store loại `SecureString`.
>
> Giữ secret trong biến PowerShell, đừng in ra màn hình. PowerShell chỉ lưu chữ
> `$jwt` vào history chứ không lưu giá trị. Đừng đóng cửa sổ giữa chừng - biến
> chỉ sống trong session hiện tại.
>
> `sam deploy --parameter-overrides` dùng cú pháp `Key=Value` và không hỗ trợ
> `UsePreviousValue=true` như `aws cloudformation update-stack`, nên cách lấy
> lại từ Lambda ở trên là lối thực dụng nhất.

`AllowedOrigins` cũng phải truyền lại đúng giá trị đang dùng, vì tham số này có
`Default` là `http://localhost:3000`. Bỏ trống đồng nghĩa với việc vô tình thu
hẹp CORS về chỉ localhost và làm hỏng extension lẫn trang Study.

Lấy giá trị `AllowedOrigins` đang chạy (tham số này không phải `NoEcho` nên đọc
lại được):

```powershell
aws cloudformation describe-stacks `
  --stack-name chrome-flashcard-dev `
  --region ap-southeast-1 `
  --query "Stacks[0].Parameters[?ParameterKey=='AllowedOrigins'].ParameterValue" `
  --output text
```

## Bước A4b - Deploy qua GitHub Actions (khuyến nghị)

Lối này tránh hoàn toàn việc cầm secret trên máy cá nhân.

1. Vào tab **Actions** của repo, chọn workflow **Deploy AWS**.
2. Bấm **Run workflow**.
3. Chọn `deploy_static_site`: bật nếu có sửa `backend/public/`, tắt nếu chỉ sửa
   code backend.

Workflow dùng OIDC với credential ngắn hạn, tự chạy `npm run check`,
`sam validate --lint`, `sam build`, rồi deploy và in API URL ra summary. Không có
access key nào được lưu trong repo.

Cần cấu hình GitHub Environment `production` trước lần chạy đầu - xem
`docs/12_CI_CD_GUIDE.md`.

## Bước A5 - Xác minh sau deploy

```powershell
aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "Stacks[0].StackStatus" --output text
curl https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/api/health
```

Mong đợi `UPDATE_COMPLETE` và:

```json
{ "ok": true, "service": "flashcard-backend" }
```

Nếu lần deploy này có đổi IAM policy, kiểm tra lại quyền thực tế của role bằng
lệnh chỉ đọc:

```powershell
$role = aws cloudformation describe-stack-resources --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "StackResources[?ResourceType=='AWS::IAM::Role'].PhysicalResourceId" --output text
aws iam list-role-policies --role-name $role
aws iam get-role-policy --role-name $role --policy-name <tên policy từ lệnh trên>
```

## Bước A6 - Static site (chỉ khi cần)

**Bỏ qua bước này nếu bạn chỉ sửa code backend.** Bundle Study/Game nằm trên S3
độc lập với Lambda, không bị ảnh hưởng bởi deploy stack.

Chỉ chạy khi có sửa trong `backend/public/`:

```powershell
$env:API_BASE_URL = "https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com"
$env:SITE_BASE_URL = "https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com"
$env:STUDY_URL = "$env:SITE_BASE_URL/study/index.html"
$env:GAME_URL = "$env:SITE_BASE_URL/game/index.html"
cd backend
npm run prepare:static
aws s3 sync .\dist\static-site "s3://YOUR_SITE_BUCKET/" --delete
```

Script này sinh file cấu hình theo môi trường, nên **không cần sửa tay**
`config.js` trong source.

Giữ `index.html` trong URL: đây là S3 REST endpoint, không có định tuyến index
theo thư mục như website endpoint.

Script cố ý để `REALTIME_URL` rỗng vì prototype WebSocket in-memory chỉ chạy qua
`backend/server.js`, không thuộc bản deploy Lambda.

## Bước A7 - Reload extension

Nếu có sửa file extension (`popup.*`, `contentScript.js`, `background.js`,
`manifest.json`, `extension-config.js`):

1. Mở `chrome://extensions`.
2. Bấm **Reload** trên extension đã load unpacked.
3. Mở lại popup và thử một thao tác thật.

Bước này thủ công và không có cách tự động hóa trong phạm vi project.

## Bước A8 - Kiểm tra lại bằng tay

Sau redeploy, tối thiểu chạy lại:

```text
1. Đăng nhập từ popup extension.
2. Lưu một card và sync.
3. Mở Study, refresh, xác nhận card xuất hiện.
```

Checklist đầy đủ nằm ở cuối tài liệu.

---

# Phần B - Deploy lần đầu từ đầu

Chỉ dùng khi chưa có stack nào, hoặc bạn dựng môi trường mới hoàn toàn.

Có hai lối: **B-SAM** (nhanh, khuyến nghị) và **B-Console** (tạo tay từng
resource, hữu ích khi cần hiểu rõ hoặc khi bài tập yêu cầu thao tác console).

## Lối B-SAM - Dùng SAM template

`infra/template.yaml` tạo sẵn Lambda, HTTP API, 3 bảng DynamoDB, export bucket
và IAM role.

### B-SAM bước 1 - Sinh JWT secret

Đây là lần duy nhất bạn nên sinh secret mới. Lưu lại ở nơi an toàn (password
manager hoặc GitHub Secrets), **không commit vào repo**.

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### B-SAM bước 2 - Build

```powershell
cd backend
npm ci
npm run check
cd ..\infra
sam validate --lint
sam build
```

### B-SAM bước 3 - Deploy có hướng dẫn

```powershell
sam deploy --guided
```

SAM sẽ hỏi từng tham số. Trả lời:

```text
Stack Name:            chrome-flashcard-dev
AWS Region:            ap-southeast-1
JwtSecret:             <secret vừa sinh>
AllowedOrigins:        http://localhost:3000
Confirm changeset:     y
Allow SAM CLI IAM role creation:  y
```

Để `AllowedOrigins` tạm là localhost, sẽ cập nhật ở bước 5 sau khi biết URL thật.

### B-SAM bước 4 - Lấy output

```powershell
aws cloudformation describe-stacks --stack-name chrome-flashcard-dev --region ap-southeast-1 --query "Stacks[0].Outputs" --output table
```

Ghi lại `ApiUrl` và `ExportBucketName`.

### B-SAM bước 5 - Tạo bucket static site

SAM template **không** tạo bucket website công khai. Phải tạo tay. Đặt biến cho
đỡ gõ lại (tên bucket phải duy nhất toàn cầu, nên thêm hậu tố riêng):

```powershell
$site = '<ten-bucket-duy-nhat-toan-cau>'; $region = 'ap-southeast-1'; $profile = '<ten-profile-cua-ban>'
```

```powershell
aws s3api create-bucket --bucket $site --region $region --create-bucket-configuration LocationConstraint=$region --profile $profile
```

Cho phép bucket policy công khai, nhưng **vẫn chặn ACL công khai**:

```powershell
aws s3api put-public-access-block --bucket $site --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false" --profile $profile
```

Hai cờ đầu để `true` là có chủ đích: public chỉ được đến từ đúng một bucket
policy mà bạn viết ra và đọc được, không đến từ ACL rải rác.

Rồi cấp quyền đọc công khai, giới hạn đúng hai thư mục:

```powershell
@"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadStudyAndGame",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::$site/study/*",
        "arn:aws:s3:::$site/game/*"
      ]
    }
  ]
}
"@ | Set-Content -Path "$env:TEMP\site-policy.json" -Encoding utf8
```

```powershell
aws s3api put-bucket-policy --bucket $site --policy "file://$env:TEMP\site-policy.json" --profile $profile
```

Chỉ cấp `s3:GetObject`, **không** cấp `s3:ListBucket` - người ngoài không liệt
kê được nội dung bucket. Hệ quả phụ: object không tồn tại sẽ trả `403` thay vì
`404`, đó là hành vi đúng chứ không phải lỗi.

Đây là bucket **duy nhất** được phép công khai. Export bucket phải luôn giữ đủ
bốn cờ Block Public Access.

### B-SAM bước 6 - Lấy Extension ID và cập nhật CORS

**Bước này bắt buộc, và ID khác nhau trên từng máy.**

1. Mở `chrome://extensions`, bật **Developer mode**.
2. **Load unpacked** trỏ vào thư mục project.
3. Chép chuỗi `ID` hiện dưới tên extension, dạng 32 chữ cái thường.

ID của bản load unpacked khác ID của bản publish lên Chrome Web Store, và khác
nhau giữa các máy. Mỗi người trong nhóm sẽ có ID riêng.

Rồi deploy lại stack với `AllowedOrigins` đầy đủ - thiếu ID này thì popup sẽ
chết vì CORS ngay khi bấm Sync:

```text
http://localhost:3000,chrome-extension://<EXTENSION_ID>,https://<SITE_BUCKET>.s3.<REGION>.amazonaws.com
```

Nếu nhiều người cùng dùng chung một stack, nối tất cả ID vào cùng chuỗi, phân
tách bằng dấu phẩy, không có khoảng trắng.

### B-SAM bước 7 - Sửa `extension-config.js`

**Đừng bỏ qua bước này.** File `extension-config.js` trong repo trỏ vào AWS của
người tạo ra bản gốc. Không sửa thì extension của bạn sẽ gọi vào stack của họ
chứ không phải của bạn - vừa sai mục đích test, vừa tiêu credit của người khác.

```js
globalThis.FLASHCARD_CONFIG = {
  API_BASE_URL: "https://<API_ID>.execute-api.<REGION>.amazonaws.com",
  STUDY_URL: "https://<SITE_BUCKET>.s3.<REGION>.amazonaws.com/study/index.html"
};
```

`API_BASE_URL` lấy từ output `ApiUrl` ở bước 4. Giữ `/study/index.html` ở cuối
`STUDY_URL`: REST endpoint không có định tuyến index theo thư mục.

Sau khi sửa, quay lại `chrome://extensions` bấm **Reload**.

### B-SAM bước 8 - Build và upload static

Làm theo Bước A6 ở Phần A, thay giá trị bằng của môi trường mới:

```powershell
$env:API_BASE_URL = "https://<API_ID>.execute-api.<REGION>.amazonaws.com"
$env:SITE_BASE_URL = "https://<SITE_BUCKET>.s3.<REGION>.amazonaws.com"
$env:STUDY_URL = "$env:SITE_BASE_URL/study/index.html"
$env:GAME_URL = "$env:SITE_BASE_URL/game/index.html"
cd backend
npm run prepare:static
aws s3 sync .\dist\static-site "s3://$site/" --delete --profile $profile
```

### B-SAM bước 9 - Kiểm tra

Chạy checklist test đầy đủ ở cuối tài liệu. Tối thiểu:

```powershell
curl.exe -s "https://<API_ID>.execute-api.<REGION>.amazonaws.com/api/health"
curl.exe -I "https://<SITE_BUCKET>.s3.<REGION>.amazonaws.com/study/index.html"
```

Rồi mở Study trên trình duyệt, đăng ký một tài khoản test và thử đăng nhập.

> **Không dùng `student/password123` hay `teacher/password123`.** Đó là sample
> credential nằm công khai trong `backend/data/`. Dùng chúng trên một AWS công
> khai nghĩa là ai đọc source cũng đăng nhập được. Xem SR-06 trong
> `docs/02_REQUIREMENTS.md`.

## Lối B-Console - Tạo tay từng resource

Dùng khi cần thao tác console thủ công. Runbook chi tiết theo từng màn hình nằm
ở `docs/07_MANUAL_DEPLOYMENT_RUNBOOK.md`; phần dưới là bản tóm tắt.

Dùng cùng một region cho Lambda, DynamoDB và S3 để đơn giản hóa. Tên bucket S3
phải duy nhất toàn cầu.

### B-Console bước 1 - Ba bảng DynamoDB

Tạo với provisioned capacity `1 RCU / 1 WCU` cho mức dùng demo.

| Bảng | Partition key | Sort key |
|---|---|---|
| `FlashcardUsers` | `username` (string) | - |
| `FlashcardCards` | `userId` (string) | `cardId` (string) |
| `FlashcardCategories` | `userId` (string) | `categoryName` (string) |

Bảng Users lưu: `userId, username, passwordHash, role, createdAt, updatedAt`.

App query flashcard theo user ID lấy từ JWT, không scan toàn bảng. Xóa một
category sẽ chuyển các card liên quan về `Uncategorized`.

### B-Console bước 2 - Export bucket riêng tư

Tạo bucket S3 và **chặn toàn bộ public access**. Lambda upload file JSON export
rồi trả về pre-signed URL có hạn.

### B-Console bước 3 - IAM role cho Lambda

Policy tối thiểu:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": [
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardUsers",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardCards",
        "arn:aws:dynamodb:REGION:ACCOUNT_ID:table/FlashcardCategories"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_EXPORT_BUCKET/*"
    }
  ]
}
```

Không dùng `s3:*`, `dynamodb:*` hay long-lived access key.

### B-Console bước 4 - Lambda function

```text
Runtime:  Node.js 24.x
Handler:  lambda.handler
Timeout:  15s
Memory:   256 MB
```

Build gói ZIP sạch:

```powershell
cd backend
npm ci --omit=dev
npm run package
```

Upload `backend/dist/flashcard-backend.zip`. Script đóng gói tự loại `server.js`
(chỉ dùng local), static assets, file JSON dữ liệu và artifact build cũ. Nó cũng
ghi đường dẫn ZIP kiểu Linux (dấu `/`) khi chạy trên Windows.

Biến môi trường cần đặt:

```text
DATA_STORE=dynamodb
USERS_TABLE=FlashcardUsers
FLASHCARDS_TABLE=FlashcardCards
CATEGORIES_TABLE=FlashcardCategories
JWT_SECRET=<secret mạnh, ngẫu nhiên>
EXPORT_BUCKET=<tên export bucket riêng tư>
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://EXTENSION_ID,https://YOUR_SITE_BUCKET.s3.ap-southeast-1.amazonaws.com
SERVE_STUDY_STATIC=false
```

> **Không tự đặt `AWS_REGION`.** Đây là biến môi trường dành riêng do runtime
> tiêm vào; đặt tay sẽ làm Lambda từ chối cấu hình. Code vẫn đọc được biến này
> bình thường.

`ALLOWED_ORIGINS` phải chứa cả URL trang S3 lẫn origin của Chrome extension.
ID của extension bản unpacked và bản publish là khác nhau.

### B-Console bước 5 - API Gateway HTTP API

Tạo HTTP API, nối toàn bộ route về Lambda:

```text
ANY /{proxy+}
```

Bật CORS cho header `Content-Type` và `Authorization`. Danh sách origin phải
khớp `ALLOWED_ORIGINS`. **Không dùng `*`.**

Test:

```text
GET https://YOUR_API_ID.execute-api.REGION.amazonaws.com/api/health
```

### B-Console bước 6 - Static site và extension

Làm theo Bước A6 và A7.

---

# Phần C - Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Stack ở `UPDATE_ROLLBACK_COMPLETE` | Lần deploy trước fail và đã rollback | Xem tab Events trên CloudFormation, sửa nguyên nhân rồi deploy lại. Stack vẫn dùng được. |
| Stack kẹt `*_IN_PROGRESS` | Deploy khác đang chạy | Chờ xong. Không chạy deploy song song. |
| `403 Origin is not allowed by CORS` | `AllowedOrigins` thiếu origin, hoặc bị reset về default | Deploy lại với danh sách đầy đủ. **Không** sửa thành `*`. |
| Toàn bộ user bị đăng xuất sau deploy | `JwtSecret` đã bị đổi | Deploy lại đúng secret cũ nếu còn giữ. Nếu mất, user phải đăng nhập lại. |
| `500 EXPORT_BUCKET is required` | Thiếu biến môi trường | Kiểm tra cấu hình Lambda. |
| Trang Study gọi localhost | Static bundle cũ | Chạy lại Bước A6. |
| Lambda lỗi import | ZIP có `server.js` hoặc thiếu dependency | Build lại bằng `npm run package`, không đóng gói tay. |
| `sam build` gộp nhầm file lạ | Còn `backend/dist/` cũ | Xóa thư mục đó rồi build lại (Bước A2). |

Xem log Lambda:

```powershell
aws logs tail /aws/lambda/<tên function> --region ap-southeast-1 --since 10m
```

## Điều tuyệt đối không làm

- Đặt CORS thành `*` để chữa lỗi origin.
- Mở public cho export bucket để chữa lỗi download.
- Ghi access key vào `extension-config.js`, biến môi trường Lambda hay repo.
- Deploy thư mục `ChromeFlashCardExtension-test-aws-clean/` (bản sao thử
  nghiệm, không phải source of truth).
- Coi "local chạy được" là bằng chứng CORS/quyền đã đúng.

---

# Checklist test đầy đủ

```text
 1. Đăng ký user mới qua popup extension hoặc trang Study.
 2. Đăng nhập, xác nhận /api/me hoạt động.
 3. Bôi đen một từ trên trang web bất kỳ.
 4. Chuột phải, thêm thành flashcard.
 5. Nhập nghĩa bằng tay và lưu local.
 6. Sync lên cloud.
 7. Mở trang Study.
 8. Xác nhận flashcard tải từ DynamoDB.
 9. Thêm, sửa, xóa category.
10. Bắt đầu study session và chấm điểm card.
11. Export và xác nhận pre-signed URL tải được JSON.
12. Xác nhận raw URL của object export trả 403.
```

Bước 5 nhập nghĩa bằng tay: tính năng Amazon Translate đã được gỡ khỏi project
ngày 2026-07-21 vì account không được cấp dịch vụ này.

# Chi phí và dọn dẹp

Các dịch vụ có thể phát sinh chi phí:

```text
Lambda invocations
API Gateway requests
DynamoDB provisioned capacity (tính tiền cả khi idle)
S3 storage và requests
```

Biện pháp kiểm soát đã áp dụng:

- HTTP API giới hạn 2 request/giây, burst 5.
- Object trong export bucket tự hết hạn sau 7 ngày.
- CloudWatch log retention 7 ngày.
- AWS Budgets cảnh báo ở mức 1 USD và 5 USD.

> Các mức trên là **cảnh báo, không phải trần chi tiêu cứng.** Giữ AWS Budgets
> bật và kiểm tra định kỳ.

Giữ DynamoDB capacity ở mức thấp và xóa dữ liệu test khi demo kết thúc. Nếu
không dùng nữa, xóa cả stack và site bucket:

```powershell
aws cloudformation delete-stack --stack-name chrome-flashcard-dev --region ap-southeast-1
```

Bucket S3 phải rỗng trước khi CloudFormation xóa được. Bucket static site tạo
tay không thuộc stack nên phải xóa riêng.

# Tài liệu liên quan

```text
DEPLOY_READINESS.md                    trạng thái deploy thật và việc còn lại
AWS_USAGE_CHECKLIST.md                 dịch vụ nào đã thật sự được gọi + link console
docs/07_MANUAL_DEPLOYMENT_RUNBOOK.md   runbook console chi tiết từng màn hình
docs/12_CI_CD_GUIDE.md                 GitHub Environment, OIDC, secrets và vars
docs/09_TEST_AND_ACCEPTANCE.md         test matrix và evidence cần lưu
LOG.md                                 lịch sử thay đổi
```
