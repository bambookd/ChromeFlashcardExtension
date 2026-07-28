---
title: "Đề xuất"
date: 2026-07-21
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

<<<<<<< HEAD
# Đề xuất Dự án & Kế hoạch Triển khai Workshop — Serverless Flashcard Platform
=======
# Đề xuất dự án — Chrome Flashcard Extension Serverless trên AWS
>>>>>>> 3d3d3d6 (proposal)

### Tóm tắt Tổng quan (Executive Summary)

<<<<<<< HEAD
Tài liệu này trình bày chi tiết đề xuất kỹ thuật, kiến trúc hệ thống, lộ trình phát triển và kế hoạch thực thi Workshop cho ứng dụng **Chrome Flashcard Extension & Serverless Study Platform** (Stack Name: `chrome-flashcard-axiza`). Được xây dựng trong đợt thực tập 7 tuần (15/06/2026 – 02/08/2026), ứng dụng kết hợp giữa tiện ích mở rộng trình duyệt theo mô hình offline-first (Manifest V3) và hạ tầng backend AWS Serverless được quản lý hoàn toàn. Trang web frontend được lưu trữ trên dịch vụ **AWS Amplify Hosting** (kết nối S3 bucket) dưới tên miền tùy chỉnh `axiza.net`, trong khi backend API sử dụng tên miền tùy chỉnh `api.axiza.net`, cả hai đều được quản lý bởi **Amazon Route 53** với chứng chỉ số SSL/TLS cấp phát bởi **AWS Certificate Manager (ACM)**.
=======
Dự án xây dựng và mô tả một Chrome extension theo hướng offline-first, giúp
người dùng lưu từ vựng khi đọc web, đồng bộ flashcard lên AWS, ôn tập qua ứng
dụng web và xuất dữ liệu an toàn. Phần triển khai được trình bày dưới dạng
workshop có thể thực hiện lại, bao quát toàn bộ vòng đời từ chuẩn bị môi trường,
deploy, kiểm tra đến dọn dẹp tài nguyên.
>>>>>>> 3d3d3d6 (proposal)

| Thông số | Giá trị Cấu hình |
| --- | --- |
<<<<<<< HEAD
| **Tên Dự án** | ChromeFlashCardExtension — Serverless Flashcard Platform |
| **Tên Cloud Stack** | `chrome-flashcard-axiza` |
| **AWS Region Triển khai** | `ap-southeast-1` (Singapore) |
| **Tên miền Frontend** | `https://axiza.net` (AWS Amplify Hosting + Amazon S3) |
| **Tên miền Backend API** | `https://api.axiza.net` (Amazon Route 53 + API Gateway HTTP API) |
| **Dịch vụ AWS Cốt lõi** | Route 53, Amplify Hosting, API Gateway, Lambda, DynamoDB, S3, ACM, CloudWatch |
| **Trạng thái Triển khai** | Đã hoàn tất & Kiểm thử thành công — Chuẩn bị triển khai Workshop 5 |
=======
| Dự án | Chrome Flashcard Extension & Study Platform |
| Nền tảng | Chrome Extension Manifest V3 và AWS |
| Region | `ap-southeast-1` (Singapore) |
| Dịch vụ chính | API Gateway HTTP API, Lambda, DynamoDB, S3, CloudWatch |
| Infrastructure as Code | AWS SAM / CloudFormation |
| Backend | Node.js 24.x, Express.js, `serverless-http` |
| Kết quả workshop | Deploy, cấu hình, kiểm thử, export và gỡ bỏ hệ thống |
>>>>>>> 3d3d3d6 (proposal)

---

<<<<<<< HEAD
## 1. Đặt vấn đề & Thách thức Kỹ thuật

Người học ngôn ngữ và kỹ sư phần mềm khi đọc tài liệu kỹ thuật, bài báo khoa học hoặc tin tức tiếng Anh thường gặp phải 3 rào cản lớn trong việc tích lũy từ vựng:

