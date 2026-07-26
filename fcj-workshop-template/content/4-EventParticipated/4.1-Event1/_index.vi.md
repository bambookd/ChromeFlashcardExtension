---
title: "Event 1"
date: 2024-01-01
weight: 1
chapter: false
pre: " <b> 4.1. </b> "
---

{{% notice warning %}}
⚠️ **Lưu ý:** Các thông tin dưới đây chỉ nhằm mục đích tham khảo, vui lòng **không sao chép nguyên văn** cho bài báo cáo của bạn kể cả warning này.
{{% /notice %}}

# Bài thu hoạch: “GenAI-powered App-DB Modernization Workshop”

### Mục đích sự kiện

- Chia sẻ các thực hành tốt nhất (best practices) trong thiết kế và phát triển ứng dụng hiện đại.
- Giới thiệu phương pháp thiết kế hướng tên miền (Domain-Driven Design - DDD) và kiến trúc hướng sự kiện (Event-Driven Architecture).
- Hướng dẫn tiêu chí lựa chọn các dịch vụ điện toán (compute services) phù hợp cho từng bài toán.
- Giới thiệu các công cụ AI thế hệ mới hỗ trợ tự động hóa trong vòng đời phát triển phần mềm (SDLC).

### Diễn giả tham dự

- **Jignesh Shah** - Director, Open Source Databases
- **Erica Liu** - Sr. GTM Specialist, AppMod
- **Fabrianne Effendi** - Assc. Specialist SA, Serverless Amazon Web Services

### Nội dung nổi bật

#### Tác động tiêu cực của kiến trúc monolith truyền thống

- **Chậm trễ phát hành**: Thời gian đưa sản phẩm ra thị trường kéo dài -> Bỏ lỡ cơ hội kinh doanh.
- **Vận hành thiếu tối ưu**: Giảm năng suất làm việc và làm gia tăng chi phí vận hành hạ tầng.
- **Rủi ro an toàn thông tin**: Khó tuân thủ các chuẩn mực bảo mật -> Nguy cơ mất an ninh dữ liệu và ảnh hưởng uy tín doanh nghiệp.

#### Chuyển đổi sang kiến trúc Microservices

Chuyển đổi hệ thống thành dạng module độc lập – trong đó từng chức năng đóng vai trò là một **dịch vụ riêng biệt** giao tiếp với nhau qua **sự kiện (events)** dựa trên 3 trụ cột cốt lõi:

- **Quản lý hàng đợi (Queue Management)**: Xử lý các tác vụ bất đồng bộ linh hoạt.
- **Chiến lược bộ nhớ đệm (Caching Strategy)**: Tối ưu hóa hiệu năng và tốc độ phản hồi.
- **Xử lý thông điệp (Message Handling)**: Đảm bảo giao tiếp linh hoạt, tin cậy giữa các dịch vụ.

#### Phương pháp Thiết kế Hướng tên miền (Domain-Driven Design - DDD)

- **Quy trình 4 bước thực thi**: Xác định sự kiện nghiệp vụ (Domain Events) -> Sắp xếp dòng thời gian -> Xác định các tác nhân (Actors) -> Phân vùng ngữ cảnh (Bounded Contexts).
- **Case study thực tế**: Phân tích ví dụ áp dụng DDD cho hệ thống quản lý nhà sách.
- **Sơ đồ liên kết ngữ cảnh (Context Mapping)**: 7 mô hình tích hợp giữa các Bounded Context.

#### Kiến trúc Hướng sự kiện (Event-Driven Architecture)

- **3 mô hình tích hợp chính**: Publish/Subscribe, Point-to-point và Streaming.
- **Lợi ích vượt trội**: Giảm độ phụ thuộc (Loose coupling), co giãn linh hoạt (Scalability) và tăng khả năng chịu lỗi (Resilience).
- **So sánh Sync vs Async**: Phân tích rõ các ưu/nhược điểm và sự đánh đổi (trade-offs) giữa giao tiếp đồng bộ và bất đồng bộ.

#### Tiến trình Phát triển Điện toán (Compute Evolution)

- **Mô hình trách nhiệm chia sẻ**: Quá trình chuyển dịch từ EC2 -> ECS -> Fargate -> Lambda.
- **Lợi ích của Serverless**: Không tốn công quản lý máy chủ, tự động mở rộng theo lưu lượng thực tế và tối ưu hóa chi phí sử dụng.
- **Function vs Container**: Tiêu chí lựa chọn mô hình điện toán phù hợp.

#### Trợ lý AI Amazon Q Developer

- **Tự động hóa chu trình SDLC**: Hỗ trợ xuyên suốt từ khâu lập kế hoạch đến bảo trì hệ thống.
- **Chuyển đổi mã nguồn tự động**: Nâng cấp phiên bản Java, hiện đại hóa ứng dụng .NET.
- **AWS Transform Agents**: Hỗ trợ chuyển đổi hạ tầng từ VMware, Mainframe và .NET.

