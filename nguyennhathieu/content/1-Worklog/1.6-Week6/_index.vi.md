---
title: "Nhật ký công việc Tuần 6"
date: 2026-07-20
weight: 6
chapter: false
pre: " <b> 1.6. </b> "
---

# Tuần 6 — 20/07 – 24/07/2026

## Tổng quan

Phát triển game luyện từ.

### Công việc

* Tách Game thành trang độc lập với Study.
* Xây dựng WebSocket server local bằng thư viện `ws`.
* Kiểm tra khả năng chuyển realtime lên AWS.


### Vấn đề phát sinh

Lambda HTTP API hiện tại không duy trì kết nối WebSocket hoặc trạng thái phòng trong bộ nhớ. Việc chuyển realtime lên AWS cần API Gateway WebSocket API, Lambda handlers riêng và nơi lưu trạng thái phòng/kết nối. 