1. **Gợi mở Từ vựng làm Gián đoạn Luồng Đọc (Context Switching)**: Việc chuyển đổi qua lại giữa bài viết đang đọc và ứng dụng từ điển bên ngoài, sao chép từ, gõ nghĩa và phân loại mất từ 20–30 giây. Rào cản thao tác này khiến hầu hết người học bỏ cuộc sau một thời gian ngắn.
2. **Mất Ngữ cảnh Cụm từ & Thất thoát Dữ liệu**: Các ứng dụng flashcard truyền thống chỉ lưu trữ từ đơn lẻ. Nếu không lưu kèm câu văn gốc và liên kết trang web chứa từ vựng, khả năng ghi nhớ dài hạn giảm đáng kể.
3. **Phụ thuộc Bộ nhớ Trình duyệt Cục bộ**: Dữ liệu lưu trữ local của extension thông thường bị gắn chặt vào một máy tính và một profile trình duyệt duy nhất. Khi cài đặt lại hệ thống hoặc chuyển đổi máy làm việc, toàn bộ bộ sưu tập từ vựng sẽ bị mất hoàn toàn.

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
=======
Người học thường gặp từ lạ khi đọc website, tài liệu kỹ thuật và bài viết trực
tuyến. Việc chuyển sang ứng dụng khác để tạo flashcard làm gián đoạn mạch đọc,
trong khi dữ liệu chỉ lưu trên trình duyệt khó đồng bộ và dễ mất.

Giải pháp đề xuất kết nối thời điểm người học gặp một từ với quá trình ôn tập về
sau. Người dùng bôi đen nội dung trên trang, chọn thao tác từ context menu, kiểm
tra thẻ trong hộp thoại nổi và lưu cục bộ. Sau khi xác thực, các thẻ này có thể
được đồng bộ lên AWS và ôn tập bằng Study Web App.

## 2. Mục tiêu dự án

Dự án sẽ:

1. Xây dựng Chrome extension Manifest V3 để lưu và chỉnh sửa từ vựng ngay trên
   trang web.
2. Lưu flashcard offline bằng `chrome.storage.local`.
3. Đồng bộ dữ liệu có xác thực JWT qua `POST /api/sync`.
4. Deploy backend Express.js lên AWS Lambda phía sau API Gateway HTTP API.
5. Lưu user, flashcard và category trong Amazon DynamoDB.
6. Cung cấp Study Web App có lọc theo category và các mức active recall
   (`Again`, `Hard`, `Good`, `Easy`).
7. Export flashcard của người dùng thành JSON qua Amazon S3 pre-signed URL có
   hiệu lực 15 phút, đồng thời giữ bucket export ở chế độ private.
8. Kiểm tra hệ thống đã deploy và xóa an toàn toàn bộ tài nguyên của workshop.

## 3. Phạm vi

### Bao gồm

- Chuẩn bị môi trường local và các dependency.
- Giới thiệu cấu trúc repository và các thành phần.
- Build bằng AWS SAM và deploy qua CloudFormation.
- API Gateway, Lambda, DynamoDB, S3 private cho export và log CloudWatch.
- Cấu hình extension, xác thực, lưu offline và đồng bộ theo lô.
- Truy cập Study Web App và ôn tập flashcard.
- Export JSON an toàn và kiểm tra quyền truy cập trực tiếp vào object.
- Xóa stack CloudFormation và audit sau khi dọn dẹp.

### Không bao gồm

- Multiplayer realtime và bảng xếp hạng toàn cục.
- Amazon Cognito hoặc nhà cung cấp danh tính bên thứ ba.
- Custom domain, CloudFront và phát hành lên Chrome Web Store.
- Disaster recovery ở quy mô production và triển khai đa region.

## 4. Kiến trúc đề xuất
>>>>>>> 3d3d3d6 (proposal)

### Mục tiêu Cốt lõi
Tối ưu hóa quy trình thu thập và lưu trữ từ vựng mới xuống **dưới 5 giây** mỗi từ mà không cần rời khỏi trang web đang xem, đồng thời cung cấp khả năng truy cập bộ thẻ học mọi lúc mọi nơi thông qua kiến trúc serverless bảo mật trên cloud.

### Danh mục Kết quả Đạt được (Key Deliverables Matrix)

