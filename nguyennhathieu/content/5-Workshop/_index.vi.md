---
title: "Báo cáo Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Báo cáo Kỹ thuật: Chrome Flashcard Extension & Nền tảng Học tập Serverless trên AWS

#### Tóm tắt

Báo cáo này trình bày chi tiết thiết kế kiến trúc, quá trình phát triển và triển khai trên cloud của dự án **Chrome Flashcard Extension & Serverless Study Platform** (Stack Name: `chrome-flashcard-axiza`). Dự án xây dựng một tiện ích mở rộng trình duyệt hoạt động theo mô hình offline-first (Manifest V3) tích hợp với hạ tầng backend AWS Serverless được quản lý hoàn toàn. Website Web Application frontend được lưu trữ trên **AWS Amplify Hosting** dưới tên miền chuẩn (canonical domain) **`https://www.axiza.net`** (với tên miền apex `axiza.net` tự động điều hướng HTTP/HTTPS sang `www.axiza.net`), trong khi backend API sử dụng tên miền tùy chỉnh **`https://api.axiza.net`**, cả hai đều được quản lý bởi **Amazon Route 53** cùng chứng chỉ số SSL/TLS cấp phát bởi **AWS Certificate Manager (ACM)**. Hệ thống cho phép người dùng lưu từ vựng khi đọc trang web, lưu trữ local khi offline, đồng bộ dữ liệu với cơ sở dữ liệu trên cloud và ôn tập flashcard qua một Web App riêng biệt.

#### Thành viên Nhóm Thực hiện Workshop

| Thành viên | MSSV |
| --- | --- |
| **Nguyễn Minh Triết** | 2353214 |
| **Nguyễn Nhật Hiếu** | 2352330 |
| **Nguyễn Vũ Tường** | 2313834 |

#### Mã nguồn & Repository Dự án
- **GitHub Repository**: [https://github.com/bambookd/ChromeFlashcardExtension](https://github.com/bambookd/ChromeFlashcardExtension)

#### Dịch vụ AWS Cốt lõi
+ **Amazon Route 53**: Quản lý các bản ghi DNS công cộng cho Hosted Zone `axiza.net`, phục vụ bản ghi CNAME cho tên miền chuẩn `www.axiza.net`, điều hướng apex domain, và bản ghi A/AAAA Alias trỏ `api.axiza.net` tới Regional domain endpoint của API Gateway Custom Domain.
+ **AWS Certificate Manager (ACM)**: Cấp phát và quản lý chứng chỉ số SSL/TLS công cộng cho `www.axiza.net`, `axiza.net` và `api.axiza.net`.
+ **AWS Amplify Hosting**: Phục vụ trực tiếp tài nguyên trang web tĩnh (frontend static assets) qua mạng lưới CDN edge toàn cầu dưới tên miền `www.axiza.net`.
+ **API Gateway HTTP API**: Đóng vai trò là REST API gateway HTTPS trung tâm cho `api.axiza.net` hỗ trợ giới hạn lưu lượng throttling (20 req/s, burst 40 req/s), xử lý các request từ client và quản lý chính sách cấp quyền CORS cho danh sách allowlist (`https://www.axiza.net`, `https://axiza.net`, `http://axiza.net`, `chrome-extension://...`).
+ **AWS Lambda**: Thực thi logic ứng dụng cốt lõi trên Node.js runtime và Express.js framework thông qua `serverless-http`.
+ **Amazon DynamoDB**: Cơ sở dữ liệu NoSQL bền vững hoạt động ở chế độ `PAY_PER_REQUEST` (On-Demand), lưu trữ thông tin người dùng, bộ sưu tập flashcard và danh mục.
+ **Amazon S3**: Bucket private mã hóa dành riêng cho việc lưu trữ file xuất dữ liệu JSON với pre-signed GET URL có thời hạn 15 phút.

#### Sơ đồ Kiến trúc Tổng quan

![](/images/5-Workshop/5.1-Workshop-overview/arch.jpg)

#### Cấu trúc Báo cáo

1. [Tổng quan Kiến trúc & Thiết kế Hệ thống](5.1-Workshop-overview/)
2. [Yêu cầu Môi trường & Thông số Kỹ thuật](5.2-Prerequiste/)
3. [Triển khai Backend Serverless & Hạ tầng AWS](5.3-Deploy-backend/)
4. [Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client](5.4-Extension-setup/)
5. [Ứng dụng Web Ôn tập & Xuất Dữ liệu](5.5-Translate-export/)
6. [Giải phóng Tài nguyên & Đánh giá Vận hành](5.6-Cleanup/)
