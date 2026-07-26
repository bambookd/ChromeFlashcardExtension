---
title: "Báo cáo Workshop"
date: 2024-01-01
weight: 5
chapter: false
pre: " <b> 5. </b> "
---

# Báo cáo Kỹ thuật: Chrome Flashcard Extension & Nền tảng Học tập Serverless trên AWS

#### Tóm tắt

Báo cáo này trình bày chi tiết thiết kế kiến trúc, triển khai và deployment trên cloud của dự án **Chrome Flashcard Extension & Serverless Study Platform**. Dự án xây dựng một tiện ích mở rộng trình duyệt hoạt động theo mô hình offline-first (Manifest V3) tích hợp với hạ tầng backend AWS Serverless hoàn toàn managed. Hệ thống cho phép người dùng lưu từ vựng khi đọc trang web, lưu trữ local khi offline, đồng bộ dữ liệu với cơ sở dữ liệu trên cloud, tự động dịch thuật và ôn tập flashcard qua một Web Application riêng biệt.

Hạ tầng đám mây của dự án sử dụng các dịch vụ AWS cốt lõi:
+ **API Gateway HTTP API**: Đóng vai trò là HTTPS REST API gateway trung tâm, xử lý các request từ client và quản lý cấu hình CORS.
+ **AWS Lambda**: Thực thi logic ứng dụng cốt lõi trên Node.js 24.x runtime và framework Express.js thông qua `serverless-http`.
+ **Amazon DynamoDB**: Cơ sở dữ liệu NoSQL lưu trữ thông tin người dùng, bộ sưu tập flashcard và danh mục.
+ **Amazon Translate**: Cung cấp dịch vụ dịch tự động cho tra cứu từ vựng Anh - Việt.
+ **Amazon S3 (Private Bucket)**: Lưu trữ dữ liệu xuất (export data) an toàn với Pre-signed URL có thời hạn 15 phút.
+ **Amazon S3 (Public Bucket)**: Hosting các tài nguyên web tĩnh cho Web Application ôn tập.

#### Sơ đồ kiến trúc tổng quan

```text
Chrome Extension (MV3) ─┐
                        ├─> API Gateway HTTP API -> AWS Lambda -> DynamoDB (Users, Cards, Categories)
Study / Game Web App  ──┘                           ├──> Amazon Translate
                                                    └──> Private S3 Bucket (Pre-signed Export URLs)
```

#### Cấu trúc báo cáo

1. [Tổng quan Kiến trúc & Thiết kế Hệ thống](5.1-Workshop-overview/)
2. [Yêu cầu Môi trường & Thông số Kỹ thuật](5.2-Prerequiste/)
3. [Triển khai Backend Serverless & Hạ tầng AWS](5.3-Deploy-backend/)
4. [Kiến trúc Chrome Extension & Cơ chế Đồng bộ Client](5.4-Extension-setup/)
5. [Ứng dụng Web Ôn tập, Bộ máy Dịch thuật & Xuất Dữ liệu](5.5-Translate-export/)
6. [Giải phóng Tài nguyên & Đánh giá Vận hành](5.6-Cleanup/)