| # | Kết quả Đạt được | Tiêu chí Hoàn thành & Thông số Kỹ thuật |
| --- | --- | --- |
| **O1** | **Chrome Extension (Manifest V3)** | Chọn từ $\rightarrow$ Chuột phải $\rightarrow$ Dialog lưu dưới 5 giây với khả năng lưu đệm ngoại tuyến. |
| **O2** | **Serverless REST API** | Endpoint HTTPS tại `https://api.axiza.net` xác thực bằng JWT Token, trả về `HTTP 200 OK` cho `/api/health`. |
| **O3** | **Cơ sở Dữ liệu NoSQL Bền vững** | Các bảng Amazon DynamoDB (`UsersTable`, `FlashcardsTable`, `CategoriesTable`) bảo đảm phân quyền dữ liệu đa người dùng. |
| **O4** | **Ứng dụng Web Ôn tập (Study App)** | Frontend lưu trữ trên **AWS Amplify Hosting** tại `https://axiza.net/study` hỗ trợ thuật toán hàng chờ Active Recall. |
| **O5** | **Xuất Dữ liệu An toàn** | File JSON export lưu trữ trên S3 chỉ cho phép tải xuống qua Pre-signed URL thời hạn 15 phút; truy cập URL gốc trả về `403 Forbidden`. |
| **O6** | **Hạ tầng dưới dạng Mã (IaC) & Bảo mật** | Template AWS SAM tự động (`infra/template.yaml`) tích hợp chứng chỉ ACM SSL/TLS và bản ghi DNS Route 53. |
| **O7** | **Giám sát & Quản lý Chi phí** | Tích hợp Amazon CloudWatch metrics, quy tắc lưu trữ log 7 ngày và chi phí vận hành dưới $5 USD/tháng. |

---

## 4. Kiến trúc Giải pháp & Thiết kế Kỹ thuật

### Sơ đồ Kiến trúc Hệ thống (System Topology)

```text
<<<<<<< HEAD
+-----------------------+        HTTPS REST (api.axiza.net)         +--------------------------+
|  Chrome Extension     |------------------------------------------>|  Amazon Route 53         |
|  (Manifest V3)        |                                           |  (Hosted Zone: axiza.net)|
+-----------------------+                                           +--------------------------+
            | (Lưu trữ đệm Cục bộ)                                          |               |
+-----------------------+        HTTPS (axiza.net)                          | Alias         | Alias
|  Study & Game Web     |---------------------------------------------------+ (axiza.net)   | (api.axiza.net)
|  (AWS Amplify Host)   |                                                   v               v
+-----------------------+                                        +-------------------+ +--------------------------+
            |                                                    | AWS Amplify Host  | |  API Gateway (HTTP API)  |
            v (Tài nguyên Tĩnh)                                  +-------------------+ +--------------------------+
+-----------------------+                                                  |                         |
|  Amazon S3 Bucket     |<-------------------------------------------------+                         v
|  (Static Web Assets)  |                                                               +--------------------------+
|                       |                                                               |  AWS Lambda Function     |
+-----------------------+                                                               |  (Node.js Express)       |
                                                                                        +--------------------------+
                                                                                                     |
                                                                                    +-----------------+-----------------+
                                                                                    |                                   |
                                                                                    v                                   v
                                                                          +--------------------+              +--------------------+
                                                                          |  Amazon DynamoDB   |              |  Amazon S3 Bucket  |
                                                                          |  (Users, Cards,    |              |  (Private Export   |
                                                                          |   Categories)      |              |   Pre-signed URLs) |
                                                                          +--------------------+              +--------------------+
```

### Lý do Lựa chọn Dịch vụ AWS (AWS Service Rationale)

