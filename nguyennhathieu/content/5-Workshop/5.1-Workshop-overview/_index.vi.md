---
title: "Tổng quan Kiến trúc & Thiết kế Hệ thống"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

#### Tóm tắt Tổng quan

Phần này mô tả chi tiết kiến trúc hệ thống, phân rã thành phần và mô hình giao tiếp dữ liệu của ứng dụng serverless **Chrome Flashcard Extension** (`chrome-flashcard-axiza`) trên Amazon Web Services (AWS). Website Web Application frontend được lưu trữ trên **AWS Amplify Hosting** phục vụ qua mạng lưới CDN edge toàn cầu dưới tên miền chuẩn **`https://www.axiza.net`** (với tên miền apex `axiza.net` tự động điều hướng HTTP/HTTPS sang `www.axiza.net`), trong khi backend API sử dụng tên miền tùy chỉnh **`https://api.axiza.net`**, cả hai đều được quản lý bởi **Amazon Route 53** cùng chứng chỉ số SSL/TLS cấp phát bởi **AWS Certificate Manager (ACM)**.

#### Kiến trúc Tổng quan

Hệ thống áp dụng mô hình thiết kế offline-first tại tầng client kết hợp với kiến trúc serverless hướng dịch vụ trên AWS:

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Bảng Thông số Kỹ thuật Thành phần AWS

| Thành phần | Vai trò Kiến trúc | Thông số Kỹ thuật Vận hành Cốt lõi |
|---|---|---|
| **AWS Amplify Hosting** | Máy chủ Lưu trữ Website Frontend | Phục vụ trực tiếp tài nguyên web tĩnh (frontend static assets) qua các nút edge CDN toàn cầu dưới tên miền chuẩn `www.axiza.net`. |
| **Amazon Route 53** | DNS & Điều hướng Tên miền | Quản lý bản ghi DNS công cộng cho Hosted Zone `axiza.net`, phục vụ bản ghi CNAME cho `www.axiza.net` (Amplify CDN distribution endpoint), điều hướng apex domain (`axiza.net` $\rightarrow$ `www.axiza.net`), và bản ghi A/AAAA Alias trỏ `api.axiza.net` tới API Gateway Regional Domain Name (`d-xxxx.execute-api...`). |
| **AWS Certificate Manager (ACM)** | Quản lý Chứng chỉ SSL/TLS | Tự động cấp phát, quản lý và gia hạn chứng chỉ số SSL/TLS công cộng cho các tên miền tùy chỉnh `www.axiza.net`, `axiza.net` và `api.axiza.net`, bảo đảm an toàn truyền tải HTTPS. |
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Thực thi HTTPS cho custom domain `api.axiza.net`, áp dụng giới hạn lưu lượng throttling (rate limit 20 req/s, burst limit 40 req/s), quản lý xác thực CORS preflight cho danh sách allowlist (`https://www.axiza.net`, `https://axiza.net`, `http://axiza.net`, `chrome-extension://...`), và điều hướng request qua proxy integration (`/{proxy+}`) tới Lambda. |
| **AWS Lambda** | Tầng Tính toán Stateless | Thực thi ứng dụng Express.js backend qua `serverless-http` trên Node.js runtime, mang lại hiệu quả tối ưu chi phí scale-to-zero khi nhàn rỗi. |
| **Amazon DynamoDB** | Tầng Lưu trữ Bền vững | Các bảng NoSQL quản lý hoàn toàn ở chế độ `PAY_PER_REQUEST` (On-Demand): `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), và `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon S3** | Bộ lưu trữ Tài liệu Mã hóa Private | Bucket private mã hóa dành riêng cho việc lưu trữ file xuất dữ liệu JSON, chỉ cho phép tải xuống qua các pre-signed GET URL có thời hạn 15 phút. |
| **Amazon CloudWatch** | Nền tảng Giám sát & Logging | Thu thập log thực thi, chỉ số vận hành, thời gian cold start và tỷ lệ lỗi hệ thống cho stack `chrome-flashcard-axiza`. |

#### Phân tích Luồng Dữ liệu Thành phần

1. **Giai đoạn Thu thập Từ vựng**: Tiện ích mở rộng trình duyệt thu thập văn bản bôi đen qua context menu listener. Script nội dung (`contentScript.js`) hiển thị modal chỉnh sửa và lưu bản ghi cục bộ vào `chrome.storage.local`.
2. **Giai đoạn Đồng bộ Cloud**: Khi người dùng xác thực hoặc chủ động nhấn đồng bộ, extension truyền các bản ghi local qua `POST https://api.axiza.net/api/sync` điều hướng qua Route 53 tới API Gateway. Lambda xác thực JWT token và thực thi thao tác batch lưu vào DynamoDB.
3. **Giai đoạn Học tập Tương tác**: Study Web App lưu trữ trên AWS Amplify Hosting tại `https://www.axiza.net/study/` (với apex redirect `axiza.net` $\rightarrow$ `www.axiza.net`) tải các thẻ từ vựng của người dùng từ DynamoDB qua REST API (`https://api.axiza.net/api/...`), quản lý hàng chờ học và điểm ghi nhớ.
4. **Giai đoạn Xuất Dữ liệu An toàn**: Yêu cầu export kích hoạt Lambda đóng gói file JSON snapshot, ghi file vào private S3 bucket và trả về đường dẫn pre-signed URL tải xuống thời hạn 15 phút.
