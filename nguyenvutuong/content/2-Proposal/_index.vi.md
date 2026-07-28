---
title: "Đề xuất"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Đề xuất Dự án & Kế hoạch Triển khai Workshop — Serverless Flashcard Platform

### Tóm tắt Tổng quan

Tài liệu này trình bày chi tiết đề xuất kỹ thuật, kiến trúc hệ thống, lộ trình phát triển và kế hoạch thực thi Workshop cho ứng dụng **Chrome Flashcard Extension & Serverless Study Platform** (Stack Name: `chrome-flashcard-axiza`). Được xây dựng trong đợt thực tập 7 tuần (15/06/2026 – 02/08/2026), ứng dụng kết hợp giữa tiện ích mở rộng trình duyệt theo mô hình offline-first (Manifest V3) và hạ tầng backend AWS Serverless được quản lý hoàn toàn. Website Web Application frontend được lưu trữ trên **AWS Amplify Hosting** dưới tên miền chuẩn (canonical domain) **`https://www.axiza.net`** (với tên miền apex `axiza.net` tự động điều hướng HTTP/HTTPS sang `www.axiza.net`), trong khi backend API sử dụng tên miền tùy chỉnh **`https://api.axiza.net`**, cả hai đều được quản lý bởi **Amazon Route 53** với chứng chỉ số SSL/TLS cấp phát bởi **AWS Certificate Manager (ACM)**.

| Thông số | Giá trị Cấu hình |
| --- | --- |
| **Tên Dự án** | ChromeFlashCardExtension — Serverless Flashcard Platform |
| **Tên Cloud Stack** | `chrome-flashcard-axiza` |
| **AWS Region Triển khai** | `ap-southeast-1` (Singapore) |
| **Tên miền Frontend** | `https://www.axiza.net` (AWS Amplify Hosting CDN edge distribution) |
| **Tên miền Backend API** | `https://api.axiza.net` (Amazon Route 53 + API Gateway HTTP API) |
| **Dịch vụ AWS Cốt lõi** | Route 53, Amplify Hosting, API Gateway, Lambda, DynamoDB, S3, ACM, CloudWatch |
| **Trạng thái Triển khai** | Đã hoàn tất & Kiểm thử thành công — Chuẩn bị triển khai Workshop 5 |

---

## 1. Đặt vấn đề & Thách thức Kỹ thuật

Người học ngôn ngữ và kỹ sư phần mềm khi đọc tài liệu kỹ thuật, bài báo khoa học hoặc tin tức tiếng Anh thường gặp phải 3 rào cản lớn trong việc tích lũy từ vựng:

1. **Gợi mở Từ vựng làm Gián đoạn Luồng Đọc (Context Switching)**: Việc chuyển đổi qua lại giữa bài viết đang đọc và ứng dụng từ điển bên ngoài, sao chép từ, gõ nghĩa và phân loại mất từ 20–30 giây. Rào cản thao tác này khiến hầu hết người học bỏ cuộc sau một thời gian ngắn.
2. **Mất Ngữ cảnh Cụm từ & Thất thoát Dữ liệu**: Các ứng dụng flashcard truyền thống chỉ lưu trữ từ đơn lẻ. Nếu không lưu kèm câu văn gốc và liên kết trang web chứa từ vựng, khả năng ghi nhớ dài hạn giảm đáng kể.
33. **Phụ thuộc Bộ nhớ Trình duyệt Cục bộ**: Dữ liệu lưu trữ local của extension thông thường bị gắn chặt vào một máy tính và một profile trình duyệt duy nhất. Khi cài đặt lại hệ thống hoặc chuyển đổi máy làm việc, toàn bộ bộ sưu tập từ vựng sẽ bị mất hoàn toàn.

Các giải pháp hiện có chỉ giải quyết đơn lẻ từng vấn đề—extension từ điển hiển thị nghĩa nhưng không lưu trữ, trong khi các ứng dụng flashcard độc lập yêu cầu nhập liệu thủ công phức tạp. Dự án này được thiết kế để kết nối trực tiếp từ **thời điểm phát hiện từ vựng trên trang web** tới **phiên ôn tập active recall trên mọi thiết bị**.

---

## 2. Đối tượng Người dùng Mục tiêu

