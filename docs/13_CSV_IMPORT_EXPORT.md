# 13. CSV Import/Export cho Study Library

Ngày: 2026-07-23. Trạng thái: đã triển khai, đã test local, **đã deploy lên S3**
(xem mục 12).

## 1. Vấn đề

Mọi flashcard đều phải tự gõ tay qua extension hoặc form trong Study web. Không
có cách nạp một bộ từ vựng có sẵn vào library.

## 2. Quyết định thiết kế

| Câu hỏi | Quyết định | Lý do |
|---|---|---|
| Đặt ở đâu | Tab Library của Study web | Đây là surface quản lý card; tránh giới hạn `chrome.storage.local` |
| Parse ở đâu | Trình duyệt | Backend không đổi một dòng, không phải redeploy stack |
| Ghi bằng gì | `POST /api/sync` sẵn có | Endpoint bulk write duy nhất; xem ghi chú bên dưới |
| Từ trùng | Bỏ qua, giữ card cũ | Người dùng đã tự sửa nghĩa/category; ghi đè sẽ mất công đó |
| Export | Blob tải thẳng từ trình duyệt | Study đã có sẵn toàn bộ card trong RAM; không tốn Lambda/S3 |

**Không có thay đổi nào ở backend, `infra/template.yaml` hay IAM.** Deploy tính
năng này chỉ cần `aws s3 sync` lại bundle static.

### Tên `/api/sync` gây hiểu nhầm — import không phải là "sync"

Import từ Study web ghi **thẳng vào DynamoDB**, không có bước đồng bộ nào. Không
có dữ liệu nào nằm chờ ở trình duyệt, không có trạng thái "chưa sync". Đóng tab
xong mở lại là card đã ở đó.

Cái tên `sync` là di sản của luồng extension, nơi card sống trong
`chrome.storage.local` trước rồi mới đẩy lên cloud. Ở đây endpoint đó được dùng
thuần tuý vì nó là **chỗ duy nhất ghi được nhiều card trong một request**.

Vì sao không dùng `POST /api/flashcards`: endpoint đó ghi một card mỗi request.
Với API Gateway throttle 2 req/s, 60 từ sẽ mất khoảng 30 giây và gần như chắc
chắn dính 429. `/api/sync` gửi cả lô trong một request.

Muốn tên gọi đúng nghĩa thì phải thêm route mới kiểu `POST /api/flashcards/bulk`,
tức là sửa backend và redeploy Lambda. Chưa làm, vì lợi ích thuần tuý là đặt tên
cho đẹp còn cái giá là mất đi ưu điểm "không đụng vào AWS đang chạy".

## 3. Định dạng CSV

```text
word,meaning,wordform,category
resilient,kiên cường,adjective,IELTS
"give up","to quit, to stop trying",phrasal verb,IELTS
```

Quy tắc đọc:

- Dấu phân tách tự nhận: `,`, `;` hoặc Tab. Excel bản Việt hay xuất ra `;`.
- Mã hoá: UTF-8 (có hoặc không BOM). File UTF-16 của Excel "Unicode Text" cũng
  đọc được nhờ nhận diện BOM.
- Có header thì đọc theo tên cột, **thứ tự nào cũng được**, cột lạ bị bỏ qua.
  Cột nào không có tên trong header thì để trống — không tụt về vị trí mặc định.
- Không có header thì đọc theo thứ tự `word, meaning, wordform, category`.
- Trường bọc trong `"` được giữ nguyên dấu phẩy, xuống dòng và `""` thoát.
- Dòng trống bị bỏ qua nhưng số dòng báo lỗi vẫn khớp file gốc.
- Trần 1000 dòng mỗi lần import.

Quy tắc ghi (export):

- Luôn có BOM và kết dòng CRLF, để Excel mở tiếng Việt không vỡ font.
- Trường chứa dấu phân tách, `"`, xuống dòng hoặc khoảng trắng ở đầu/cuối thì
  được bọc trong `"`.
- Export rồi import lại cho ra đúng bộ card ban đầu (có test bảo vệ).

## 4. Ràng buộc bắt buộc phải biết

**`meaning` là bắt buộc.** `POST /api/sync` gọi `normalizeFlashcard` với
`allowEmptyMeaning: false`, nên **một dòng thiếu nghĩa làm hỏng cả batch** với
lỗi 400. Vì vậy `csv.js` phải bắt lỗi này ở client và loại dòng đó ra trước khi
gửi, chứ không thể gửi lên rồi để server tự bỏ qua.

`category` trống thì thành `Uncategorized`, và bị cắt còn 40 ký tự cho khớp
`normalizeCategoryName` ở client.

`wordform` khớp danh sách dropdown thì chuẩn hoá về chữ thường; giá trị lạ giữ
nguyên chứ không bị loại.

