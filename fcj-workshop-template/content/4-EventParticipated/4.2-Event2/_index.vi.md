---
title: "Sự kiện 2"
date: 2026-07-11
weight: 2
chapter: false
pre: " <b> 2. </b> "
---

# Bài thu hoạch Sự kiện 2: AWS Cloud, Monitoring và Bảo mật ứng dụng - 11/07/2026

## 1. Tổng quan

Sự kiện tập trung vào các cam kết mức dịch vụ (SLA), khả năng quan sát hệ thống (observability), chiến lược luyện thi chứng chỉ AWS và đánh giá bảo mật tự động.

Mục tiêu chính giúp người tham dự hiểu rằng các chỉ số hạ tầng xanh chưa bảo đảm trải nghiệm tốt cho người dùng, đồng thời các cơ chế bảo mật cần được đưa vào toàn bộ vòng đời phát triển ứng dụng.
![11-07-2026](/images/4-event/1107.jpg)

## 2. Nội dung nổi bật

### 2.1. SLA và Monitoring: Những chỉ số thực sự quan trọng - Son Nguyen

Phiên chia sẻ giải thích sự khác biệt giữa trạng thái hạ tầng và trải nghiệm người dùng thực tế.

Service Level Agreement (SLA) xác định mức dịch vụ kỳ vọng giữa nhà cung cấp và khách hàng. Tuy nhiên, SLA của cloud provider không bao phủ các lỗi tầng ứng dụng như trang đăng nhập bị hỏng hoặc kết nối cơ sở dữ liệu bị ngắt.

Các khái niệm chính bao gồm:

* **Vòng lặp Quản trị Rủi ro**: Nhận diện rủi ro $\rightarrow$ Giám sát tín hiệu $\rightarrow$ Phản hồi $\rightarrow$ Cải tiến.
* **Các Tầng Giám sát**: Hạ tầng, ứng dụng, trải nghiệm người dùng (customer journey) và chỉ số kinh doanh.
* **Thông điệp cốt lõi**: *"Hạ tầng ổn định $\neq$ Trải nghiệm người dùng tốt"*.

### 2.2. Phương pháp Luyện thi AWS Cloud Practitioner - Huy Ngo

Chủ đề hướng dẫn phương pháp chuẩn bị cho kỳ thi chứng chỉ **AWS Certified Cloud Practitioner (CLF-C02)** theo 4 miền kiến thức:

* **Domain 1**: Khái niệm Đám mây (24%)
* **Domain 2**: Bảo mật và Tuân thủ (30%)
* **Domain 3**: Công nghệ và Dịch vụ Cloud (34%)
* **Domain 4**: Thanh toán, Định giá và Hỗ trợ (12%)

Diễn giả khuyến nghị liên kết từ khóa use case, thực hành thực tế trên AWS Free Tier, phân tích nguyên nhân câu sai trong đề thi thử và quản lý thời gian thi hiệu quả.

### 2.3. Bảo mật Ứng dụng Web với AWS Security Agent - Thinh Nguyen

Chủ đề giới thiệu quy trình đánh giá bảo mật tự động dựa trên Amazon Bedrock:

* **Rà soát Bảo mật Thiết kế**: Phân tích sơ đồ kiến trúc và template IaC theo các khung quy chuẩn PCI DSS, NIST và Well-Architected.
* **Rà soát Bảo mật Mã nguồn**: Tích hợp quét tự động Pull Request để phát hiện lỗ hổng và lộ khóa bí mật (secrets).
* **Kiểm thử Thâm nhập Tự động (Automated Pentesting)**: Tự động thực thi kiểm thử đa bước và cung cấp đồ thị tấn công kèm bằng chứng xác thực.

Một số hạn chế gồm rào cản xác thực (MFA/mTLS), ngữ cảnh logic nghiệp vụ và chi phí thời gian thực thi của agent.

## 3. Những gì học được

Từ Sự kiện 2, mình rút ra được các bài học:

* Giám sát hệ thống cần ưu tiên các chỉ số hành trình người dùng thay vì chỉ theo dõi CPU/RAM hạ tầng.
* Mô hình Trách nhiệm Phân chia (Shared Responsibility Model) đòi hỏi lập trình viên phải chịu trách nhiệm về an ninh và độ tin cậy của ứng dụng.
* Các công cụ AI Security Agent hỗ trợ tăng tốc rà soát thiết kế và code review nhưng vẫn cần sự giám sát của con người.

## 4. Phản hồi

Sự kiện mang lại sự kết nối hiệu quả giữa vận hành cloud thực tế, hướng dẫn chứng chỉ và các công cụ DevSecOps hiện đại.

## 5. Kỳ vọng

Sau Sự kiện 2, mình kỳ vọng sẽ:

* Tiếp tục ôn luyện cho chứng chỉ AWS Cloud Practitioner.
* Áp dụng tư duy giám sát hành trình người dùng vào dự án thực tập.
* Rà soát kiến trúc ứng dụng và template hạ tầng để phát hiện lỗi bảo mật sớm trong quá trình phát triển.
