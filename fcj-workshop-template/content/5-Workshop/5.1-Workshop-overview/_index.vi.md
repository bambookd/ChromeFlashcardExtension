---
title: "Tổng quan Kiến trúc & Thiết kế Hệ thống"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 5.1. </b> "
---

#### Tóm tắt Tổng quan (Executive Summary)

Phần này trình bày chi tiết kiến trúc hệ thống, cấu trúc các thành phần và luồng truyền nhận dữ liệu của ứng dụng serverless **Chrome Flashcard Extension** (`chrome-flashcard-axiza`) trên nền tảng Amazon Web Services (AWS). Trang web frontend được lưu trữ trên dịch vụ AWS Amplify Hosting kết nối với S3 bucket dưới tên miền tùy chỉnh `axiza.net` quản lý bởi Amazon Route 53, trong khi backend API sử dụng tên miền tùy chỉnh `api.axiza.net` định tuyến qua Amazon Route 53 tới API Gateway HTTP API.

#### Sơ đồ Kiến trúc Hệ thống (Architectural Topology)

Hệ thống áp dụng thiết kế mẫu offline-first tại tầng client, kết hợp với kiến trúc serverless hướng dịch vụ (microservices-inspired) trên AWS:

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Thông số Kỹ thuật Chi tiết các Thành phần AWS

| Thành phần | Vai trò Kiến trúc | Thông số Vận hành & Đặc tính Kỹ thuật |
|---|---|---|
| **AWS Amplify Hosting** | Host Website Frontend | Lưu trữ và phân phối tài nguyên web tĩnh (static web assets) từ S3 bucket cho ứng dụng Study & Game Web App dưới tên miền tùy chỉnh `axiza.net`. |
| **Amazon Route 53** | Quản lý DNS & Điều hướng Tên miền | Quản lý bản ghi DNS công cộng cho `axiza.net`, điều hướng apex domain (`axiza.net`) tới AWS Amplify Hosting và subdomain API (`api.axiza.net`) thông qua các bản ghi Alias (A/AAAA) tới API Gateway. |
| **AWS Certificate Manager (ACM)** | Quản lý Chứng chỉ SSL/TLS | Cấp phát, quản lý và tự động gia hạn chứng chỉ số SSL/TLS công cộng cho các tên miền tùy chỉnh `axiza.net` và `api.axiza.net`, bảo đảm mã hóa giao thức HTTPS tầng truyền tải. |
| **API Gateway HTTP API** | Public Gateway & Reverse Proxy | Cung cấp endpoint HTTPS bảo mật với tên miền tùy chỉnh `api.axiza.net`, xử lý xác thực CORS preflight cho origin cho phép `https://axiza.net`, và proxy toàn bộ request (`/{proxy+}`) tới AWS Lambda. |
| **AWS Lambda** | Tầng Tính toán Stateless | Thực thi ứng dụng Express.js backend thông qua `serverless-http` trên Node.js runtime, hỗ trợ khả năng tự động co giãn linh hoạt (scale-to-zero) giúp tối ưu chi phí. |
| **Amazon DynamoDB** | Tầng Lưu trữ Bền vững | Các bảng NoSQL (chế độ Provisioned/On-demand): `UsersTable` (PK: `username`), `FlashcardsTable` (PK: `userId`, SK: `cardId`), và `CategoriesTable` (PK: `userId`, SK: `categoryName`). |
| **Amazon S3** | Lưu trữ Web Tĩnh & File Export Mã hóa | S3 bucket chứa tài nguyên giao diện cho Amplify hosting, kết hợp với S3 bucket private lưu trữ file JSON export chỉ cho phép truy cập qua pre-signed GET URL tạm thời (thời hạn 15 phút). |
| **Amazon CloudWatch** | Nền tảng Giám sát & Nhật ký Hệ thống | Ghi nhận nhật ký thực thi (execution logs), chỉ số vận hành (metrics), thời gian cold start và tỷ lệ lỗi hệ thống cho stack `chrome-flashcard-axiza`. |

#### Phân tích Luồng Dữ liệu giữa các Thành phần

1. **Giai đoạn Thu thập Từ vựng (Vocabulary Acquisition)**: Extension lắng nghe sự kiện bôi đen văn bản thông qua context menu listener. Script chèn DOM (`contentScript.js`) hiển thị một modal nổi trực tiếp (inline modal) và lưu bản ghi cục bộ vào `chrome.storage.local`.
2. **Giai đoạn Đồng bộ Cloud (Cloud Synchronization)**: Khi người dùng xác thực hoặc chủ động kích hoạt đồng bộ (sync), extension gửi dữ liệu lưu tạm ở local qua request `POST https://api.axiza.net/api/sync` định tuyến qua Route 53 tới API Gateway. Lambda xác thực token JWT và thực hiện các thao tác ghi hàng loạt (batch write operations) vào DynamoDB.
3. **Giai đoạn Ôn tập Tương tác (Interactive Practice)**: Ứng dụng Study Web App lưu trữ trên AWS Amplify (kết nối S3) tại địa chỉ `https://axiza.net/study`, tải danh sách flashcard từ DynamoDB thông qua các cuộc gọi REST API tới backend (`https://api.axiza.net/api/...`), quản lý hàng chờ ôn tập và cập nhật chỉ số ghi nhớ.
4. **Giai đoạn Xuất Dữ liệu An toàn (Secure Export)**: Yêu cầu export kích hoạt Lambda tổng hợp file JSON snapshot có cấu trúc, ghi trực tiếp vào private S3 bucket và trả về pre-signed URL giới hạn thời hạn để client tải xuống an toàn.
