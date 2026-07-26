---
title: "Blog 1"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 3.1. </b> "
---
{{% notice warning %}}
⚠️ **Lưu ý:** Các thông tin dưới đây chỉ nhằm mục đích tham khảo, vui lòng **không sao chép nguyên văn** cho bài báo cáo của bạn kể cả warning này.
{{% /notice %}}

# SESSION POLICIES TRONG AMAZON EKS POD IDENTITY

Amazon EKS Pod Identity đã hỗ trợ tính năng Session Policies, cho phép thu hẹp quyền hạn IAM một cách linh hoạt và chính xác cho từng pod mà không cần tạo thêm nhiều IAM role riêng biệt. Đây là cải tiến quan trọng giúp thực thi nguyên tắc quyền tối thiểu (least privilege) hiệu quả hơn trong môi trường Kubernetes quy mô lớn.

Các điểm cốt lõi cần nắm:

* **Session Policy**: Là một IAM policy dạng inline được chỉ định khi khởi tạo hoặc cập nhật Pod Identity Association.
* **Cơ chế phân quyền**: Quyền hạn thực tế là giao tập hợp (intersection) giữa quyền của IAM role và Session Policy. Do đó, Session Policy chỉ có tác dụng thu hẹp chứ không thể mở rộng quyền hạn.
* **Tránh dư thừa quyền**: Ngăn chặn tình trạng cấp thừa quyền (over-permissioning) khi dùng chung một IAM role cho nhiều workload có nhu cầu truy cập khác nhau.
* **Hỗ trợ đa tài khoản**: Hỗ trợ phân quyền trong cùng tài khoản (same-account) lẫn khác tài khoản (cross-account qua cơ chế IAM role chaining).
* **Tối ưu quản trị**: Giảm thiểu đáng kể số lượng IAM role cần quản lý, tránh chạm ngưỡng giới hạn (quota) IAM trong các cụm cluster lớn.
* **Cấu hình thuận tiện**: Dễ dàng cấu hình thông qua AWS Management Console, AWS CLI hoặc AWS SDK khi thiết lập liên kết (association) giữa Kubernetes ServiceAccount và IAM role.

Tính năng này đặc biệt hữu ích khi nhiều ứng dụng chia sẻ chung một IAM role nhưng cần giới hạn phạm vi truy cập khác nhau (ví dụ: một pod chỉ được đọc từ S3 bucket chỉ định, trong khi pod khác chỉ được phép gọi một số API cụ thể).

...Hình ảnh...

...Link...

...Hướng dẫn...