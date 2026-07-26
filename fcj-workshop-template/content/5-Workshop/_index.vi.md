---
title: "Báo cáo Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Báo cáo Kỹ thuật: Chrome Flashcard Extension & Nền tảng Học tập Serverless trên AWS

#### Tóm tắt

Báo cáo này trình bày chi tiết thiết kế kiến trúc, quá trình phát triển và triển khai trên cloud của dự án **Chrome Flashcard Extension & Serverless Study Platform**. Dự án xây dựng một tiện ích mở rộng trình duyệt hoạt động theo mô hình offline-first (Manifest V3) tích hợp với hạ tầng backend AWS Serverless được quản lý hoàn toàn (fully managed). Hệ thống cho phép người dùng lưu từ vựng khi đọc trang web, lưu trữ local khi offline, đồng bộ dữ liệu với cơ sở dữ liệu trên cloud và ôn tập flashcard qua một Web App riêng biệt.

Hạ tầng cloud của dự án sử dụng các dịch vụ AWS cốt lõi:
+ **API Gateway HTTP API**: Đóng vai trò là REST API gateway HTTPS trung tâm, xử lý các request từ client và quản lý chính sách CORS.
+ **AWS Lambda**: Thực thi logic ứng dụng cốt lõi trên Node.js 24.x runtime và Express.js framework thông qua `serverless-http`.
+ **Amazon DynamoDB**: Cơ sở dữ liệu NoSQL lưu trữ thông tin người dùng, bộ sưu tập flashcard và danh mục.
+ **Amazon S3 (Private Bucket)**: Lưu trữ file dữ liệu xuất (export data) an toàn với pre-signed URL có thời hạn 15 phút.
+ **Amazon S3 (Public Bucket)**: Host các tài nguyên web tĩnh (static assets) cho Web App ôn tập.

#### Sơ đồ kiến trúc tổng quan

```text
Chrome Extension (MV3) ─┐
                        ├─> API Gateway HTTP API -> AWS Lambda -> DynamoDB (Users, Cards, Categories)
Study / Game Web App  ──┘                           └──> Private S3 Bucket (Pre-signed Export URLs)
```

#### Cấu trúc báo cáo

1. [Tổng quan Kiến trúc & Thiết kế Hệ thống](5.1-Workshop-overview/)
2. [Yêu cầu Môi trường & Thông số Kỹ thuật](5.2-Prerequiste/)
3. [Triển khai Backend Serverless & Hạ tầng AWS](5.3-Deploy-backend/)
4. [Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client](5.4-Extension-setup/)
5. [Ứng dụng Web Ôn tập & Xuất Dữ liệu](5.5-Translate-export/)
6. [Giải phóng Tài nguyên & Đánh giá Vận hành](5.6-Cleanup/)
