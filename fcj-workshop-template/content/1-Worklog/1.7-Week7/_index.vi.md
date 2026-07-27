---
title: "Nhật ký công việc Tuần 7"
date: 2026-06-15
weight: 1
chapter: false
pre: " <b> 1.7. </b> "
---

# Tuần 7 — 27/07 – 02/08/2026

## Mục tiêu

Các mục tiêu cho Tuần 7 bao gồm:

* Tổng hợp toàn bộ tài liệu kỹ thuật và hoàn thiện các nhật ký công việc thực tập.
* Biên soạn và chuẩn hóa bộ tài liệu Workshop 5 gồm 6 bài thực hành chi tiết ([`content/5-Workshop`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/fcj-workshop-template/content/5-Workshop/_index.vi.md)).
* Xây dựng kịch bản kiểm thử demo bao gồm các thao tác lưu từ vựng từ Extension, ôn tập thẻ Active Recall và xuất dữ liệu S3 Pre-signed URL.
* Kiểm thử các script tự động dọn dẹp tài nguyên (xóa bản ghi Route 53 và hủy stack CloudFormation `sam delete --no-prompts`).
* Tối ưu hóa cấu trúc dự án, build ứng dụng Hugo static site và chuẩn bị hồ sơ bàn giao cuối cùng.

## Các Công việc Đã Thực hiện

| Nhiệm vụ | Trạng thái | Ngày Bắt đầu | Ngày Hoàn thành |
| :--- | :--- | :--- | :--- |
| Tổng kết toàn bộ kiến trúc kỹ thuật, bảng thông số thành phần AWS và các bằng chứng triển khai đám mây. | ✅ Hoàn thành | 27/07/2026 | 27/07/2026 |
| Xây dựng và tinh chỉnh bộ tài liệu Workshop 5 (Tổng quan, Yêu cầu, Deploy Backend, Cấu hình Extension, Study Web App, Cleanup). | ✅ Hoàn thành | 28/07/2026 | 28/07/2026 |
| Cập nhật tài liệu đề xuất dự án (`content/2-Proposal`) thống nhất các mục tiêu, kiến trúc, lộ trình 7 tuần, ngân sách và lộ trình workshop. | ✅ Hoàn thành | 29/07/2026 | 29/07/2026 |
| Kiểm thử kịch bản demo hệ thống trên các tên miền thực tế `https://axiza.net` và `https://api.axiza.net`. | ✅ Hoàn thành | 30/07/2026 | 31/07/2026 |
| Xác minh các lệnh tự động giải phóng tài nguyên (`aws route53 change-resource-record-sets`, `aws s3 rm`, `sam delete`). | ✅ Hoàn thành | 31/07/2026 | 01/08/2026 |
| Biên dịch lại trang web bằng Hugo (`hugo`) và thực hiện dọn dẹp tối ưu hóa mã nguồn. | ✅ Hoàn thành | 02/08/2026 | 02/08/2026 |

## Kết quả Đạt được

* Hoàn thành bộ báo cáo kỹ thuật và đề xuất dự án tổng thể.
* Đăng tải đầy đủ bộ tài liệu 6 bài thực hành thuộc Workshop 5 bằng cả tiếng Anh và tiếng Việt.
* Xác minh thành công các script tự động gỡ bỏ tài nguyên nhằm bảo đảm triệt tiêu hoàn toàn chi phí AWS phát sinh sau workshop.
* Biên dịch thành công bộ tài nguyên web tĩnh Hugo sạch tại `fcj-workshop-template/public/`.