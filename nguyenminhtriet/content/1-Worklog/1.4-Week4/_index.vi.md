---
title: "Nhật ký công việc Tuần 4"
date: 2026-07-06
weight: 4
chapter: false
pre: " <b> 1.4. </b> "
---

# Tuần 4 — 06/07 – 12/07/2026

## Trọng tâm

Chuẩn hóa toàn bộ tài liệu, kiểm tra các lỗ hổng bảo mật và tinh chỉnh giao diện UI trước khi triển khai thực tế trên điện toán đám mây.

## Các công việc đã thực hiện

- **Chuẩn hóa tài liệu:** Biên soạn đầy đủ thông số thiết kế — sơ đồ hệ thống, nhiệm vụ của từng thành phần, luồng dữ liệu và hợp đồng API Contract schemas.
- **Đánh giá bảo mật:** Rà soát toàn bộ hệ thống để tìm lỗ hổng — quy tắc CORS origin, kiểm tra JWT claims, phân quyền IAM tối thiểu và thiết lập S3 Block Public Access.
- **Tinh chỉnh UI/UX:** Tái thiết kế dialog nổi của extension và dashboard ứng dụng Study để cải thiện độ tương thích và hiển thị rõ ràng các trạng thái phản hồi.
- **Checklist trước triển khai:** Xây dựng danh mục kiểm tra chi tiết cần thực hiện trước khi deploy lần đầu lên AWS.

## Kết quả đạt được

- Xuất bản 11 tài liệu thiết kế và API contract chi tiết.
- Phát hiện 8 rủi ro kỹ thuật cụ thể trước khi phát sinh chi phí cloud (ví dụ: cấu hình chính xác CORS origin).
- Giao diện extension và web app sạch đẹp, mượt mà và tương thích tốt hơn.