| Dịch vụ AWS | Lý do Lựa chọn | Phương án Đã Đánh giá & Bỏ qua |
| --- | --- | --- |
| **AWS Amplify Hosting** | Kết nối S3 bucket phân phối giao diện web tĩnh qua CDN toàn cầu dưới tên miền tùy chỉnh `axiza.net` ổn định và tự động. | S3 Static Website Hosting đơn lập (thiếu hỗ trợ HTTPS tùy chỉnh nếu không dùng CloudFront). |
| **Amazon Route 53** | Quản lý DNS công cộng độ tin cậy cao cho Hosted Zone `axiza.net`, phục vụ bản ghi Alias A/AAAA cho cả Amplify và API Gateway. | Trình quản lý DNS bên thứ ba (độ trễ cao hơn và không có tích hợp bản ghi Alias gốc của AWS). |
| **AWS Certificate Manager (ACM)** | Tự động cấp phát và gia hạn chứng chỉ số SSL/TLS công cộng cho `axiza.net` và `api.axiza.net`. | Chứng chỉ Let's Encrypt thủ công (yêu cầu cấu hình script tự động gia hạn phức tạp). |
| **API Gateway HTTP API** | REST API gateway độ trễ thấp, hỗ trợ xác thực CORS preflight và custom domain `api.axiza.net` với chi phí rẻ hơn 70% so với REST API. | Application Load Balancer (ALB) (phát sinh chi phí duy trì cố định theo giờ ngay cả khi không có traffic). |
| **AWS Lambda** | Môi trường thực thi Node.js tính toán dạng stateless kết hợp `serverless-http`. Tự động co giãn về 0 (scale-to-zero) giúp triệt tiêu chi phí khi nhàn rỗi. | Máy chủ EC2 / ECS Containers (yêu cầu quản trị hệ điều hành và tính phí liên tục). |
| **Amazon DynamoDB** | Cơ sở dữ liệu NoSQL fully-managed với độ trễ truy xuất dưới 10ms. Cấu trúc Partition Key (`userId`) tối ưu cho truy vấn dữ liệu người dùng. | Amazon RDS / PostgreSQL (phức tạp hóa cấu trúc dữ liệu quan hệ và tốn chi phí máy chủ cố định). |
| **Amazon S3** | Chiến lược hai S3 bucket: bucket chứa web tĩnh cho Amplify hosting và bucket private lưu file JSON export truy cập qua pre-signed GET URL thời hạn 15 phút. | Lưu file export trực tiếp trong DynamoDB (vượt giới hạn dung lượng item và tăng chi phí). |

### Điểm sáng về Kiến trúc Bảo mật
- **Nguyên tắc Quyền tối thiểu (Least Privilege IAM Policies)**: IAM Role thực thi của Lambda được giới hạn chính xác qua các SAM Policy (`DynamoDBCrudPolicy` cho 3 bảng cụ thể và `S3CrudPolicy` cho export bucket).
- **Xác thực JWT An toàn**: Mọi request đều trích xuất `userId` trực tiếp từ thông tin token JWT đã qua kiểm tra (`req.user.userId`). Mọi `userId` do client tự gửi lên đều bị loại bỏ.
- **S3 Block Public Access**: Export S3 bucket kích hoạt toàn bộ tính năng `BlockPublicAccess`. Tập tin export chỉ được tải xuống bằng URL Pre-signed mã hóa AWS Signature Version 4 có thời hạn 900 giây.
- **Chính sách CORS Nghiêm ngặt**: API Gateway áp dụng quy tắc CORS nghiêm ngặt chỉ chấp nhận request đến từ origin `https://axiza.net` và các extension scheme được cấp phép.

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
| **Tuần 6** | 20/07 – 26/07/2026 | Kiểm thử toàn diện, tối ưu hiệu năng, cấu hình tên miền tùy chỉnh (`axiza.net` & `api.axiza.net`) | Điều hướng Custom Domain & Kiểm thử E2E |
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
- **Tài liệu Cốt lõi**: Sơ đồ kiến trúc tổng quan, bảng thông số các thành phần AWS (bao gồm ACM, Route 53, Amplify, API Gateway, Lambda, DynamoDB, S3), và phân tích luồng dữ liệu 4 giai đoạn.

#### Bài 5.2: Yêu cầu Môi trường & Thông số Kỹ thuật
- **Mục tiêu**: Hướng dẫn người học kiểm tra môi trường, cài đặt các công cụ dòng lệnh (CLI) và kiểm thử ứng dụng ở môi trường cục bộ.
- **Tài liệu Cốt lõi**: Bảng yêu cầu phiên bản (Node.js v18+, AWS CLI v2, AWS SAM CLI v1.100+), cấu trúc thư mục repository, và lệnh kiểm tra health check local (`http://localhost:3000/api/health`).

