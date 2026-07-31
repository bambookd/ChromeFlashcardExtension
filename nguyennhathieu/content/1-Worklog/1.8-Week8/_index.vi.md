---
title: "Nhật ký công việc Tuần 8"
date: 2026-07-27
weight: 8
chapter: false
pre: " <b> 1.8. </b> "
---

# Tuần 8 — 03/08 – 07/08/2026

## Tổng quan

Tập trung hoàn thiện giao diện người dùng, tối ưu hoá hiệu năng hệ thống, dọn dẹp mã nguồn, kiểm thử vận hành toàn diện end-to-end và giảm độ trễ phản hồi trên tất cả các tầng ứng dụng.

## Công việc cần thực hiện

* Tinh chỉnh giao diện UI/UX, cải thiện trải nghiệm tương tác và dọn dẹp mã nguồn dư thừa trong Extension và ứng dụng Web.
* Kiểm thử vận hành toàn diện (E2E) nối liền giữa Chrome Extension, API Gateway, DynamoDB và Web Client.
* Tối ưu tốc độ tải tài nguyên tĩnh, giảm độ trễ khởi động lạnh (cold-start) của Lambda và hoàn thiện cơ chế xử lý ngoại tuyến (offline mode).

## Công việc đã thực hiện

* Nâng cấp giao diện popup Extension, cải thiện font chữ, bố cục phản hồi và trạng thái trực quan trong quá trình đồng bộ dữ liệu.
* Tối ưu mã nguồn backend: loại bỏ log debug không cần thiết, tái cấu trúc hàm xử lý bất đồng bộ và giảm kích thước package Lambda.
* Chạy chuỗi bài kiểm thử tích hợp quy mô lớn từ khâu lưu từ mới, tính toán thuật toán lặp lại ngắt quãng (SRS), quản lý bộ từ đến phản hồi API Gateway.
* Cấu hình header caching cho static assets và tinh chỉnh thông số bộ nhớ Lambda nhằm tối ưu thời gian phản hồi.
* Bổ sung cơ chế lưu trữ đệm tại chỗ (local storage fallback) giúp ứng dụng hoạt động mượt mà khi mất kết nối mạng.

## Kết quả

Hệ thống đạt độ ổn định và hoàn thiện cao, thời gian phản hồi API duy trì dưới 1 giây cùng khả năng đồng bộ dữ liệu ngoại tuyến tin cậy.
