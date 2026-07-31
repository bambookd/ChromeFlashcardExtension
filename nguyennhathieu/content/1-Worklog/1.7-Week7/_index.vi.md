---
title: "Nhật ký công việc Tuần 7"
date: 2026-07-27
weight: 7
chapter: false
pre: " <b> 1.7. </b> "
---

# Tuần 7 — 27/07 – 31/07/2026

## Tổng quan

Hoàn thiện nội dung tài liệu Workshop 5, kiểm thử tích hợp tên miền tùy chỉnh trên các endpoint sản xuất, thực hiện đánh giá hệ thống ban đầu và xác minh quy trình tự động teardown giải phóng tài nguyên.

## Công việc cần thực hiện

* Biên soạn hoàn chỉnh bộ tài liệu hướng dẫn và nội dung kỹ thuật cho Workshop 5.
* Kiểm thử tích hợp thực tế luồng định tuyến tên miền tùy chỉnh tại `https://axiza.net` và `https://api.axiza.net`.
* Thực nghiệm và xác minh câu lệnh xóa tài nguyên tự động (`sam delete --no-prompts`) cùng quy trình gỡ bỏ bản ghi DNS trên Route 53.

## Công việc đã thực hiện

* Xây dựng tài liệu chi tiết cho Workshop 5 bao gồm sơ đồ kiến trúc AWS Serverless và hướng dẫn triển khai bằng AWS SAM.
* Thực hiện bài kiểm thử tích hợp end-to-end kết nối từ Chrome Extension đến API sản xuất (`https://api.axiza.net`) và giao diện Web (`https://axiza.net`).
* Đánh giá và kiểm tra lệnh dọn dẹp hệ thống `sam delete --no-prompts`, xác nhận thu hồi hoàn toàn chứng chỉ ACM SSL và các bản ghi Route 53 hosted zone.
* Phân tích và tài liệu hóa sự khác biệt kiến trúc giữa HTTP API và WebSocket API phục vụ định hướng mở rộng tính năng game realtime.
* Biên dịch và kiểm tra hiển thị website Hugo song ngữ phục vụ đợt rà soát tiến độ kỹ thuật.

## Kết quả

Tài liệu Workshop 5 được hoàn tất, tên miền tùy chỉnh hoạt động ổn định và quy trình teardown tự động hóa được xác minh thành công.