## 5. Chia lô và khả năng ghi

DynamoDB đang ở **1 WCU mỗi bảng**, API Gateway throttle **2 req/s burst 5**,
Lambda timeout **15 giây**.

Một lần import N từ mới tạo khoảng `2N` lượt ghi bảng Flashcards (mỗi card một
lần thử `update` rồi một lần `create`) cộng `N+1` lượt ghi bảng Categories —
vòng lặp category trong `backend/app.js` ghi một lần cho **mỗi card** chứ không
gộp theo category. Tức 60 từ ≈ 180 lượt ghi, sống được nhờ burst credit
(tối đa 300) chứ không phải nhờ capacity thường trực.

Cách xử lý ở client:

- Gửi theo lô **25 dòng**, tuần tự.
- Mỗi lô thử lại tối đa 2 lần khi gặp lỗi mạng hoặc 429/5xx, giãn 1.5s rồi 3s.
- `cardId` sinh **một lần cho mỗi file**, không sinh lại khi thử lại. Nhờ đó
  `/api/sync` upsert đúng bản ghi cũ thay vì tạo bản sao. Đã kiểm chứng: gửi
  cùng batch hai lần cho `created: 2` rồi `created: 0, updated: 2`.
- Hỏng giữa chừng thì đếm số đã lưu và cho bấm tiếp để chạy nốt phần còn lại.

### Nếu muốn bỏ hẳn rủi ro throttle

Chuyển ba bảng sang `BillingMode: PAY_PER_REQUEST`. Provisioned tính tiền theo
giờ dù không dùng; on-demand tính theo request thực tế, mà mức dùng của project
này gần như bằng không. Đây là thay đổi `infra/template.yaml` cần redeploy stack
nên **chưa làm**; ghi lại như lựa chọn có sẵn.

Một cải thiện nhỏ hơn: gộp category trước vòng lặp trong `backend/app.js` để cắt
khoảng một phần ba số lượt ghi. Cũng cần redeploy Lambda nên chưa làm.

## 6. Luồng người dùng

Import:

```text
Library -> Import CSV -> chọn file
  -> trình duyệt đọc và parse tại chỗ (file không rời khỏi máy)
  -> dialog preview: số dòng thêm / trùng bỏ qua / lỗi, kèm danh sách theo số dòng
  -> Add N cards
  -> gửi từng lô 25 qua /api/sync -> Lambda -> DynamoDB
  -> reload flashcards, về tab Library
```

Export:

```text
Library -> Export CSV
  -> lấy card đang có trong RAM, theo category đang lọc (trống = tất cả)
  -> Blob + <a download>
  -> flashcards-<user>-<category>-<ngày>.csv
```

Nút `Template` tải file mẫu hai dòng để biết đúng định dạng.

Vì export lấy từ bản đã tải lúc đăng nhập, nên bấm `Reload` trước nếu tab đã mở
lâu và dữ liệu có thể đã đổi ở nơi khác.

## 7. File thay đổi

```text
backend/public/study/csv.js        MỚI  parse/serialize/planImport, thuần logic
backend/tests/csv.test.mjs         MỚI  21 test chạy bằng node --test
backend/public/study/index.html         nút toolbar + dialog preview
backend/public/study/app.js             nối dây, chia lô, tải file
backend/public/study/styles.css         style dialog + .link-button
backend/package.json                    thêm csv.js vào check, thêm script test
docs/sample-flashcards.csv         MỚI  file test có sẵn ca trùng/thiếu/quoted
```

`scripts/prepare-static-site.mjs` copy nguyên thư mục `public/study` nên `csv.js`
tự vào bundle, không cần sửa script build.

## 8. Kiểm chứng đã chạy

```text
npm run check                        pass
npm test                             21/21 pass
/study/ và /study/csv.js             200
POST /api/sync payload dạng CSV      created 2
gửi lại cùng batch                   created 0, updated 2   (không sinh bản sao)
POST /api/sync với meaning rỗng      400, đúng như dự đoán
docs/sample-flashcards.csv           5 thêm, 2 trùng, 2 lỗi đúng số dòng
đối chiếu id app.js <-> index.html   71/71 khớp
```

Chưa chạy: thao tác thật trên trình duyệt (chọn file, bấm nút, tải file về) và
chạy trên AWS.

## 9. Test local

Study web ở local **không cần chỉnh gì**: `backend/public/study/config.js` để
`API_BASE_URL: ""` nghĩa là same-origin, tự trỏ về `localhost:3000`.

```powershell
cd backend
npm run dev
```

Mở `http://localhost:3000/study/`, đăng nhập `student` / `password123`, sang tab
**Library**.

