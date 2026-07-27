---
title: "Proposal"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Đề xuất dự án — Nền tảng Flashcard Serverless

### Tổng quan

Đề xuất cho một dự án cloud cá nhân: một Chrome extension lưu từ vựng ngay khi
bạn đọc web, dựa trên kiến trúc serverless AWS để lưu trữ, đồng bộ và xuất dữ liệu.

| Mục | Giá trị |
| --- | --- |
| Tên dự án | ChromeFlashCardExtension — Nền tảng Flashcard Serverless |
| Tác giả | {{TODO: Họ và tên}} |
| Ngày | {{TODO: dd/mm/yyyy}} |
| Region | `ap-southeast-1` (Singapore) |
| Dịch vụ AWS | API Gateway, Lambda, DynamoDB, S3, CloudWatch (+ CloudFormation/SAM, IAM, Budgets) |
| Trạng thái | Đã deploy — stack `chrome-flashcard-dev` |

## 1. Bài toán

Một người học tiếng Anh bằng cách đọc nội dung thật — tài liệu kỹ thuật, tin tức,
blog — sẽ gặp 10 đến 30 từ lạ trong một buổi đọc. Gần như toàn bộ số đó bị mất
đi, vì ba lý do:

**Việc lưu lại làm đứt mạch đọc.** Chuyển sang app khác, gõ từ, gõ nghĩa, rồi
quay lại tốn 20–30 giây và làm mất mạch suy nghĩ. Hầu hết mọi người bỏ cuộc sau
vài từ.
  
**Ngữ cảnh biến mất.** Một từ được nhớ mà không có câu chứa nó thì khó gợi lại
hơn nhiều. Các app flashcard thông thường lưu từ, chứ không lưu trang đã tìm thấy
nó.

**Dữ liệu bị mắc kẹt.** Ghi chú trong local storage của trình duyệt chỉ tồn tại
trên một máy, trong một profile. Cài lại trình duyệt là mất sạch từ vựng.

Các công cụ hiện có giải quyết được nhiều nhất một trong ba vấn đề. Extension từ
điển hiện nghĩa rồi quên. App flashcard lưu card tốt nhưng bắt nhập tay. Không có
gì nối được "khoảnh khắc bạn gặp từ" với "bộ thẻ bạn học sau đó".

## 2. Người dùng mục tiêu

| Người dùng | Họ cần gì |
| --- | --- |
| Sinh viên Việt Nam đọc tài liệu kỹ thuật tiếng Anh | Lưu từ mà không mất mạch đọc; ôn lại sau |
| Người tự học luyện IELTS/TOEIC | Bộ thẻ dựng từ chính nội dung họ đọc, không phải danh sách từ chung chung |
| Bất kỳ ai dùng nhiều hơn một máy tính | Cùng một kho từ vựng ở mọi nơi |

## 3. Mục tiêu

**Mục tiêu chính.** Giảm chi phí lưu một từ mới xuống dưới 5 giây mà không rời
trang, và làm cho bộ thẻ thu được truy cập được từ trình duyệt bất kỳ.

**Sản phẩm cụ thể**

| # | Sản phẩm | Tiêu chí thành công |
| --- | --- | --- |
| O1 | Chrome extension (Manifest V3) | Bôi đen từ → chuột phải → lưu, dưới 5 giây |
| O2 | REST API serverless | Endpoint HTTPS công khai, bảo vệ bằng JWT, `/api/health` trả 200 |
| O3 | Lưu trữ bền vững theo từng user | Card sống sót qua lần cài lại trình duyệt; không user nào đọc được dữ liệu của user khác |
| O4 | Ứng dụng web Study | Phiên học và bài test trắc nghiệm trên chính card của mình |
| O5 | Export riêng tư | Tải JSON qua URL có hạn; URL object thô trả về 403 |
| O6 | Khả năng quan sát | Log, metric và alarm cho lỗi, throttle và độ trễ |
| O7 | Kiểm soát chi phí | Dưới 5 USD/tháng với traffic demo, có cảnh báo ngân sách |

**Không thuộc phạm vi giai đoạn này.** Multiplayer realtime, bảng xếp hạng toàn
cục, xác thực bằng Cognito, custom domain, và phát hành lên Chrome Web Store. Các
mục này được ghi lại là việc tương lai, không phải âm thầm bỏ đi.

## 4. Kiến trúc giải pháp

![Kiến trúc giải pháp](/images/2-proposal/architecture.png)