| Nhóm Người dùng | Nhu cầu Thực tế | Giải pháp Kỹ thuật |
| --- | --- | --- |
| **Kỹ sư Phần mềm & Sinh viên** | Lưu thuật ngữ chuyên ngành mà không làm gián đoạn luồng đọc | Thao tác lưu qua menu ngữ cảnh (Context Menu) dưới 5 giây |
| **Người Tự học & Luyện thi Certificate** | Tạo bộ thẻ học từ chính tài liệu thực tế đang đọc | Web App ôn tập thuật toán Active Recall có đánh giá độ khó |
| **Người dùng Đa thiết bị** | Truy cập bộ từ vựng đồng nhất ở nhà, công ty và di động | Cơ chế đồng bộ dữ liệu Cloud về Amazon DynamoDB qua `https://api.axiza.net` |

---

## 3. Mục tiêu Dự án & Kết quả Đạt được

### Mục tiêu Cốt lõi
Tối ưu hóa quy trình thu thập và lưu trữ từ vựng mới xuống **dưới 5 giây** mỗi từ mà không cần rời khỏi trang web đang xem, đồng thời cung cấp khả năng truy cập bộ thẻ học mọi lúc mọi nơi thông qua kiến trúc serverless bảo mật trên cloud.

### Danh mục Kết quả Đạt được (Key Deliverables Matrix)

| # | Kết quả Đạt được | Tiêu chí Hoàn thành & Thông số Kỹ thuật |
| --- | --- | --- |
| **O1** | **Chrome Extension (Manifest V3)** | Chọn từ $\rightarrow$ Chuột phải $\rightarrow$ Dialog lưu dưới 5 giây với khả năng lưu đệm ngoại tuyến trong `chrome.storage.local`. |
| **O2** | **Serverless REST API** | Endpoint HTTPS tại `https://api.axiza.net` xác thực bằng JWT Token, áp dụng throttling (20 req/s rate limit, 40 req/s burst limit), trả về `HTTP 200 OK` cho `/api/health`. |
| **O3** | **Cơ sở Dữ liệu NoSQL Bền vững** | Các bảng Amazon DynamoDB (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) ở chế độ `PAY_PER_REQUEST` bảo đảm phân quyền dữ liệu đa người dùng. |
| **O4** | **Ứng dụng Web Ôn tập (Study App)** | Frontend lưu trữ trên **AWS Amplify Hosting** tại `https://www.axiza.net/study/` hỗ trợ thuật toán hàng chờ Active Recall. |
| **O5** | **Xuất Dữ liệu An toàn** | File JSON export lưu trữ trên S3 private mã hóa chỉ cho phép tải xuống qua Pre-signed URL thời hạn 15 phút; truy cập URL gốc trả về `403 Forbidden`. |
| **O6** | **Hạ tầng dưới dạng Mã (IaC) & Bảo mật** | Template AWS SAM tự động (`infra/template.yaml`) tích hợp chứng chỉ ACM SSL/TLS và bản ghi DNS Route 53 (CNAME cho `www` & Alias A/AAAA cho `api`). |
| **O7** | **Giám sát & Quản lý Chi phí** | Tích hợp Amazon CloudWatch metrics, quy tắc lưu trữ log 7 ngày và chi phí vận hành dưới $2 USD/tháng. |

---

## 4. Kiến trúc Giải pháp & Thiết kế Kỹ thuật

### Sơ đồ Kiến trúc Hệ thống (System Topology)

```text
+-----------------------+        HTTPS REST (api.axiza.net)         +--------------------------+
|  Chrome Extension     |------------------------------------------>|  Amazon Route 53         |
|  (Manifest V3)        |                                           |  (Hosted Zone: axiza.net)|
+-----------------------+                                           +--------------------------+
            | (Lưu trữ đệm Cục bộ)                                          |               |
+-----------------------+        HTTPS (www.axiza.net)                      | CNAME         | Alias A/AAAA
|  Study Web App        |---------------------------------------------------+ (www)         | (api)
|  (AWS Amplify Host)   |                                                   v               v
+-----------------------+                                        +-------------------+ +--------------------------+
            | (Edge CDN)                                         | AWS Amplify Host  | |  API Gateway (HTTP API)  |
            v                                                    +-------------------+ +--------------------------+
+-----------------------+                                                                           |
| Global Edge Network   |                                                                           v
| (Amplify Distribution)|                                                              +--------------------------+
+-----------------------+                                                              |  AWS Lambda Function     |
                                                                                       |  (Node.js Express)       |
                                                                                       +--------------------------+
                                                                                                    |
                                                                                    +---------------+-----------------+
                                                                                    |                                 |
                                                                                    v                                 v
                                                                          +--------------------+            +--------------------+
                                                                          |  Amazon DynamoDB   |            |  Amazon S3 Bucket  |
                                                                          |  (PAY_PER_REQUEST  |            |  (Private Export   |
                                                                          |   On-Demand Mode)  |            |   Pre-signed URLs) |
                                                                          +--------------------+            +--------------------+
```

