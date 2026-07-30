---
title: "Nhật ký công việc Tuần 7"
date: 2026-07-27
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Tuần 7 — 27/07 – 02/08/2026

## Mục tiêu

- Hoàn thiện báo cáo kỹ thuật và tổng kết nhật ký công việc.
- Hoàn tất bộ tài liệu Workshop 5 gồm 6 module (`content/5-Workshop`).
- Chuẩn bị các kịch bản demo: lưu từ qua extension, ôn tập active recall và xuất dữ liệu qua pre-signed URL S3.
- Xác minh các script dọn dẹp tài nguyên — xóa Route 53 records và chạy `sam delete --no-prompts` để hủy stack.
- Dọn dẹp dự án, build trang web tĩnh Hugo và chuẩn bị hồ sơ nộp bài cuối kỳ.

## Nhật ký công việc

| Nhiệm vụ | Trạng thái | Bắt đầu | Hoàn thành |
| --- | --- | --- | --- |
| Rà soát kiến trúc, thông số thành phần AWS và bằng chứng triển khai | Hoàn thành | 27/07/2026 | 27/07/2026 |
| Hoàn thiện 6 module tài liệu Workshop 5 (Overview, Prerequisites, Backend Deployment, Extension Setup, Study App, Cleanup) | Hoàn thành | 28/07/2026 | 28/07/2026 |
| Cập nhật đề xuất dự án (`content/2-Proposal`) — mục tiêu, kiến trúc, lộ trình, ngân sách, lộ trình workshop | Hoàn thành | 29/07/2026 | 29/07/2026 |
| Chạy luồng demo trực tiếp trên `https://axiza.net` và `https://api.axiza.net` | Hoàn thành | 30/07/2026 | 31/07/2026 |
| Xác minh các lệnh dọn dẹp tài nguyên (`aws route53 change-resource-record-sets`, `aws s3 rm`, `sam delete`) | Hoàn thành | 31/07/2026 | 01/08/2026 |
| Build lại trang web bằng Hugo (`hugo`) và hoàn tất dọn dẹp mã nguồn | Hoàn thành | 02/08/2026 | 02/08/2026 |

## Kết quả đạt được

- Báo cáo kỹ thuật và đề xuất dự án đã được hoàn thiện.
- Đã xuất bản đầy đủ 6 module tài liệu Workshop 5 bằng cả tiếng Anh và tiếng Việt.
- Xác minh các script teardown hoạt động tốt, loại bỏ hoàn toàn chi phí AWS phát sinh sau workshop.
- Build thành công trang web tĩnh Hugo sạch tại `fcj-workshop-template/public/`.