```text
                    ┌──────────────────────┐
Trình duyệt user ──►│ Chrome Extension MV3 │──┐
                    └──────────────────────┘  │  HTTPS + JWT
                    ┌──────────────────────┐  │
Trình duyệt user ──►│ Web Study / Game     │──┤
                    └──────────▲───────────┘  │
                               │ tĩnh         ▼
                      ┌────────┴───────┐  ┌────────────────────────┐
                      │ S3 bucket site │  │ API Gateway (HTTP API) │
                      │  (đọc công khai)│ │  CORS + throttling     │
                      └────────────────┘  └───────────┬────────────┘
                                                      │ proxy ANY /{proxy+}
                                          ┌───────────▼────────────┐
                                          │ AWS Lambda (Node.js 24)│
                                          │ Express + serverless-  │
                                          │ http, IAM role         │
                                          └───┬────────────────┬───┘
                                              │                │
                         ┌────────────────────▼───┐   ┌────────▼──────────────┐
                         │ DynamoDB               │   │ S3 bucket export      │
                         │ Users / Flashcards /   │   │ (chặn toàn bộ truy    │
                         │ Categories             │   │  cập công khai)       │
                         └────────────────────────┘   └────────┬──────────────┘
                                                               │ pre-signed GET 15 phút
                                              ┌────────────────▼──────────────┐
                                              │ CloudWatch log, metric,       │
                                              │ alarm  ◄── Lambda + API GW    │
                                              └───────────────────────────────┘
```

### Vì sao chọn từng dịch vụ

| Dịch vụ | Vì sao chọn | Phương án bị loại |
| --- | --- | --- |
| **API Gateway HTTP API** | Một endpoint HTTPS được quản lý, có sẵn CORS và throttling. Chọn HTTP API thay vì REST API: rẻ hơn khoảng 70% và đủ dùng cho tích hợp proxy. | ALB cần VPC và tính tiền theo giờ kể cả khi rảnh |
| **AWS Lambda** | Traffic chỉ vài request mỗi ngày với khoảng nghỉ dài. Scale-to-zero nghĩa là lúc rảnh không tốn gì, và Express app sẵn có chạy nguyên vẹn qua `serverless-http`. | EC2/ECS tính tiền liên tục và phải vá hệ điều hành |
| **DynamoDB** | Access pattern đúng là "lấy các item của một user", thứ mà partition key trả lời trực tiếp. Serverless, không phải chọn kích cỡ instance. | RDS tính tiền theo giờ và schema quan hệ không đem lại lợi ích gì ở đây |
| **S3** | Hai nhiệm vụ khác nhau, hai bucket: host web tĩnh, và một bucket hoàn toàn riêng tư cho file export phục vụ qua pre-signed URL. | Phục vụ file tĩnh từ Lambda là lãng phí lượt gọi |
| **CloudWatch** | Đi kèm sẵn với Lambda và API Gateway, không phải cài agent. Retention của log cấu hình được, điều này quan trọng về chi phí. | Công cụ APM bên thứ ba là thừa và tốn thêm tiền |
| **CloudFormation / SAM** | Toàn bộ backend nằm trong một file review được, và `delete-stack` xóa sạch trong một thao tác — chính điều đó khiến việc dọn dẹp đáng tin cậy. | Tạo tay bằng console thì không review được và không xóa sạch được chắc chắn |

### Thiết kế bảo mật

- **Không có credential dài hạn ở bất cứ đâu.** Lambda nhận quyền từ execution
  role; GitHub Actions nhận credential ngắn hạn qua OIDC.
- **Quyền tối thiểu.** Lambda role có năm action DynamoDB trên đúng ba ARN bảng,
  cộng `GetObject`/`PutObject` trên một bucket. Không có `Scan`, không wildcard.
- **Chủ sở hữu lấy từ token.** Mọi request suy ra `userId` từ claim `sub` của JWT
  đã verify. `userId` do client gửi lên bị bỏ qua.
- **Hai bucket, hai tư thế bảo mật.** Export bucket bật Block Public Access toàn
  bộ và không bao giờ được mở công khai chỉ để chữa lỗi tải file.
- **CORS theo origin chính xác.** Không dùng `*`. Và CORS không phải cơ chế phân
  quyền — kiểm tra JWT phải tự đứng vững, vì `curl` bỏ qua CORS hoàn toàn.

## 5. Timeline

![Timeline](/images/2-proposal/timeline.png)

| Giai đoạn | Tuần | Sản phẩm |
| --- | --- | --- |
| Khảo sát & prototype | 1–2 | Xác nhận bài toán, extension + backend local chạy được |
| Tầng dữ liệu & IaC | 3 | Repository DynamoDB, SAM template đầu tiên |
| Audit & tài liệu | 4 | 11 tài liệu thiết kế, tìm ra 8 blocker trước khi tiêu tiền |
| Deploy & CI/CD | 5 | Stack chạy thật, pipeline OIDC, hàng rào chi phí |
| Kiểm chứng | 6 | Chạy trọn bộ test end-to-end, thu thập bằng chứng |
| Khả năng quan sát | 7 | Structured log, alarm, dashboard |
| Siết bảo mật | 8 | Validate đầu vào, rà soát IAM, rà soát XSS |
| Tối ưu | 9 | Đo chi phí và hiệu năng |
| Cộng đồng | 10 | Đăng 3 bài blog |
| Workshop | 11 | Lab tái lập được, kiểm chứng trên tài khoản sạch |
| Kết thúc | 12 | Báo cáo cuối, demo, dọn dẹp |