### Lý do Lựa chọn Dịch vụ AWS (AWS Service Rationale)

| Dịch vụ AWS | Lý do Lựa chọn | Phương án Đã Đánh giá & Bỏ qua |
| --- | --- | --- |
| **AWS Amplify Hosting** | Serves static web assets qua mạng lưới CDN edge toàn cầu dưới tên miền chuẩn `www.axiza.net` với hiệu năng cao và tự động hóa CI/CD. | S3 Static Website Hosting đơn lập (thiếu hỗ trợ HTTPS tùy chỉnh nếu không kết hợp CloudFront). |
| **Amazon Route 53** | Quản lý DNS công cộng độ tin cậy cao cho Hosted Zone `axiza.net`, phục vụ bản ghi CNAME cho `www.axiza.net`, apex redirect, và bản ghi Alias A/AAAA cho API Gateway Custom Domain Name. | Trình quản lý DNS bên thứ ba (độ trễ cao hơn và không có tích hợp bản ghi Alias gốc của AWS). |
| **AWS Certificate Manager (ACM)** | Tự động cấp phát và gia hạn chứng chỉ số SSL/TLS công cộng cho `www.axiza.net`, `axiza.net` và `api.axiza.net`. | Chứng chỉ Let's Encrypt thủ công (yêu cầu cấu hình script tự động gia hạn phức tạp). |
| **API Gateway HTTP API** | REST API gateway độ trễ thấp, hỗ trợ xác thực CORS preflight, rate limit throttling (20 req/s, burst 40 req/s) và custom domain `api.axiza.net` với chi phí rẻ hơn 70% so với REST API v1. | Application Load Balancer (ALB) (phát sinh chi phí duy trì cố định theo giờ ngay cả khi không có traffic). |
| **AWS Lambda** | Môi trường thực thi Node.js 24.x tính toán dạng stateless kết hợp `serverless-http`. Tự động co giãn về 0 (scale-to-zero) giúp triệt tiêu chi phí khi nhàn rỗi. | Máy chủ EC2 / ECS Containers (yêu cầu quản trị hệ điều hành và tính phí liên tục). |
| **Amazon DynamoDB** | Cơ sở dữ liệu NoSQL fully-managed ở chế độ `PAY_PER_REQUEST` (On-Demand) với độ trễ truy xuất dưới 10ms. Cấu trúc Partition Key (`userId`) tối ưu cho truy vấn dữ liệu người dùng. | Amazon RDS / PostgreSQL (phức tạp hóa cấu trúc dữ liệu quan hệ và tốn chi phí máy chủ cố định). |
| **Amazon S3** | Bucket private mã hóa dành riêng cho việc lưu trữ file JSON export truy cập qua pre-signed GET URL thời hạn 15 phút. | Lưu file export trực tiếp trong DynamoDB (vượt giới hạn dung lượng item và tăng chi phí read/write). |

### Điểm sáng về Kiến trúc Bảo mật
- **Nguyên tắc Quyền tối thiểu (Least Privilege IAM Policies)**: IAM Role thực thi của Lambda được giới hạn chính xác qua các SAM Policy (`DynamoDBCrudPolicy` cho 3 bảng cụ thể và `S3CrudPolicy` cho export bucket).
- **Xác thực JWT An toàn**: Mọi request đều trích xuất `userId` trực tiếp từ thông tin token JWT đã qua kiểm tra (`req.user.userId`). Mọi `userId` do client tự gửi lên đều bị loại bỏ.
- **S3 Block Public Access**: Export S3 bucket kích hoạt toàn bộ tính năng `BlockPublicAccess`. Tập tin export chỉ được tải xuống bằng URL Pre-signed mã hóa AWS Signature Version 4 có thời hạn 900 giây.
- **Chính sách CORS Nghiêm ngặt**: API Gateway áp dụng quy tắc CORS nghiêm ngặt cho danh sách allowlist: `https://www.axiza.net`, `https://axiza.net`, `http://axiza.net`, và extension scheme (`chrome-extension://...`).