#### Bài 5.3: Triển khai Backend Serverless & Hạ tầng AWS
- **Mục tiêu**: Triển khai backend serverless bằng AWS SAM và cấu hình điều hướng tên miền tùy chỉnh qua Amazon Route 53.
- **Tài liệu Cốt lõi**: Phân tích `infra/template.yaml`, các lệnh `sam build` và `sam deploy --guided`, script CLI tạo bản ghi Alias Route 53 cho `axiza.net` (Amplify) và `api.axiza.net` (API Gateway), và kiểm tra endpoint thực tế (`curl https://api.axiza.net/api/health`).

#### Bài 5.4: Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client
- **Mục tiêu**: Cài đặt và cấu hình Chrome Extension Manifest V3, thực hành lưu trữ đệm cục bộ và đồng bộ hàng loạt lên cloud.
- **Tài liệu Cốt lõi**: Sơ đồ kiến trúc thành phần client, file `extension-config.js` (`API_BASE_URL: "https://api.axiza.net"`), cấu trúc JSON local storage, và quy trình đồng bộ cloud (`POST /api/sync`).

#### Bài 5.5: Ứng dụng Web Ôn tập & Xuất Dữ liệu
- **Mục tiêu**: Trải nghiệm Study Web App lưu trữ trên AWS Amplify và thực hành xuất dữ liệu an toàn qua Amazon S3 Pre-signed URL.
- **Tài liệu Cốt lõi**: Mô hình tích hợp Study App (`https://axiza.net/study`), thuật toán hàng chờ ôn tập Active Recall, sơ đồ trình tự xuất dữ liệu S3 Pre-signed URL (`POST /api/export` -> Pre-signed GET URL 15 phút), và kiểm tra bảo mật (`403 Forbidden` khi truy cập URL gốc S3).

#### Bài 5.6: Giải phóng Tài nguyên & Đánh giá Vận hành
- **Mục tiêu**: Thực hành hủy triển khai hạ tầng tự động nhằm triệt tiêu phát sinh chi phí sau workshop.
- **Tài liệu Cốt lõi**: Lệnh xóa bản ghi Route 53 Alias, dọn dẹp S3 bucket, lệnh hủy stack `sam delete --no-prompts`, các lệnh kiểm tra xác minh sau vận hành (`aws cloudformation describe-stacks`, `aws dynamodb list-tables`), và kết luận tổng kết.

---

## 7. Quản lý Chi phí & Ngân sách Vận hành

Ngân sách vận hành cho hệ thống được tối ưu hóa nằm gọn trong hạn mức **AWS Free Tier** và duy trì chi phí siêu thấp ở điều kiện lưu lượng kiểm thử (~1,000 requests/tháng) tại khu vực `ap-southeast-1`:

| Dịch vụ AWS | Yếu tố Phát sinh Chi phí | Chi phí Dự kiến / Tháng |
| --- | --- | --- |
| **AWS Lambda** | ~1,000 lượt gọi, 256 MB RAM, thời gian chạy ~200 ms | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **API Gateway HTTP API** | ~1,000 request REST | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **AWS Amplify Hosting** | Phân phối web tĩnh từ S3 | $0.00 USD (Trong hạn mức AWS Free Tier) |
| **Amazon Route 53** | 1 Hosted Zone (`axiza.net`) + truy vấn DNS | ~$0.50 USD / tháng |
| **AWS Certificate Manager (ACM)** | Chứng chỉ số SSL/TLS công cộng cho `axiza.net` & `api.axiza.net` | $0.00 USD (Miễn phí cho dịch vụ AWS) |
| **Amazon DynamoDB** | 3 bảng NoSQL (Chế độ On-Demand hoặc 1 RCU / 1 WCU Provisioned) | ~$0.00 – $1.00 USD |
| **Amazon S3** | Bucket chứa web tĩnh + Bucket export private (< 100 MB) | < $0.10 USD |
| **Amazon CloudWatch** | Nhập nhật ký (< 50 MB) với quy tắc lưu trữ 7 ngày | < $0.10 USD |
| **Tổng Chi phí Dự kiến** | | **~$0.70 – $1.70 USD / tháng** |