## 6. Ngân sách

Chi phí ước tính mỗi tháng ở mức traffic demo (≈1.000 request/tháng), region
`ap-southeast-1`:

| Dịch vụ | Yếu tố tính tiền | Ước tính |
| --- | --- | --- |
| Lambda | ~1.000 lượt gọi, 256 MB, ~200 ms | Trong free tier ≈ 0,00 USD |
| API Gateway HTTP API | ~1.000 request | < 0,01 USD |
| DynamoDB | 3 bảng × 1 RCU + 1 WCU, **tính tiền cả khi rảnh** | ≈ 1,50–2,00 USD |
| S3 | < 100 MB lưu trữ, vài nghìn request | < 0,10 USD |
| CloudWatch Logs | < 50 MB ingest, retention 7 ngày | < 0,10 USD |
| **Tổng** | | **≈ 2 USD/tháng** |

{{% notice warning %}}
Đừng coi đây là báo giá. Giá thay đổi theo region và theo tài khoản, và điều kiện
free tier sẽ hết hạn. Hãy tính lại bằng
[AWS Pricing Calculator](https://calculator.aws/) và ghi rõ ngày cùng region.

Hãy chú ý hình dạng của hóa đơn: chi phí lớn nhất là **DynamoDB provisioned
capacity, thứ tính tiền bất kể có ai dùng app hay không**. Mọi thứ tính theo mức
sử dụng thật đều làm tròn về 0 ở quy mô này. Chuyển các bảng đó sang on-demand là
thay đổi có giá trị cao nhất về chi phí (Tuần 9).
{{% /notice %}}

**Hàng rào đang áp dụng:** cảnh báo ngân sách ở 1 USD và 5 USD, throttle API
2 req/s, lifecycle export 7 ngày, log retention 7 ngày.

## 7. Rủi ro

| # | Rủi ro | Khả năng | Tác động | Biện pháp | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| R1 | CORS chặn một lời gọi vốn chạy được ở local | Cao | Demo hỏng | Allowlist origin chính xác, đồng bộ giữa API Gateway và Express; test từ origin thật, không bao giờ tin local | **Đã xảy ra** — phát hiện trong audit Tuần 4 |
| R2 | Một dịch vụ AWS không khả dụng trên tài khoản | Trung bình | Tính năng chết | Kiểm tra dịch vụ có dùng được không trước khi thiết kế phụ thuộc vào nó | **Đã xảy ra** — Translate trả `OptInRequired`; đã gỡ tính năng |
| R3 | Chi phí ngoài dự kiến | Trung bình | Thiệt hại tài chính cá nhân | Đặt cảnh báo ngân sách trước tài nguyên đầu tiên; throttle; lifecycle; capacity thấp | Đã kiểm soát |
| R4 | Xoay `JwtSecret` làm đăng xuất toàn bộ user | Trung bình | Demo hỏng | Ghi rõ cạm bẫy `NoEcho`; lưu secret trong GitHub Secrets; deploy qua CI | Đã kiểm soát |
| R5 | Cold start của Lambda làm demo trông chậm | Trung bình | Ấn tượng xấu | Làm ấm endpoint trước khi demo; giữ gói nhỏ; chỉ cân nhắc provisioned concurrency nếu đã đo | Chấp nhận |
| R6 | DynamoDB throttle ở mức 1 RCU/WCU | Thấp | 5xx khi sync | Alarm trên `ThrottledRequests`; tăng capacity tạm thời nếu cần | Đang giám sát |
| R7 | Rò rỉ pre-signed URL | Thấp | Lộ dữ liệu | Hạn 15 phút; không bao giờ log hay chụp màn hình; lifecycle object 7 ngày | Đã kiểm soát |
| R8 | Phình phạm vi sang multiplayer realtime | Cao | Không hoàn thành gì | Ghi thành ADR-06, tuyên bố rõ ngoài phạm vi | Đã kiểm soát |

## 8. Hướng phát triển

- CloudFront + Origin Access Control để có HTTPS và URL gọn.
- Amazon Cognito thay cho JWT tự viết, để có cơ chế thu hồi và refresh token.
- API Gateway WebSocket API + bảng connections cho prototype multiplayer realtime
  vốn không chuyển lên Lambda được.
- Point-in-time recovery cho DynamoDB và phân trang cho bộ thẻ lớn.
- Lịch ôn tập ngắt quãng (spaced repetition) thay cho việc xáo bài đơn giản.