---

## 5. Lộ trình Thực hiện 7 Tuần & Liên kết Worklog

Quá trình nghiên cứu, xây dựng và hoàn thiện hệ thống được thực thi trong 7 tuần, được ghi nhận chi tiết tại [`content/1-Worklog`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/fcj-workshop-template/content/1-Worklog/_index.vi.md):

| Tuần | Thời gian | Trọng tâm Công việc & Các Cột mốc Đạt được | Sản phẩm / Kết quả Đạt được |
| --- | --- | --- | --- |
| **Tuần 1** | 15/06 – 21/06/2026 | Onboarding, thiết lập tài khoản AWS, thành lập đội ngũ, thống nhất mục tiêu và khởi động dự án | Đề khung dự án & Phạm vi công việc |
| **Tuần 2** | 22/06 – 28/06/2026 | Nghiên cứu các dịch vụ AWS, định nghĩa bài toán dự án và xây dựng prototype Chrome Extension ban đầu | Extension Manifest V3 chạy với Local Storage |
| **Tuần 3** | 29/06 – 05/07/2026 | Logic phiên học, quản lý danh mục, Express.js REST API, template DynamoDB SAM | Template `template.yaml` & backend Express local |
| **Tuần 4** | 06/07 – 12/07/2026 | Chuẩn hóa bộ tài liệu kiến trúc, kiểm tra an ninh, tối ưu giao diện UI/UX | Bộ 11 tài liệu thiết kế & API Contract |
| **Tuần 5** | 13/07 – 19/07/2026 | Triển khai thực tế lần đầu lên AWS cloud, deploy SAM stack, thiết lập guardrail chi phí | Stack đám mây live `chrome-flashcard-dev` |
| **Tuần 6** | 20/07 – 26/07/2026 | Kiểm thử toàn diện, tối ưu hiệu năng, cấu hình tên miền tùy chỉnh (`www.axiza.net` & `api.axiza.net`) | Điều hướng Custom Domain & Kiểm thử E2E |
| **Tuần 7** | 27/07 – 02/08/2026 | Hoàn thiện báo cáo tổng kết, xây dựng tài liệu Workshop, tự động hóa dọn dẹp tài nguyên | Bộ tài liệu Workshop 5 & Script dọn dẹp |

---

## 6. Kế hoạch Chi tiết Triển khai Workshop (Workshop 5 Breakdown)

Dựa trên kết quả triển khai hạ tầng và nhật ký công việc, **Workshop 5** ([`content/5-Workshop`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/fcj-workshop-template/content/5-Workshop/_index.vi.md)) được cấu trúc thành 6 bài thực hành chi tiết:

```text
5-Workshop/
├── 5.1-Workshop-overview/    # Bài 1: Tổng quan Kiến trúc, Thông số Kỹ thuật & Luồng Dữ liệu
├── 5.2-Prerequiste/          # Bài 2: Yêu cầu Môi trường, Công cụ CLI & Kiểm thử Local
├── 5.3-Deploy-backend/       # Bài 3: Triển khai Backend SAM, Cloud Deployment & Route 53 Custom Domains
├── 5.4-Extension-setup/      # Bài 4: Cấu hình Chrome Extension MV3 & Đồng bộ Hàng loạt Cloud
├── 5.5-Translate-export/     # Bài 5: Ứng dụng Web Ôn tập Amplify & Xuất Dữ liệu S3 Pre-signed URL
└── 5.6-Cleanup/              # Bài 6: Giải phóng Tài nguyên, Kiểm soát Chi phí & Kết luận
```

### Nội dung Chi tiết Các Bài Thực hành

#### Bài 5.1: Tổng quan Kiến trúc & Thiết kế Hệ thống
- **Mục tiêu**: Giới thiệu cho người học về kiến trúc serverless, thiết kế mẫu offline-first và thông số kỹ thuật các thành phần AWS.
- **Tài liệu Cốt lõi**: Sơ đồ kiến trúc tổng quan, bảng thông số các thành phần AWS (bao gồm ACM, Route 53, Amplify Hosting CDN, API Gateway, Lambda, DynamoDB `PAY_PER_REQUEST`, S3 private export), và phân tích luồng dữ liệu 4 giai đoạn.

