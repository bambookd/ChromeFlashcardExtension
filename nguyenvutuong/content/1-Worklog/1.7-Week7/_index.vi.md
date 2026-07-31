---
title: "Nhật ký công việc Tuần 7"
date: 2026-06-15
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Tuần 7 — 27/07 – 31/07/2026

## Mục tiêu

Các mục tiêu trọng tâm cho Tuần 7 bao gồm:

* Đóng gói, chuẩn hóa và rà soát toàn bộ bộ tài liệu thực hành Workshop 5 gồm 6 bài hướng dẫn chi tiết ([`content/5-Workshop`](file:///Users/axiza/Documents/GitHub/ChromeFlashcardExtension/nguyenvutuong/content/5-Workshop/_index.vi.md)).
* Đánh giá tổng thể kiến trúc kỹ thuật hệ thống, bảng thông số dịch vụ AWS và các liên kết bảo mật tích hợp.
* Thực hiện kiểm thử tích hợp thực tế trên các đầu tên miền tùy chỉnh live `https://axiza.net` và `https://api.axiza.net`.
* Xác minh kịch bản tự động hóa gỡ bỏ tài nguyên đám mây (`sam delete --no-prompts` và giải phóng bản ghi Route 53).

## Các Công việc Đã Thực hiện

| Nhiệm vụ | Trạng thái | Ngày Bắt đầu | Ngày Hoàn thành |
| :--- | :--- | :--- | :--- |
| Rà soát và đánh giá toàn bộ kiến trúc thành phần AWS, mô hình phân quyền bảo mật và thông số hạ tầng triển khai. | ✅ Hoàn thành | 27/07/2026 | 27/07/2026 |
| Biển soạn, định dạng và hoàn thiện 6 bài thực hành Workshop 5 (Tổng quan, Yêu cầu Môi trường, Deploy Backend SAM, Extension, Study Client, Cleanup). | ✅ Hoàn thành | 28/07/2026 | 28/07/2026 |
| Cập nhật bộ tài liệu Đề xuất Dự án (`content/2-Proposal`) đồng bộ các mục tiêu kiến trúc, ngân sách đám mây và lộ trình thực thi. | ✅ Hoàn thành | 29/07/2026 | 29/07/2026 |
| Kiểm thử tích hợp thực tế các tính năng thu thập, đồng bộ và ôn tập thẻ trên các tên miền tùy chỉnh `https://axiza.net` và `https://api.axiza.net`. | ✅ Hoàn thành | 30/07/2026 | 30/07/2026 |
| Xác minh các lệnh tự động dọn dẹp tài nguyên (`aws route53 change-resource-record-sets`, `aws s3 rm`, `sam delete --no-prompts`) đảm bảo không phát sinh chi phí duy trì. | ✅ Hoàn thành | 31/07/2026 | 31/07/2026 |

## Kết quả Đạt được

* Đăng tải thành công bộ tài liệu 6 bài thực hành thuộc Workshop 5 chuẩn hóa bằng cả tiếng Anh và tiếng Việt.
* Xác minh vận hành ổn định các luồng nghiệp vụ ứng dụng trên tên miền tùy chỉnh `https://axiza.net` và `https://api.axiza.net`.
* Xác minh tính chính xác của quy trình dọn dẹp tự động hóa tài nguyên đám mây, triệt tiêu nguy cơ phát sinh chi phí duy trì ngoài ý muốn.