### Bài học kinh nghiệm

#### Tư duy Thiết kế

- **Tiếp cận từ bài toán kinh doanh (Business-First Approach)**: Luôn bắt đầu từ yêu cầu nghiệp vụ thực tế thay vì tập trung thuần túy vào công nghệ.
- **Ngôn ngữ chung (Ubiquitous Language)**: Tầm quan trọng của việc xây dựng bộ thuật ngữ thống nhất giữa đội ngũ kinh doanh (business) và kỹ thuật (tech).
- **Phân vùng ngữ cảnh (Bounded Contexts)**: Phương pháp xác định và quản trị độ phức tạp trong các hệ thống quy mô lớn.

#### Kiến trúc Kỹ thuật

- **Kỹ thuật Event Storming**: Phương pháp trực quan để mô hình hóa toàn bộ quy trình nghiệp vụ.
- Ưu tiên sử dụng **giao tiếp hướng sự kiện (Event-driven)** thay cho các lời gọi hàm đồng bộ thông thường.
- **Mô hình tích hợp**: Hiểu rõ khi nào nên sử dụng Sync, Async, Pub/Sub hay Streaming.
- **Lựa chọn hạ tầng**: Bộ tiêu chí lựa chọn linh hoạt từ Máy ảo (VM) -> Container -> Serverless.

#### Chiến lược Hiện đại hóa

- **Triển khai theo lộ trình (Phased Approach)**: Xây dựng lộ trình nâng cấp từng bước rõ ràng, tránh vội vàng.
- **Khung 7Rs**: Lựa chọn chiến lược dịch chuyển phù hợp với đặc thù từng ứng dụng.
- **Đo lường hiệu quả (ROI)**: Cân bằng giữa việc cắt giảm chi phí và nâng cao tính linh hoạt của doanh nghiệp.

### Định hướng ứng dụng thực tế

- **Áp dụng DDD cho dự án**: Tổ chức các phiên Event Storming làm việc cùng bộ phận nghiệp vụ.
- **Tái cấu trúc Microservices**: Sử dụng Bounded Contexts để phân định ranh giới rõ ràng cho từng dịch vụ.
- **Triển khai Mô hình Hướng sự kiện**: Thay thế các lời gọi API đồng bộ bằng cơ chế truyền tin nhắn bất đồng bộ.
- **Ứng dụng Serverless**: Thử nghiệm triển khai AWS Lambda cho các tác vụ xử lý phù hợp.
- **Ứng dụng Amazon Q Developer**: Tích hợp công cụ AI vào quy trình làm việc hàng ngày nhằm nâng cao năng suất lập trình.

### Trải nghiệm & Cảm nhận cá nhân

Tham gia workshop **“GenAI-powered App-DB Modernization”** là một trải nghiệm rất bổ ích, giúp tôi hình thành cái nhìn toàn diện về quy trình hiện đại hóa ứng dụng và cơ sở dữ liệu trên đám mây. Một số điểm nhấn đáng chú ý:

#### Học hỏi từ các chuyên gia hàng đầu
- Các diễn giả đến từ AWS và các tập đoàn công nghệ lớn đã chia sẻ nhiều kinh nghiệm thực chiến giá trị trong thiết kế hệ thống.
- Qua các case study thực tế, tôi nắm vững cách đưa **Domain-Driven Design (DDD)** và **Event-Driven Architecture** vào giải quyết bài toán lớn.

#### Trải nghiệm kỹ thuật thực tế
- Phiên thực hành **Event Storming** giúp tôi trực tiếp trải nghiệm phương pháp mô hình hóa nghiệp vụ thành các sự kiện domain.
- Hiểu cách phân tách ứng dụng thành các **microservices** độc lập và thiết lập **bounded contexts** để kiểm soát độ phức tạp.
- Phân tích chi tiết sự đánh đổi giữa **synchronous và asynchronous communication**, cũng như các mô hình tích hợp phổ biến.

#### Khám phá công cụ AI tiên tiến
- Trực tiếp tìm hiểu trợ lý AI **Amazon Q Developer** hỗ trợ toàn bộ vòng đời phát triển phần mềm.
- Nắm bắt phương pháp tự động hóa chuyển đổi mã nguồn và mô hình serverless với **AWS Lambda** để tăng tốc phát triển.

#### Kết nối và giao lưu
- Sự kiện tạo không gian trao đổi trực tiếp giữa học viên, chuyên gia và doanh nghiệp, nâng cao kỹ năng giao tiếp và ngôn ngữ chung giữa hai góc nhìn kỹ thuật - kinh doanh.

> **Đánh giá tổng quan:** Sự kiện không chỉ mang lại khối lượng kiến thức kỹ thuật phong phú mà còn định hình lại tư duy thiết kế hệ thống, giúp tôi tự tin hơn trong việc hiện đại hóa ứng dụng và phối hợp hiệu quả trong môi trường làm việc thực tế.
