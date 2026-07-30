---
title: "Nhật ký công việc Tuần 7"
date: 2026-07-27
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Tuần 7 — 27/07 – 02/08/2026

## Mục tiêu

- Hoàn tất bộ tài liệu Workshop 5 gồm 6 module (`content/5-Workshop`).
- Xây dựng và xác minh các kịch bản demo: lưu từ qua extension, ôn tập active recall và xuất dữ liệu qua pre-signed URL S3.
- Chạy kiểm thử tích hợp trên các domain trực tiếp (`https://axiza.net` và `https://api.axiza.net`).
- Xác minh các script dọn dẹp tài nguyên và tự động hóa teardown (`sam delete --no-prompts` và xóa Route 53 record).
- Rà soát hệ thống ban đầu và chuẩn bị tài liệu workshop.

## Nhật ký công việc

| Nhiệm vụ | Trạng thái | Bắt đầu | Hoàn thành |
| --- | --- | --- | --- |
| Rà soát kiến trúc, thông số thành phần AWS và bằng chứng triển khai | Hoàn thành | 27/07/2026 | 27/07/2026 |
| Hoàn thiện 6 module tài liệu Workshop 5 (Overview, Prerequisites, Backend Deployment, Extension Setup, Study App, Cleanup) | Hoàn thành | 28/07/2026 | 28/07/2026 |
| Cập nhật đề xuất dự án (`content/2-Proposal`) — mục tiêu, kiến trúc, lộ trình, ngân sách, lộ trình workshop | Hoàn thành | 29/07/2026 | 29/07/2026 |
| Chạy luồng demo trực tiếp trên `https://axiza.net` và `https://api.axiza.net` và tiến hành kiểm thử tích hợp | Hoàn thành | 30/07/2026 | 31/07/2026 |
| Xác minh các lệnh dọn dẹp tài nguyên (`aws route53 change-resource-record-sets`, `aws s3 rm`, `sam delete`) | Hoàn thành | 31/07/2026 | 31/07/2026 |
| Rà soát ban đầu tài liệu workshop và cấu hình trang tĩnh | Hoàn thành | 31/07/2026 | 31/07/2026 |

## Kết quả đạt được

- Đã xuất bản đầy đủ 6 module tài liệu Workshop 5 bằng cả tiếng Anh và tiếng Việt.
- Hoàn thành kiểm thử tích hợp end-to-end trên môi trường domain trực tiếp.
- Xác minh các script teardown hoạt động tốt, loại bỏ hoàn toàn chi phí AWS phát sinh sau workshop.
- Hoàn thành rà soát hệ thống ban đầu và tài liệu workshop.