| File mẫu | Dùng để thấy | Kết quả đúng (library trống) |
|---|---|---|
| `docs/sample-flashcards.csv` | preview bắt lỗi và trùng | 6 thêm, 1 trùng, 2 lỗi |
| `docs/sample-flashcards-60.csv` | chia lô và thanh tiến độ | 60 thêm, chạy 3 lô 25/25/10 |

Ở file thứ nhất: `RESILIENT` bị bỏ vì trùng dòng phía trên (khác hoa thường),
dòng 8 thiếu từ, dòng 9 thiếu nghĩa, và `ambiguous` không có category nên vào
`Uncategorized`.

Nếu import file 60 dòng hai lần liên tiếp, lần hai phải hiện **60 trùng, 0
thêm** — đó là bằng chứng cơ chế chống trùng hoạt động.

### Extension ở local

`extension-config.js` bị đặt cờ **skip-worktree**, nên sửa file này không bao giờ
lọt vào commit và HEAD luôn giữ bản placeholder. Giá trị AWS thật nằm trong
`infra/env.local.md`.

Hiện file đang trỏ localhost để test local. Nếu không đổi mà vẫn để trỏ AWS thì
nút "Open study" của extension sẽ mở trang Study **trên S3** — bản chưa có tính
năng CSV — và dễ tưởng nhầm là tính năng hỏng.

Sau khi sửa file, phải vào `chrome://extensions` bấm **Reload** thì extension mới
đọc giá trị mới.

## 10. Khi nào muốn đưa lên AWS

Tính năng này chỉ đụng static bundle, nên **không phải redeploy CloudFormation**,
không đụng `JwtSecret`, không đụng IAM.

```powershell
cd backend
$env:API_BASE_URL="<API endpoint trong infra/env.local.md>"
$env:SITE_BASE_URL="<site bucket URL>"
$env:STUDY_URL="<.../study/index.html>"
$env:GAME_URL="<.../game/index.html>"
npm run prepare:static
aws s3 sync dist/static-site s3://<site-bucket>/ --profile <profile>
```

Sau đó trả `extension-config.js` về giá trị AWS bằng hai dòng có sẵn ở cuối
`infra/env.local.md`, rồi Reload extension.

Lưu ý `backend/dist/static-site/` hiện là bundle cũ từ 2026-07-21, chưa có
`csv.js`. `npm run prepare:static` xoá và dựng lại toàn bộ thư mục đó nên không
cần dọn tay.

Kiểm tra sau khi sync: mở Study trên S3, tab Library phải có ba nút
`Template` / `Import CSV` / `Export CSV`, và `.../study/csv.js` phải trả 200.

## 11. Bản ghi deploy 2026-07-23

Chỉ sync static bundle. **Không redeploy CloudFormation**, không đụng `JwtSecret`,
IAM, DynamoDB hay Lambda.

Đã upload 6 object:

```text
study/index.html  study/app.js  study/styles.css  study/csv.js  study/config.js
game/config.js
```

`game/app.js` không được upload vì MD5 local đã khớp ETag trên S3 — tính năng
"Skip (wrong)" của game vốn đã deploy từ 2026-07-21, chỉ là chưa commit vào git.

Xác minh sau deploy:

```text
6/6 object trả HTTP 200 qua HTTPS
MD5 local khớp ETag S3 cho index.html, app.js, styles.css, csv.js
index.html phục vụ ra internet có đủ importCsvButton, exportCsvButton,
  csvTemplateButton, importDialog, src="csv.js"
study/config.js trỏ đúng API Gateway endpoint
GET /api/health -> ok true
OPTIONS /api/sync từ origin Study -> 204, allow-origin đúng, POST được phép
```

Điểm đáng lưu ý nhất: **trang Study trước đây chưa từng gọi `/api/sync`** — route
đó chỉ có extension dùng. Đây là cặp origin/route mới và local không phát hiện
được vì local cho phép mọi origin. Preflight 204 ở trên là bằng chứng nó thông.

`extension-config.js` đã trả về giá trị AWS sau khi deploy.

## 12. Giới hạn đã biết

- Chống trùng dựa trên bản chụp trong RAM của tab hiện tại. Mở hai tab import
  song song thì có thể lọt từ trùng.
- Chống trùng chỉ so `word`. Cùng một từ ở hai category khác nhau sẽ bị coi là
  trùng.
- Import không xoá và không sửa card sẵn có, chỉ thêm.
- Không có bước chống CSV injection khi export: giá trị bắt đầu bằng `=`, `+`,
  `-`, `@` được ghi nguyên văn. Đây là lựa chọn có chủ ý để export/import khứ
  hồi không làm biến dạng từ như `-ology`. Dữ liệu là của chính người dùng, nhưng
  nếu về sau cho phép import từ nguồn lạ thì cần xem lại.
- `docs/sample-flashcards.csv` chứa dữ liệu giả, không có thông tin cá nhân.