### Các Biện pháp Kiểm soát Tài chính (Financial Guardrails)
- **Cảnh báo Ngân sách AWS Budgets**: Cấu hình cảnh báo tự động gửi email khi chi phí đạt ngưỡng $1.00 USD và $5.00 USD.
- **Giới hạn Lưu lượng API Gateway**: Giới hạn burst rate ở mức 10 req/s và rate limit ở mức 5 req/s.
- **Quy tắc Vòng đời Tài nguyên (Lifecycle Policies)**: Tập tin export trên S3 tự động xóa sau 7 ngày; thời gian lưu trữ log trên CloudWatch Log Group được giới hạn 7 ngày.

---

## 8. Quản trị Rủi ro & Phương án Tối ưu

| # | Rủi ro Kỹ thuật | Khả năng | Ảnh hưởng | Biện pháp Phòng ngừa & Tối ưu | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| **R1** | **Lỗi CORS trên Custom Domain** | Cao | Cao | Đồng bộ cấu hình origin giữa API Gateway (`AllowedOrigins`) và Express backend (`https://axiza.net`). Kiểm thử thực tế trên tên miền thật. | **Đã xử lý** |
| **R2** | **Trễ Cấp phát Chứng chỉ ACM SSL/TLS** | Trung bình | Trung bình | Khởi tạo chứng chỉ ACM public cho `axiza.net` và `*.axiza.net` trước khi thực hiện ánh xạ bản ghi Route 53. | **Đã phòng ngừa** |
| **R3** | **Phát sinh Chi phí Đám mây Ngoài ý muốn** | Trung bình | Cao | Khai báo AWS Budgets $1/$5, quy tắc S3 Lifecycle, CloudWatch log retention 7 ngày và kiến trúc scale-to-zero. | **Đã kiểm soát** |
| **R4** | **Rò rỉ hoặc Mất Khóa JWT Secret** | Trung bình | Cao | Khai báo `JwtSecret` trong SAM Parameters với `NoEcho: true` và truyền tự động qua GitHub Secrets trong CI/CD. | **Đã kiểm soát** |
| **R5** | **Độ trễ Cold Start của AWS Lambda** | Trung bình | Thấp | Tối ưu dung lượng gói nén zip triển khai dưới 5 MB, sử dụng Node.js 24 runtime gọn nhẹ và tối ưu hóa module import. | **Đã tối ưu** |
| **R6** | **Tài nguyên Dư thừa Sau Workshop** | Cao | Cao | Tự động hóa quy trình dọn dẹp (`sam delete --no-prompts` & gỡ bản ghi Route 53) được hướng dẫn chi tiết tại Bài 5.6. | **Đã tự động hóa** |

---

## 9. Định hướng Phát triển trong Tương lai

1. **Amazon CloudFront + Origin Access Control (OAC)**: Bổ sung mạng phân phối nội dung toàn cầu CloudFront CDN phía trước S3 nhằm tăng tốc độ tải giao diện web tĩnh hơn nữa.
2. **Tích hợp Amazon Cognito**: Nâng cấp hệ thống xác thực JWT tùy chỉnh sang Amazon Cognito User Pools nhằm đạt chuẩn OAuth2/OIDC, hỗ trợ Refresh Token và xác thực hai yếu tố (MFA).
3. **Thuật toán Ghi nhớ Lặp lại Ngắt quãng (Spaced Repetition)**: Nâng cấp thuật toán hàng chờ Active Recall sang thuật toán SuperMemo SM-2 giúp tối ưu hóa khả năng ghi nhớ dài hạn của người học.
4. **Phát hành trên Chrome Web Store**: Đóng gói extension Manifest V3 cùng bộ tài nguyên cửa hàng để chính thức đăng tải lên Chrome Web Store.
=======
+-----------------------+        HTTPS REST         +--------------------------+
| Chrome Extension MV3  |-------------------------->| API Gateway (HTTP API)   |
| + lưu dữ liệu local   |                           +------------+-------------+
+-----------------------+                                        |
                                                                 v