#### Bài 5.2: Yêu cầu Môi trường & Thông số Kỹ thuật
- **Mục tiêu**: Hướng dẫn người học kiểm tra môi trường, cài đặt các công cụ dòng lệnh (CLI) và kiểm thử ứng dụng ở môi trường cục bộ.
- **Tài liệu Cốt lõi**: Bảng yêu cầu phiên bản (Node.js v18+, AWS CLI v2, AWS SAM CLI v1.100+), cấu trúc thư mục repository, và lệnh kiểm tra health check local (`http://localhost:3000/api/health`).

#### Bài 5.3: Triển khai Backend Serverless & Hạ tầng AWS
- **Mục tiêu**: Triển khai backend serverless bằng AWS SAM và cấu hình điều hướng tên miền tùy chỉnh qua Amazon Route 53.
- **Tài liệu Cốt lõi**: Phân tích `infra/template.yaml`, các lệnh `sam build` và `sam deploy --guided`, quy trình tạo API Gateway Custom Domain Name Regional endpoint và bản ghi Route 53 Alias A-record cho `api.axiza.net`, CNAME cho `www.axiza.net`, và kiểm tra endpoint thực tế (`curl https://api.axiza.net/api/health`).

#### Bài 5.4: Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client
- **Mục tiêu**: Cài đặt và cấu hình Chrome Extension Manifest V3, thực hành lưu trữ đệm cục bộ và đồng bộ hàng loạt lên cloud.
- **Tài liệu Cốt lõi**: Sơ đồ kiến trúc thành phần client, file `extension-config.js` (`API_BASE_URL: "https://api.axiza.net"`, `STUDY_URL: "https://www.axiza.net/study/"`), cấu trúc JSON local storage, và quy trình đồng bộ cloud (`POST /api/sync`).

#### Bài 5.5: Ứng dụng Web Ôn tập & Xuất Dữ liệu
- **Mục tiêu**: Trải nghiệm Study Web App lưu trữ trên AWS Amplify và thực hành xuất dữ liệu an toàn qua Amazon S3 Pre-signed URL.
- **Tài liệu Cốt lõi**: Mô hình tích hợp Study App (`https://www.axiza.net/study/`), thuật toán hàng chờ ôn tập Active Recall, sơ đồ trình tự xuất dữ liệu S3 Pre-signed URL (`POST /api/export` -> Pre-signed GET URL 15 phút), và kiểm tra bảo mật (`403 Forbidden` khi truy cập URL gốc S3).

#### Bài 5.6: Giải phóng Tài nguyên & Đánh giá Vận hành
- **Mục tiêu**: Hướng dẫn người học quy trình dọn dẹp và hủy triển khai hạ tầng tự động nhằm triệt tiêu phát sinh chi phí sau workshop.
- **Tài liệu Cốt lõi**: Lệnh xóa bản ghi Route 53 CNAME/Alias, dọn dẹp S3 export bucket, lệnh hủy stack `sam delete --no-prompts`, các lệnh kiểm tra xác minh sau vận hành (`aws cloudformation describe-stacks`, `aws dynamodb list-tables`), và kết luận tổng kết.

---

## 7. Quản lý Chi phí & Ngân sách Vận hành

Ngân sách vận hành cho hệ thống được tối ưu hóa nằm gọn trong hạn mức **AWS Free Tier** và duy trì chi phí siêu thấp ở điều kiện lưu lượng kiểm thử (~1,000 requests/tháng) tại khu vực `ap-southeast-1`:

| Dịch vụ AWS | Yếu tố Phát sinh Chi phí | Chi phí Dự kiến / Tháng |
| --- | --- | --- |
| **AWS Lambda** | ~1,000 lượt gọi, 256 MB RAM, thời gian chạy ~200 ms | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **API Gateway HTTP API** | ~1,000 request REST | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **AWS Amplify Hosting** | Phân phối web tĩnh từ CDN edge | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **Amazon Route 53** | 1 Hosted Zone (`axiza.net`) + truy vấn DNS | ~$0.50 USD / tháng |
| **AWS Certificate Manager (ACM)** | Chứng chỉ số SSL/TLS công cộng cho `www.axiza.net` & `api.axiza.net` | $0.00 USD (Miễn phí cho dịch vụ AWS) |
| **Amazon DynamoDB** | 3 bảng NoSQL (Chế độ `PAY_PER_REQUEST` On-Demand) | ~$0.00 – $0.50 USD |
| **Amazon S3** | Private export bucket (< 100 MB JSON data) | < $0.10 USD |
| **Amazon CloudWatch** | Nhập nhật ký (< 50 MB) với quy tắc lưu trữ 7 ngày | < $0.10 USD |
| **Tổng Chi phí Dự kiến** | | **~$0.70 – $1.50 USD / tháng** |

### Các Biện pháp Kiểm soát Tài chính (Financial Guardrails)
- **Cảnh báo Ngân sách AWS Budgets**: Cấu hình cảnh báo tự động gửi email khi chi phí đạt ngưỡng $1.00 USD và $5.00 USD.
- **Giới hạn Lưu lượng API Gateway**: Giới hạn burst rate ở mức 40 req/s và rate limit ở mức 20 req/s.
- **Quy tắc Vòng đời Tài nguyên (Lifecycle Policies)**: Tập tin export trên S3 tự động xóa sau 7 ngày; thời gian lưu trữ log trên CloudWatch Log Group được giới hạn 7 ngày.

---

## 8. Quản trị Rủi ro & Phương án Tối ưu

| # | Rủi ro Kỹ thuật | Khả năng | Ảnh hưởng | Biện pháp Phòng ngừa & Tối ưu | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| **R1** | **Lỗi CORS trên Custom Domain** | Cao | Cao | Cấu hình allowlist gồm `https://www.axiza.net`, `https://axiza.net`, `http://axiza.net`, và extension scheme. Kiểm thử thực tế trên tên miền thật. | **Đã xử lý** |
| **R2** | **Trễ Cấp phát Chứng chỉ ACM SSL/TLS** | Trung bình | Trung bình | Khởi tạo chứng chỉ ACM public cho `www.axiza.net`, `axiza.net` và `api.axiza.net` trước khi thực hiện ánh xạ bản ghi Route 53. | **Đã phòng ngừa** |
| **R3** | **Phát sinh Chi phí Đám mây Ngoài ý muốn** | Trung bình | Cao | Khai báo AWS Budgets $1/$5, quy tắc S3 Lifecycle, CloudWatch log retention 7 ngày và kiến trúc scale-to-zero. | **Đã kiểm soát** |
| **R4** | **Rò rỉ hoặc Mất Khóa JWT Secret** | Trung bình | Cao | Khai báo `JwtSecret` trong SAM Parameters với `NoEcho: true` và truyền tự động qua GitHub Secrets trong CI/CD. | **Đã kiểm soát** |
| **R5** | **Độ trễ Cold Start của AWS Lambda** | Trung bình | Thấp | Tối ưu dung lượng gói nén zip triển khai dưới 5 MB, sử dụng Node.js 24 runtime gọn nhẹ và tối ưu hóa module import. | **Đã tối ưu** |
| **R6** | **Tài nguyên Dư thừa Sau Workshop** | Cao | Cao | Tự động hóa quy trình dọn dẹp (`sam delete --no-prompts` & gỡ bản ghi Route 53) được hướng dẫn chi tiết tại Bài 5.6. | **Đã tự động hóa** |

---

## 9. Định hướng Phát triển trong Tương lai

1. **Tích hợp Amazon Cognito**: Nâng cấp hệ thống xác thực JWT tùy chỉnh sang Amazon Cognito User Pools nhằm đạt chuẩn OAuth2/OIDC, hỗ trợ Refresh Token và xác thực hai yếu tố (MFA).
2. **Thuật toán Ghi nhớ Lặp lại Ngắt quãng (Spaced Repetition)**: Nâng cấp thuật toán hàng chờ Active Recall sang thuật toán SuperMemo SM-2 giúp tối ưu hóa khả năng ghi nhớ dài hạn của người học.
3. **Phát hành trên Chrome Web Store**: Đóng gói extension Manifest V3 cùng bộ tài nguyên cửa hàng để chính thức đăng tải lên Chrome Web Store.