+-----------------------+                           +--------------------------+
| Study Web Application |-------------------------->| AWS Lambda               |
| static web client     |                           | Express + serverless-http|
+-----------------------+                           +------------+-------------+
                                                                 |
                                       +-------------------------+------------------+
                                       |                                            |
                                       v                                            v
                            +--------------------+                       +--------------------+
                            | Amazon DynamoDB    |                       | Amazon S3         |
                            | Users / Cards /    |                       | JSON export private|
                            | Categories         |                       | pre-signed GET URL |
                            +--------------------+                       +--------------------+
```

### Vai trò các thành phần

| Thành phần | Trách nhiệm |
| --- | --- |
| Chrome Extension | Lưu nội dung được chọn, chỉnh sửa thẻ, lưu local, xác thực và kích hoạt đồng bộ |
| API Gateway HTTP API | Cung cấp endpoint HTTPS, xử lý CORS và proxy request đến Lambda |
| AWS Lambda | Chạy backend Express, xác minh JWT, xử lý API và điều phối lưu trữ/export |
| DynamoDB | Lưu user, flashcard và category bằng các khóa theo từng user |
| Study Web App | Lấy flashcard đã xác thực và cung cấp phiên ôn tập active recall |
| S3 bucket private | Lưu file JSON export và chỉ phục vụ qua signed URL tạm thời |
| CloudWatch | Ghi execution log và metric vận hành dùng trong bước kiểm tra |

## 5. Quy trình workshop

Đề xuất được ánh xạ trực tiếp với nội dung workshop:

| Phần workshop | Hoạt động | Kết quả mong đợi |
| --- | --- | --- |
| 5.1 Tổng quan kiến trúc | Xem các thành phần và luồng dữ liệu đầu-cuối | Hiểu cách extension, web app và các dịch vụ AWS tương tác |
| 5.2 Yêu cầu môi trường | Cài công cụ, xem repository và chạy backend local | Health endpoint local hoạt động |
| 5.3 Deploy backend | Chạy `sam build`, `sam deploy --guided` và kiểm tra `/api/health` | API serverless trả `{"ok":true,"service":"flashcard-backend"}` |
| 5.4 Cấu hình extension | Cấu hình API URL, load extension, xác thực, tạo thẻ và sync | Thẻ được lưu local và đồng bộ vào DynamoDB |
| 5.5 Study và export | Ôn tập thẻ đã sync và yêu cầu export JSON | Signed URL tải được file; URL S3 trực tiếp trả `403 Forbidden` |
| 5.6 Cleanup | Xóa object S3 cần thiết, xóa stack và audit tài nguyên | Các tài nguyên cloud của workshop được gỡ bỏ |

## 6. Luồng dữ liệu

1. Người dùng bôi đen một từ và chọn thao tác từ context menu của extension.
2. `contentScript.js` hiển thị trình chỉnh sửa nổi và lưu flashcard vào
   `chrome.storage.local`.
3. Popup xác thực user và gửi các thẻ chưa đồng bộ tới `POST /api/sync`.
4. API Gateway chuyển request đến Lambda; backend xác minh JWT và ghi dữ liệu
   theo từng user vào DynamoDB.
5. Study Web App lấy thẻ của user qua REST API đã xác thực.
6. Yêu cầu export tạo object JSON trong S3 bucket private và trả về pre-signed
   GET URL có hiệu lực 900 giây.

## 7. Tiêu chí hoàn thành

Dự án hoàn thành khi người tham gia workshop có thể:

- Chạy backend local và xác nhận health endpoint.
- Deploy SAM stack tại `ap-southeast-1`.
- Load và cấu hình extension Manifest V3.
- Tạo flashcard offline và đồng bộ sau khi đăng nhập.
- Lấy và ôn tập các thẻ đã đồng bộ trong Study Web App.
- Tải JSON export bằng pre-signed URL và xác nhận truy cập public trực tiếp bị
  từ chối.
- Xóa stack và kiểm tra các bảng DynamoDB cùng CloudWatch log group không còn
  tồn tại.

## 8. Kết quả mong đợi

Sản phẩm cuối là một nền tảng flashcard serverless hoạt động được, có tài liệu
đầy đủ, cùng workshop sáu phần trình bày kiến trúc, chuẩn bị môi trường, deploy,
đồng bộ client, chức năng study/export và quy trình teardown có trách nhiệm.
>>>>>>> 3d3d3d6 (proposal)
